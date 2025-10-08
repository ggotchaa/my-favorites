import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
const DEFAULT_API_BASE_URL = environment.apiBaseUrl;

type RequestConfig = AxiosRequestConfig;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly client: AxiosInstance;

  constructor(@Optional() @Inject(API_BASE_URL) baseUrl?: string) {
    this.client = axios.create({
      baseURL: baseUrl ?? DEFAULT_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.normalizeError(error))
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

  private normalizeError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('An unexpected error occurred.');
  }
}
