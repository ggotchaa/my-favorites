import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { take } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthStateSignalsService } from './services/auth-state-signals.service';
import { isLocalEnvironment } from './shared/utils/environment.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private readonly authService = inject(AuthStateSignalsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hasAttemptedInitialization = signal(false);
  private readonly isAppReadySignal = signal(false);
  private readonly shouldAutoSignIn = isLocalEnvironment();
  private readonly currentUrl = signal(this.router.url);

  readonly isAppReady = this.isAppReadySignal.asReadonly();

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  private readonly autoSignInEffect = effect(() => {
    const isSignedIn = this.authService.isSignedIn();
    const isLoading = this.authService.isLoading();
    const isAuthorized = this.authService.isAuthorized();
    const hasAttempted = this.hasAttemptedInitialization();
    const currentUrl = this.currentUrl();
    const isFailureRouteActive = currentUrl.startsWith('/sign-in-failed');

    if (isLoading) {
      if (this.isAppReadySignal()) {
        this.isAppReadySignal.set(false);
      }
      return;
    }

    if (isSignedIn && isAuthorized) {
      if (!hasAttempted) {
        this.hasAttemptedInitialization.set(true);
      }
      if (!this.isAppReadySignal()) {
        this.isAppReadySignal.set(true);
      }
      return;
    }

    if (isFailureRouteActive) {
      if (!this.isAppReadySignal()) {
        this.isAppReadySignal.set(true);
      }
      return;
    }

    if (!hasAttempted) {
      this.hasAttemptedInitialization.set(true);

      if (this.shouldAutoSignIn) {
        this.isAppReadySignal.set(false);

        const autoSignInAttempt = this.authService.attemptAutoSignIn();

        if (autoSignInAttempt) {
          autoSignInAttempt.pipe(take(1)).subscribe({
            next: () => {
              if (this.router.url === '/sign-in-failed') {
                void this.router.navigate(['/']);
              }
            },
            error: (error) => {
              console.error('Automatic sign-in failed', error);
              if (this.router.url !== '/sign-in-failed') {
                void this.router.navigate(['/sign-in-failed']);
              }
            },
          });
        } else if (!this.router.url.startsWith('/sign-in-failed')) {
          void this.router.navigate(['/sign-in-failed']);
        }

        return;
      }

      if (!this.router.url.startsWith('/sign-in-failed')) {
        void this.router.navigate(['/sign-in-failed']);
      }
      return;
    }

    if (this.isAppReadySignal()) {
      this.isAppReadySignal.set(false);
    }
  });
}
