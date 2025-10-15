import {Injectable} from '@angular/core';
import {BehaviorSubject, defer, from, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {CalAngularService} from '@cvx/cal-angular';
import {environment} from '../../../../environments/environment';
import {ICurrentUserProfile} from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();
  private _currentUserProfile: any;

  public set currentUserProfile(cvxClaims: any) {
    this._currentUserProfile = cvxClaims;
  }

  public get currentUserProfile(): ICurrentUserProfile {
    return this._currentUserProfile
  }

  constructor(private calService: CalAngularService) {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (token && expiry && !this.isTokenExpired(Number(expiry))) {
      this.tokenSubject.next(token);
    } else {
      this.clearToken();
    }
  }

  private isTokenExpired(expiryTime: number): boolean {
    return Date.now() + this.TOKEN_REFRESH_THRESHOLD > expiryTime;
  }

  public getToken(): Observable<string> {
    const currentToken = this.tokenSubject.value;
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (currentToken && expiry && !this.isTokenExpired(Number(expiry))) {
      return from([currentToken]);
    }

    return from(this.calService.getAADToken([environment.baseURLScope])).pipe(
      map((result) => {
        if (typeof result === 'string') {
          return result;
        } else if (
          result &&
          typeof result === 'object' &&
          'accessToken' in result
        ) {
          return result.accessToken;
        }
        throw new Error('Invalid token response');
      }),
      tap((token) => {
        this.storeToken(token);
      })
    );
  }

  private storeToken(token: string): void {
    // Set expiry to 1 hour from now (typical AAD token lifetime)
    const expiry = Date.now() + 60 * 60 * 1000;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    this.tokenSubject.next(token);
  }

  public clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.tokenSubject.next(null);
  }

  public initialize(): Observable<string> {
    return this.getToken();
  }

  public checkAccount() {
    return defer(() => this.calService.isUserSignedIn())
      .pipe(
        tap(() => {
          this.currentUserProfile = this.calService.getIdTokenClaims();
        })
      );
  }

  public checkOwner(userProfile: {preferred_username: string}, createdEmail: string): boolean {
    const email = userProfile.preferred_username;
    return email.toLowerCase() === createdEmail.toLowerCase();
  }

  public getFIO(): { firstName: string; lastName: string } {
    const name = this.currentUserProfile.name;
    let firstName: string;
    let lastName: string;

    if (name.includes(',') && name.includes('[')) {
      // example: "Batyrbayev, Kairat [Norsec Delta Projects LLP]"
      const [last, firstWithCompany] = name.split(',').map((e: string) => e.trim());
      const first = firstWithCompany.split('[')[0].trim(); // Убираем часть с компанией
      firstName = first.split(' ')[0]; // Только первое имя
      lastName = last;
    } else if (name.startsWith('Service Account')) {
      // example: "Service Account - svc-tco-core-firm-acd-autotest"
      firstName = 'Service';
      lastName = 'Account';
    } else {
      const parts = name.trim().split(' ');
      firstName = parts[0];
      lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    }
    return {firstName, lastName};
  }
}
