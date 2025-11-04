import { Injectable, computed, signal } from '@angular/core';

interface ErrorNotificationState {
  count: number;
  lastMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly errorState = signal<ErrorNotificationState>({ count: 0, lastMessage: null });

  readonly errorCount = computed(() => this.errorState().count);
  readonly lastErrorMessage = computed(() => this.errorState().lastMessage);
  readonly hasErrors = computed(() => this.errorState().count > 0);

  notifyError(message: string): void {
    const trimmed = message?.toString().trim();
    this.errorState.update((state) => ({
      count: state.count + 1,
      lastMessage: trimmed && trimmed.length > 0 ? trimmed : 'An unexpected error occurred.',
    }));
  }

  clearErrors(): void {
    this.errorState.set({ count: 0, lastMessage: null });
  }
}
