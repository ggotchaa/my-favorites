import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { ApiEndpointService } from '../../../../core/services/api.service';
import { BiddingReport } from '../bidding-report.interface';
import { BiddingReportHistoryEntry } from '../report-history-entry.interface';

export interface ReportDetailsDialogData {
  report: BiddingReport;
  initialTab?: 'information' | 'history';
  viewMode?: 'full' | 'history';
}

@Component({
  selector: 'app-report-details-dialog',
  templateUrl: './report-details-dialog.component.html',
  styleUrls: ['./report-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportDetailsDialogComponent {
  private static readonly MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ] as const;

  private readonly historySubject = new BehaviorSubject<BiddingReportHistoryEntry[] | null>(null);
  private readonly historyLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly historyErrorSubject = new BehaviorSubject<boolean>(false);

  readonly history$ = this.historySubject.asObservable();
  readonly historyLoading$ = this.historyLoadingSubject.asObservable();
  readonly historyError$ = this.historyErrorSubject.asObservable();

  private historyLoaded = false;

  readonly viewMode: 'full' | 'history';
  readonly initialTabIndex: number;
  readonly report: BiddingReport;
  selectedTabIndex: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: ReportDetailsDialogData,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly dialogRef: MatDialogRef<ReportDetailsDialogComponent>
  ) {
    this.dialogRef.addPanelClass('full-screen-dialog');
    this.dialogRef.updateSize('100vw', '100vh');
    this.report = data.report;
    this.viewMode = data.viewMode ?? 'full';
    this.initialTabIndex = this.viewMode === 'history' || data.initialTab === 'history' ? 1 : 0;
    this.selectedTabIndex = this.initialTabIndex;

    if (this.viewMode === 'history') {
      this.loadHistory();
    }
  }

  get formattedReportDate(): string {
    return this.report.reportDate ? new Date(this.report.reportDate).toLocaleDateString() : '';
  }

  get monthLabel(): string {
    return this.toMonthName(this.report.reportMonth);
  }

  onTabChanged(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;

    if (event.index === 1 && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  get showInformationTab(): boolean {
    return this.viewMode === 'full';
  }

  trackHistory(_: number, history: BiddingReportHistoryEntry): number {
    return history.id;
  }

  formatHistoryMonth(month: string | number | null | undefined): string {
    return this.toMonthName(month);
  }

  private loadHistory(): void {
    this.historyLoadingSubject.next(true);
    this.historyErrorSubject.next(false);

    this.apiEndpoints
      .getBiddingReportHistory(this.report.id)
      .pipe(take(1))
      .subscribe({
        next: (history) => {
          this.historyLoaded = true;
          this.historySubject.next(history);
          this.historyLoadingSubject.next(false);
        },
        error: (error) => {
          this.historyLoadingSubject.next(false);
          this.historyErrorSubject.next(true);
          // eslint-disable-next-line no-console
          console.error('Failed to load bidding report history', error);
        }
      });
  }

  private toMonthName(monthValue: string | number | null | undefined): string {
    const trimmed = typeof monthValue === 'number' ? String(monthValue) : monthValue?.trim();
    if (!trimmed) {
      return '';
    }

    const monthNumber = Number(trimmed);
    if (Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
      return ReportDetailsDialogComponent.MONTH_NAMES[monthNumber - 1] ?? trimmed;
    }

    const normalized = trimmed.toLowerCase();
    const index = ReportDetailsDialogComponent.MONTH_NAMES.findIndex(
      (name) => name.toLowerCase() === normalized
    );
    if (index >= 0) {
      return ReportDetailsDialogComponent.MONTH_NAMES[index];
    }

    return this.toTitleCase(trimmed);
  }

  private toTitleCase(value: string): string {
    return value.replace(/\w\S*/g, (word) => word[0]?.toUpperCase() + word.substring(1).toLowerCase());
  }
}
