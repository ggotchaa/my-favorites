import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiException, ProblemDetails, ValidationProblemDetails } from '../api/GCPClient';
import { SnackbarHtmlComponent } from '../pages/common/snackbar-html/snackbar-html/snackbar-html.component';
import { Utilities } from '../shared/helpers/Utils';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  info(message: string): void {
    this.snackBar.openFromComponent(SnackbarHtmlComponent, {
      data: {
        html: message,
        type: 'Внимание'
      },
      panelClass: ['info-snackbar'],
    }
    );
  }

  warning(message: string): void {
    this.snackBar.openFromComponent(SnackbarHtmlComponent, {
      data: {
        html: message,
        type: 'Внимание'
      },
      panelClass: ['warning-snackbar'],
    }
    );
  }

  notify(message: string): void {
    this.snackBar.openFromComponent(SnackbarHtmlComponent, {
      data: {
        html: message,
        type: 'Уведомление'
      },
      panelClass: ['notify-snackbar'],
    }
    );
  }

  success(succesMessage: string): void {
    this.snackBar.openFromComponent(SnackbarHtmlComponent, {
      data: {
        html: succesMessage,
        type: 'Успешно'
      },
      panelClass: ['success-snackbar'],
    }
    );
  }

  error(error: string | ApiException | ValidationProblemDetails | ProblemDetails): void {
    let errorMessage: string = Utilities.detectAndReturnErrorMessage(error);

    this.snackBar.openFromComponent(SnackbarHtmlComponent, {
      data: {
        html: errorMessage,
        type: 'Ошибка'
      },
      panelClass: ['error-snackbar'],
      duration: undefined
    }
    );
  }
}
