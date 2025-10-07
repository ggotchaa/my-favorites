import { Injectable, inject, signal, computed } from '@angular/core';
import { CalAngularService, ICvxClaimsPrincipal } from '@cvx/cal-angular';
import { Observable, tap, catchError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateSignalsService {
  private readonly calService = inject(CalAngularService);

  // Private writable signals - internal state
  private _isSignedIn = signal<boolean>(false);
  private _userName = signal<string>('');
  private _claims = signal<ICvxClaimsPrincipal | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public read-only signals - external interface
  public readonly isSignedIn = this._isSignedIn.asReadonly();
  public readonly userName = this._userName.asReadonly();
  public readonly claims = this._claims.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();

  constructor() {
    this.checkAuthState();
  }

  // Computed signals - derived state
  public readonly welcomeMessage = computed(() => {
    const userName = this._userName();
    const isLoading = this._isLoading();

    if (isLoading) {
      return 'Loading...';
    }
    return userName ? `Welcome ${userName}!` : 'Please Sign In.';
  });

  public readonly authStatus = computed(() => {
    const isSignedIn = this._isSignedIn();
    const isLoading = this._isLoading();
    const error = this._error();

    if (error) {
      return '❌ Error';
    }

    if (isLoading) {
      return '🔄 Loading';
    }

    return isSignedIn ? '✅ Authenticated' : '🔒 Not Authenticated';
  });

  private checkAuthState(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.calService.isUserSignedIn().subscribe({
      next: (isSignedIn: boolean) => {
        this._isSignedIn.set(isSignedIn);

        if (isSignedIn) {
          this.calService
            .getClaims()
            .then((claims) => {
              this._userName.set(claims?.name ?? '');
              this._claims.set(claims);
              this._isLoading.set(false);
            })
            .catch(() => {
              this._error.set('Failed to load user claims');
              this._isLoading.set(false);
            });
        } else {
          this._userName.set('');
          this._claims.set(null);
          this._isLoading.set(false);
        }
      },
      error: () => {
        this._error.set('Failed to check authentication status');
        this._isLoading.set(false);
      },
    });
  }

  signIn(): Observable<unknown> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.calService.userInitiatedSignIn().pipe(
      tap({
        next: (claimsPrincipal) => {
          this._isSignedIn.set(true);
          this._userName.set(claimsPrincipal?.name ?? '');
          this._claims.set(claimsPrincipal);
          this._isLoading.set(false);
        }
      }),
      catchError((error) => {
        this._error.set('Sign in failed');
        this._isLoading.set(false);
        throw error;
      })
    );
  }

  signOut(): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.calService.userInitiatedSignOut().pipe(
      tap({
        next: (success: boolean) => {
          if (success) {
            this._isSignedIn.set(false);
            this._userName.set('');
            this._claims.set(null);
          }
          this._isLoading.set(false);
        }
      }),
      catchError((error) => {
        this._error.set('Sign out failed');
        this._isLoading.set(false);
        throw error;
      })
    );
  }
}
