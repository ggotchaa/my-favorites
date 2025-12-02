import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultErrorMessage = 'An unexpected error occurred.';
  private readonly unauthorizedMessage = 'You are not authorized to perform this action. Please contact your administrator.';
  private readonly notFoundMessage = 'The requested resource was not found.';

  notifyError(message: string | unknown, statusCode?: number): void {
    let displayMessage: string;

    if (statusCode === 401 || statusCode === 403) {
      displayMessage = this.unauthorizedMessage;
    } else if (statusCode === 404) {
      displayMessage = this.notFoundMessage;
    } else {
      const trimmed = message?.toString().trim();
      displayMessage = trimmed && trimmed.length > 0 ? trimmed : this.defaultErrorMessage;
    }

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
