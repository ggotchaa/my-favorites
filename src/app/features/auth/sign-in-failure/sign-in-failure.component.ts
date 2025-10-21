import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  private readonly router = inject(Router);

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
          void this.router.navigate(['/']);
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
