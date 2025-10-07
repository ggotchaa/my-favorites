import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CalAngularService } from '@cvx/cal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';
import { ParseJsonFormatPipe } from './parse-json-format.pipe';
import { EXTERNAL_LINKS } from '../../app.links';

declare function setTimeout(handler: (...args: unknown[]) => void, timeout?: number, ...args: unknown[]): number;

@Component({
  selector: 'app-aad-token',
  imports: [CommonModule, ParseJsonFormatPipe],
  templateUrl: './aad-token.component.html',
  styleUrl: './aad-token.component.css',
})
export class AadTokenComponent {
  private readonly calService = inject(CalAngularService);
  private readonly http = inject(HttpClient);
  idTokenClaims: object | null = null;
  aadToken: string | AuthenticationResult | null = null;
  accessTokenFromCache: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphApiResult: any = null;

  loadingIdTokenClaims = false;
  loadingAADToken = false;
  loadingAccessTokenFromCache = false;
  loadingGraphApi = false;
  readonly externalLinks = EXTERNAL_LINKS;

  // Tab management
  activeTab = 'id-token-claims';

  // Tab switching method
  switchTab(tabName: string) {
    this.activeTab = tabName;
  }

  onGetIdTokenClaims() {
    this.loadingIdTokenClaims = true;
    setTimeout(() => {
      this.idTokenClaims = this.calService.getIdTokenClaims();
      this.loadingIdTokenClaims = false;
    }, 500);
  }

  onGetAADToken() {
    this.loadingAADToken = true;
    this.calService.getAADToken().subscribe({
      next: (token: string | AuthenticationResult | null) => {
        setTimeout(() => {
          this.aadToken = token;
          this.loadingAADToken = false;
        }, 500);
      },
      error: () => {
        setTimeout(() => {
          this.aadToken = null;
          this.loadingAADToken = false;
        }, 500);
      },
    });
  }

  onGetAccessTokenFromCache() {
    this.loadingAccessTokenFromCache = true;
    setTimeout(() => {
      try {
        this.accessTokenFromCache = this.calService.getAccessTokenFromCache();
        this.loadingAccessTokenFromCache = false;
      } catch {
        this.accessTokenFromCache = null;
      }
      this.loadingAccessTokenFromCache = false;
    }, 500);
  }

  onCallGraphApi() {
    this.loadingGraphApi = true;
    this.calService.getAADToken().subscribe({
      next: (token: string | AuthenticationResult | null) => {
        let accessToken: string | null = null;
        if (typeof token === 'string') {
          accessToken = token;
        } else if (token && typeof token === 'object' && 'accessToken' in token) {
          accessToken = (token as AuthenticationResult).accessToken;
        }
        if (accessToken) {
          this.callGraphApi(accessToken);
        } else {
          setTimeout(() => {
            this.loadingGraphApi = false;
          }, 500);
        }
      },
      error: () => {
        setTimeout(() => {
          this.loadingGraphApi = false;
        }, 500);
      }
    });
  }

  callGraphApi(token: string) {
    this.http
      .get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: (data: unknown) => {
          this.graphApiResult = data;
          this.loadingGraphApi = false;
        },
        error: () => {
          this.loadingGraphApi = false;
          this.graphApiResult = { error: true };
        },
      });
  }
}
