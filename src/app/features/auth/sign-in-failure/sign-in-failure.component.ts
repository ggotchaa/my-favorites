import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly activatedRoute = inject(ActivatedRoute);

  isRetrying = false;

  private get redirectUrl(): string | null {
    const rawRedirect = this.activatedRoute.snapshot.queryParamMap.get('redirectUrl');

    if (!rawRedirect || rawRedirect === '/' || rawRedirect.startsWith('http')) {
      return null;
    }

    return rawRedirect.startsWith('/') ? rawRedirect : `/${rawRedirect}`;
  }

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
          const redirectUrl = this.redirectUrl;
          if (redirectUrl) {
            void this.router.navigateByUrl(redirectUrl);
          } else {
            void this.router.navigate(['/']);
          }
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
