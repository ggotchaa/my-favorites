import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { CalAngularService } from '@cvx/cal-angular';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import { firstValueFrom, from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
const DEFAULT_API_BASE_URL = environment.apiBaseUrl;

type RequestConfig = AxiosRequestConfig;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly calService: CalAngularService,
    private readonly notificationService: NotificationService,
    @Optional() @Inject(API_BASE_URL) baseUrl?: string
  ) {
    this.client = axios.create({
      baseURL: baseUrl ?? DEFAULT_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      if (this.isBackendRequest(config)) {
        this.logBackendRequest(config);

        try {
          const token = await this.acquireAccessToken();

          const headers = AxiosHeaders.from(config.headers ?? {});
          headers.set('Authorization', `Bearer ${token}`);
          config.headers = headers;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to acquire AAD token for backend request', error);
          throw error;
        }
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = this.extractErrorMessage(error);
        if (message) {
          this.notificationService.notifyError(message, error.response?.status);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  get<T>(url: string, config?: RequestConfig): Observable<T> {
    return this.send<T>({ ...config, method: 'get', url });
  }

  post<T>(url: string, data?: unknown, config?: RequestConfig): Observable<T> {
    return this.send<T>({ ...config, method: 'post', url, data });
  }

  put<T>(url: string, data?: unknown, config?: RequestConfig): Observable<T> {
    return this.send<T>({ ...config, method: 'put', url, data });
  }

  patch<T>(url: string, data?: unknown, config?: RequestConfig): Observable<T> {
    return this.send<T>({ ...config, method: 'patch', url, data });
  }

  delete<T>(url: string, config?: RequestConfig): Observable<T> {
    return this.send<T>({ ...config, method: 'delete', url });
  }

  private send<T>(config: RequestConfig): Observable<T> {
    return from(
      this.client
        .request<T>(config as InternalAxiosRequestConfig)
        .then((response: AxiosResponse<T>) => response.data)
    );
  }

  private async acquireAccessToken(): Promise<string> {
    const scopes = this.getUserImpersonationScopes();

    if (scopes.length === 0) {
      throw new Error('Unable to determine user_impersonation scope for token request');
    }

    const result = await firstValueFrom(this.calService.getAADToken(scopes));

    if (typeof result === 'string') {
      return result;
    }

    if (result && typeof result === 'object') {
      const possibleToken =
        'accessToken' in result
          ? result.accessToken
          : 'token' in result
            ? (result as { token?: string }).token
            : 'value' in result
              ? (result as { value?: string }).value
              : undefined;

      if (typeof possibleToken === 'string' && possibleToken) {
        return possibleToken;
      }
    }

    throw new Error('Received an unexpected response from getAADToken');
  }

  private getUserImpersonationScopes(): string[] {
    const scope = this.resolveUserImpersonationScope();
    return scope ? [scope] : [];
  }

  private logBackendRequest(config: InternalAxiosRequestConfig): void {
    const method = (config.method ?? 'get').toUpperCase();
    const baseUrl = config.baseURL ?? this.client.defaults.baseURL ?? '';
    const relativeUrl = config.url ?? '';
    let fullUrl = relativeUrl;

    if (baseUrl) {
      try {
        fullUrl = new URL(relativeUrl, baseUrl).toString();
      } catch {
        fullUrl = `${baseUrl}${relativeUrl}`;
      }
    }

    // eslint-disable-next-line no-console
    console.info(`[ApiService] ${method} ${fullUrl}`);
  }

  private isBackendRequest(config: InternalAxiosRequestConfig): boolean {
    const url = config.url ?? '';

    if (!url) {
      return false;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const baseUrl = this.client.defaults.baseURL ?? '';
      return baseUrl ? url.startsWith(baseUrl) : true;
    }

    return true;
  }

  private resolveUserImpersonationScope(): string | null {
    const { baseURLScope, oidcScopes } = environment as {
      baseURLScope?: unknown;
      oidcScopes?: unknown;
    };

    if (typeof baseURLScope === 'string' && baseURLScope.length > 0) {
      if (baseURLScope.includes('user_impersonation')) {
        return baseURLScope;
      }

      const normalized = baseURLScope.endsWith('/')
        ? `${baseURLScope}user_impersonation`
        : `${baseURLScope}/user_impersonation`;

      return normalized;
    }

    if (Array.isArray(oidcScopes)) {
      const match = oidcScopes.find(
        (scope): scope is string =>
          typeof scope === 'string' &&
          scope.toLowerCase().includes('user_impersonation')
      );

      if (match) {
        return match;
      }
    }

    return null;
  }

  private normalizeError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; title?: string; detail?: string }
        | undefined;
      const message =
        data?.message?.trim() || data?.detail?.trim() || data?.title?.trim() || error.message;
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('An unexpected error occurred.');
  }

  private extractErrorMessage(error: unknown): string | null {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; title?: string; detail?: string }
        | undefined;

      if (typeof data?.message === 'string' && data.message.trim().length > 0) {
        return data.message;
      }

      if (typeof data?.detail === 'string' && data.detail.trim().length > 0) {
        return data.detail;
      }

      if (typeof data?.title === 'string' && data.title.trim().length > 0) {
        return data.title;
      }

      if (typeof error.message === 'string' && error.message.trim().length > 0) {
        return error.message;
      }
    } else if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return null;
  }
}
