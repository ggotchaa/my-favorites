import { Component, inject } from '@angular/core';
import { take } from 'rxjs';

import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';

@Component({
  selector: 'app-sign-in-failure',
  templateUrl: './sign-in-failure.component.html',
  styleUrls: ['./sign-in-failure.component.scss'],
  standalone: false,
})
export class SignInFailureComponent {
  protected readonly authService = inject(AuthStateSignalsService);

  isRetrying = false;

  onRetry(): void {
    if (
      this.isRetrying ||
      this.authService.isLoading() ||
      !this.authService.isInteractiveSignInEnabled()
    ) {
      return;
    }

    this.isRetrying = true;

    this.authService
      .signIn()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isRetrying = false;
        },
        error: () => {
          this.isRetrying = false;
        },
      });
  }

  onReload(): void {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  }
}
