import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { AuthStateSignalsService } from '../../services/auth-state-signals.service';

function buildRedirectTree(router: Router, state: RouterStateSnapshot): UrlTree {
  const redirectUrl = state.url && state.url !== '/' ? state.url : null;
  return router.createUrlTree(['/sign-in-failed'], {
    queryParams: redirectUrl ? { redirectUrl } : undefined,
  });
}

function waitForAuthResolution(
  authService: AuthStateSignalsService
): Observable<boolean> {
  return combineLatest({
    isSignedIn: toObservable(authService.isSignedIn),
    isLoading: toObservable(authService.isLoading),
  }).pipe(
    filter((state) => !state.isLoading),
    take(1),
    map((state) => state.isSignedIn)
  );
}

function resolveAuthentication(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> {
  void route; // route data is currently unused but kept for future-proofing

  const authService = inject(AuthStateSignalsService);
  const router = inject(Router);
  const redirectTree = buildRedirectTree(router, state);

  const evaluateAuthState = () =>
    waitForAuthResolution(authService).pipe(
      map((isSignedIn) => (isSignedIn ? true : redirectTree))
    );

  return waitForAuthResolution(authService).pipe(
    switchMap((isSignedIn) => {
      if (isSignedIn) {
        return of(true);
      }

      const autoSignIn$ = authService.attemptAutoSignIn();

      if (autoSignIn$) {
        return autoSignIn$.pipe(
          switchMap(() => evaluateAuthState()),
          catchError(() => of(redirectTree))
        );
      }

      return of(redirectTree);
    }),
    catchError(() => of(redirectTree))
  );
}

export const calCanActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => resolveAuthentication(route, state);

export const calCanActivateChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => resolveAuthentication(childRoute, state);
