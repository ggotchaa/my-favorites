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
  private _account = signal<unknown | null>(null);
  private _claimsSync = signal<ICvxClaimsPrincipal | null>(null);
  private _claimsAsync = signal<ICvxClaimsPrincipal | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public read-only signals - external interface
  public readonly isSignedIn = this._isSignedIn.asReadonly();
  public readonly userName = this._userName.asReadonly();
  public readonly account = this._account.asReadonly();
  public readonly claimsSync = this._claimsSync.asReadonly();
  public readonly claims = this._claimsAsync.asReadonly();
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
          this.updateAccountDetails();

          this.calService
            .getClaims()
            .then((claims) => {
              if (claims?.name) {
                this._userName.set(claims.name);
              } else if (!this._userName()) {
                this._userName.set('');
              }

              this._claimsAsync.set(claims ?? null);
              this._isLoading.set(false);
            })
            .catch(() => {
              this._error.set('Failed to load user claims');
              this._isLoading.set(false);
            });
        } else {
          this.resetUserState();
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
        next: (claimsPrincipal: ICvxClaimsPrincipal | null) => {
          this._isSignedIn.set(true);
          this.updateAccountDetails(claimsPrincipal ?? null);
          this._claimsAsync.set(claimsPrincipal ?? null);
          this._isLoading.set(false);

          this.refreshClaimsAsync();
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
            this.resetUserState();
            this._isSignedIn.set(false);
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

  private updateAccountDetails(claims: ICvxClaimsPrincipal | null = null): void {
    const accountDetails = this.calService.getAccount();
    this._account.set(accountDetails ?? null);

    const syncClaims = claims ?? this.calService.cvxClaimsPrincipal ?? null;
    this._claimsSync.set(syncClaims);

    if (syncClaims?.name) {
      this._userName.set(syncClaims.name);
    }
  }

  private refreshClaimsAsync(): void {
    this.calService
      .getClaims()
      .then((claims) => {
        if (claims?.name) {
          this._userName.set(claims.name);
        }

        this._claimsAsync.set(claims ?? null);
      })
      .catch(() => {
        this._error.set('Failed to load user claims');
      });
  }

  private resetUserState(): void {
    this._userName.set('');
    this._account.set(null);
    this._claimsSync.set(null);
    this._claimsAsync.set(null);
  }
}