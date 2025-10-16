import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';

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
  private readonly hasAttemptedInitialization = signal(false);
  private readonly isAppReadySignal = signal(false);
  private readonly shouldAutoSignIn = isLocalEnvironment();

  readonly isAppReady = this.isAppReadySignal.asReadonly();

  private readonly autoSignInEffect = effect(() => {
    const isSignedIn = this.authService.isSignedIn();
    const isLoading = this.authService.isLoading();
    const hasAttempted = this.hasAttemptedInitialization();

    if (isLoading) {
      if (this.isAppReadySignal()) {
        this.isAppReadySignal.set(false);
      }
      return;
    }

    if (isSignedIn) {
      if (!hasAttempted) {
        this.hasAttemptedInitialization.set(true);
      }
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
              if (!this.isAppReadySignal()) {
                this.isAppReadySignal.set(true);
              }
              if (this.router.url === '/sign-in-failed') {
                void this.router.navigate(['/']);
              }
            },
            error: (error) => {
              console.error('Automatic sign-in failed', error);
              if (!this.isAppReadySignal()) {
                this.isAppReadySignal.set(true);
              }
              if (this.router.url !== '/sign-in-failed') {
                void this.router.navigate(['/sign-in-failed']);
              }
            },
          });
        } else if (!this.isAppReadySignal()) {
          this.isAppReadySignal.set(true);
        }

        return;
      }

      if (!this.isAppReadySignal()) {
        this.isAppReadySignal.set(true);
      }

      return;
    }

    if (!this.isAppReadySignal()) {
      this.isAppReadySignal.set(true);
    }
  });
}
