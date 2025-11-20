import { Injectable, inject, signal, computed } from '@angular/core';
import { CalAngularService, ICvxClaimsPrincipal } from '@cvx/cal-angular';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { isLocalEnvironment } from '../shared/utils/environment.utils';
import { UserRole } from '../shared/utils/user-roles.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthStateSignalsService {
  private readonly calService = inject(CalAngularService);
  private static readonly AUTO_SIGN_IN_STORAGE_KEY =
    'main-project.autoSignInAttempted';
  private static readonly ALLOWED_ROLES = Object.values(UserRole);
  private static readonly UNAUTHORIZED_ERROR_MESSAGE =
    'You do not have access to this application.';

  // Private writable signals - internal state
  private _isSignedIn = signal<boolean>(false);
  private _userName = signal<string>('');
  private _account = signal<unknown | null>(null);
  private _claimsSync = signal<ICvxClaimsPrincipal | null>(null);
  private _claimsAsync = signal<ICvxClaimsPrincipal | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _interactiveSignInEnabled = signal<boolean>(isLocalEnvironment());
  private _roles = signal<UserRole[]>([]);
  private _autoSignInAttempted = signal<boolean>(
    this.readAutoSignInAttemptState()
  );

  // Public read-only signals - external interface
  public readonly isSignedIn = this._isSignedIn.asReadonly();
  public readonly userName = this._userName.asReadonly();
  public readonly account = this._account.asReadonly();
  public readonly claimsSync = this._claimsSync.asReadonly();
  public readonly claims = this._claimsAsync.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly isInteractiveSignInEnabled =
    this._interactiveSignInEnabled.asReadonly();
  public readonly roles = this._roles.asReadonly();
  public readonly hasAutoSignInAttempted =
    this._autoSignInAttempted.asReadonly();
  public readonly isAuthorized = computed(() => {
    const roles = this._roles();

    if (!roles?.length) {
      return false;
    }

    return roles.some((role) =>
      AuthStateSignalsService.ALLOWED_ROLES.includes(role)
    );
  });

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
              this.updateRolesFromClaims(claims ?? null);
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

  attemptAutoSignIn(): Observable<unknown> | null {
    if (this._autoSignInAttempted() || !this._interactiveSignInEnabled()) {
      return null;
    }

    this.markAutoSignInAttempted();

    return this.performInteractiveSignIn();
  }

  signIn(): Observable<unknown> {
    if (!this._interactiveSignInEnabled()) {
      const message =
        'Interactive sign-in is disabled outside of local development.';
      this._error.set(message);
      return throwError(() => new Error(message));
    }

    return this.performInteractiveSignIn();
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
            this.clearAutoSignInAttempt();
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

    this.updateRolesFromClaims(syncClaims);
  }

  private refreshClaimsAsync(): void {
    this.calService
      .getClaims()
      .then((claims) => {
        if (claims?.name) {
          this._userName.set(claims.name);
        }

        this._claimsAsync.set(claims ?? null);
        this.updateRolesFromClaims(claims ?? null);
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
    this._roles.set([]);
  }

  private performInteractiveSignIn(): Observable<unknown> {
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
        },
      }),
      catchError((error) => {
        this._error.set("We couldn't sign you in. Please try again.");
        this._isLoading.set(false);
        throw error;
      })
    );
  }

  private markAutoSignInAttempted(): void {
    if (this._autoSignInAttempted()) {
      return;
    }

    this._autoSignInAttempted.set(true);

    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = AuthStateSignalsService.AUTO_SIGN_IN_STORAGE_KEY;

    try {
      window.sessionStorage?.setItem(storageKey, 'true');
    } catch (error) {
      console.warn('Unable to persist auto sign-in attempt in sessionStorage', error);
    }

    try {
      window.localStorage?.setItem(storageKey, 'true');
    } catch (error) {
      console.warn('Unable to persist auto sign-in attempt in localStorage', error);
    }
  }

  private clearAutoSignInAttempt(): void {
    if (!this._autoSignInAttempted()) {
      return;
    }

    this._autoSignInAttempted.set(false);

    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = AuthStateSignalsService.AUTO_SIGN_IN_STORAGE_KEY;

    try {
      window.sessionStorage?.removeItem(storageKey);
    } catch (error) {
      console.warn('Unable to clear auto sign-in attempt from sessionStorage', error);
    }

    try {
      window.localStorage?.removeItem(storageKey);
    } catch (error) {
      console.warn('Unable to clear auto sign-in attempt from localStorage', error);
    }
  }

  private readAutoSignInAttemptState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storageKey = AuthStateSignalsService.AUTO_SIGN_IN_STORAGE_KEY;

    try {
      if (window.sessionStorage?.getItem(storageKey) === 'true') {
        return true;
      }
    } catch (error) {
      console.warn('Unable to access sessionStorage', error);
    }

    let persistedAttempt = false;
    try {
      persistedAttempt = window.localStorage?.getItem(storageKey) === 'true';
    } catch (error) {
      console.warn('Unable to access localStorage', error);
    }

    return persistedAttempt;
  }

  reportUnauthorizedAccess(): void {
    this._error.set(AuthStateSignalsService.UNAUTHORIZED_ERROR_MESSAGE);
  }

  private updateRolesFromClaims(
    claims: ICvxClaimsPrincipal | null
  ): void {
    const roles = AuthStateSignalsService.extractRoles(claims);
    this._roles.set(roles);

    if (this._isSignedIn()) {
      const hasAllowedRole = roles.some((role) =>
        AuthStateSignalsService.ALLOWED_ROLES.includes(role)
      );

      if (hasAllowedRole && this._error() === AuthStateSignalsService.UNAUTHORIZED_ERROR_MESSAGE) {
        this._error.set(null);
      }
    }
  }

  private static extractRoles(
    claims: ICvxClaimsPrincipal | null
  ): UserRole[] {
    if (!claims) {
      return [];
    }

    const claimRecord = claims as unknown as Record<string, unknown>;
    const roleKeys = ['roles', 'Roles', 'role', 'Role'];

    for (const key of roleKeys) {
      const extracted = AuthStateSignalsService.normalizeRoles(claimRecord[key]);

      if (extracted.length) {
        return extracted;
      }
    }

    const resourceAccess = claimRecord['resource_access'];

    if (resourceAccess && typeof resourceAccess === 'object') {
      const collectedRoles: string[] = [];

      for (const value of Object.values(resourceAccess)) {
        if (value && typeof value === 'object') {
          const valueRecord = value as Record<string, unknown>;
          const rolesValue = valueRecord['roles'];

          if (Array.isArray(rolesValue)) {
            const normalized = AuthStateSignalsService.normalizeRoles(rolesValue);
            collectedRoles.push(...normalized);
          }
        }
      }

      if (collectedRoles.length) {
        return Array.from(new Set(collectedRoles));
      }
    }

    return [];
  }

  private static normalizeRoles(value: unknown): UserRole[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      const normalized = value
        .filter((role): role is string => typeof role === 'string')
        .map((role) => role.trim().toLowerCase())
        .filter(AuthStateSignalsService.isAllowedRole);

      return Array.from(new Set(normalized));
    }

    if (typeof value === 'string') {
      const normalized = value
        .split(',')
        .map((role) => role.trim().toLowerCase())
        .filter(AuthStateSignalsService.isAllowedRole);

      return Array.from(new Set(normalized));
    }

    return [];
  }

  private static isAllowedRole(role: string): role is UserRole {
    return AuthStateSignalsService.ALLOWED_ROLES.includes(role as UserRole);
  }
}
