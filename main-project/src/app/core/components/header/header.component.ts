import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { take } from 'rxjs';

import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  protected readonly authService = inject(AuthStateSignalsService);

  isProcessing = false;

  onSignIn(): void {
    if (this.isProcessing || this.authService.isLoading()) {
      return;
    }

    this.isProcessing = true;

    this.authService
      .signIn()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Sign in failed', error);
          this.isProcessing = false;
        },
      });
  }

  onSignOut(): void {
    if (this.isProcessing || this.authService.isLoading()) {
      return;
    }

    this.isProcessing = true;

    this.authService
      .signOut()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Sign out failed', error);
          this.isProcessing = false;
        },
      });
  }
}
