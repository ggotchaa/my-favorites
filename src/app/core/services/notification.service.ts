import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultErrorMessage = 'An unexpected error occurred.';

  notifyError(message: string): void {
    const trimmed = message?.toString().trim();
    const displayMessage = trimmed && trimmed.length > 0 ? trimmed : this.defaultErrorMessage;

    this.snackBar.open(displayMessage, 'Dismiss', {
      duration: 6000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  clearErrors(): void {
    this.snackBar.dismiss();
  }
}
