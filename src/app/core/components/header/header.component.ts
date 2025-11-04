import { Component, computed, inject } from '@angular/core';

import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent {
  protected readonly authService = inject(AuthStateSignalsService);
  private readonly notificationService = inject(NotificationService);

  readonly errorCount = this.notificationService.errorCount;
  readonly lastErrorMessage = this.notificationService.lastErrorMessage;
  readonly hasErrors = this.notificationService.hasErrors;

  readonly errorAriaLabel = computed(() => {
    const count = this.errorCount();
    return count === 1
      ? '1 unread API error notification'
      : `${count} unread API error notifications`;
  });

  clearErrors(): void {
    this.notificationService.clearErrors();
  }
}
