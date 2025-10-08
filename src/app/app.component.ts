import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { AuthStateSignalsService } from './services/auth-state-signals.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly authService = inject(AuthStateSignalsService);
  private hasAttemptedAutoSignIn = false;

  private readonly autoSignInEffect = effect(() => {
    const isSignedIn = this.authService.isSignedIn();
    const isLoading = this.authService.isLoading();

    if (!isSignedIn && !isLoading && !this.hasAttemptedAutoSignIn) {
      this.hasAttemptedAutoSignIn = true;

      this.authService
        .signIn()
        .pipe(take(1))
        .subscribe({
          error: (error) => console.error('Automatic sign-in failed', error),
        });
    }
  });
}
