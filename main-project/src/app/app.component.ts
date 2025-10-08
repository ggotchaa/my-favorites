import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { take } from 'rxjs';

import { FooterComponent } from './core/components/footer/footer.component';
import { HeaderComponent } from './core/components/header/header.component';
import { MaterialModule } from './shared/material/material.module';
import { AuthStateSignalsService } from './services/auth-state-signals.service';
import { ConfigService } from '@cvx/cal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet, MaterialModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly authService = inject(AuthStateSignalsService);
  private readonly configService = inject(ConfigService);
  private readonly hasAttemptedInitialization = signal(false);
  private readonly isAppReadySignal = signal(false);
  private readonly shouldAutoSignIn = this.determineAutoSignIn();

  readonly isAppReady = this.isAppReadySignal.asReadonly();

  private readonly autoSignInEffect = effect(() => {
    const isSignedIn = this.authService.isSignedIn();
    const isLoading = this.authService.isLoading();
    const hasAttempted = this.hasAttemptedInitialization();
    const shouldAutoSignIn = this.shouldAutoSignIn;

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
      if (shouldAutoSignIn) {
        this.isAppReadySignal.set(false);

        this.authService
          .signIn()
          .pipe(take(1))
          .subscribe({
            next: () => {
              if (!this.isAppReadySignal()) {
                this.isAppReadySignal.set(true);
              }
            },
            error: (error) => {
              console.error('Automatic sign-in failed', error);
              if (!this.isAppReadySignal()) {
                this.isAppReadySignal.set(true);
              }
            },
          });

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

  private determineAutoSignIn(): boolean {
    try {
      const autoSignInSetting = this.configService.getSettings(
        'autoSignIn'
      ) as boolean | undefined;
      const popupForLogin = this.configService.getSettings(
        'popupForLogin'
      ) as boolean | undefined;

      if (autoSignInSetting && popupForLogin) {
        console.warn(
          'CAL configuration requests auto sign-in using a popup. Skipping automatic sign-in to avoid popup blockers.'
        );
        return false;
      }

      return Boolean(autoSignInSetting);
    } catch (error) {
      console.warn('Unable to determine CAL auto sign-in preference.', error);
      return false;
    }
  }
}
