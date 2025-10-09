import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';

@Component({
  selector: 'app-sign-in-failure',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './sign-in-failure.component.html',
  styleUrl: './sign-in-failure.component.scss',
})
export class SignInFailureComponent {
  protected readonly authService = inject(AuthStateSignalsService);
  private readonly router = inject(Router);

  isRetrying = false;

  onRetry(): void {
    if (this.isRetrying || this.authService.isLoading()) {
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
