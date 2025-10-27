import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import { HomeFiltersService } from '../services/home-filters.service';
import { BiddingReport } from './bidding-report.interface';
import {
  ReportDetailsDialogComponent,
  ReportDetailsDialogData,
} from './report-details-dialog/report-details-dialog.component';

interface ReportsRow {
  id: number;
  name: string;
  totalBidVolume: number;
  totalBidVolumePr: number;
  totalBidVolumePp: number;
  weightedAvgPr: number | null;
  weightedAvgPp: number | null;
  weightedTotalPrice: number | null;
  month: string;
  year: number;
  historyFiles: string[];
  reportFile: string;
  reportLink: string;
  status: string;
  exception: boolean;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportsComponent implements OnInit, OnDestroy {
  private static readonly MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ] as const;

  readonly icons = {
    download: 'assets/icons/download.svg',
    preview: 'assets/icons/preview.svg',
    delete: 'assets/icons/delete.svg'
  } as const;

  selectedMonth = '';
  selectedYear!: number | 'All';

  reports$!: Observable<ReportsRow[]>;

  creatingReport = false;

  private readonly refreshReportsTrigger$ = new BehaviorSubject<void>(undefined);
  private readonly processingReports = new Set<number>();
  private readonly subscription = new Subscription();

  constructor(
    private readonly apiEndpoints: ApiEndpointService,
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {
    this.selectedMonth = this.filters.selectedMonth;
    this.selectedYear = this.filters.selectedYear;

    this.subscription.add(
      this.filters.selectedMonth$.subscribe((month) => (this.selectedMonth = month))
    );
    this.subscription.add(
      this.filters.selectedYear$.subscribe((year) => (this.selectedYear = year))
    );
  }

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  statusClass(status: string | null | undefined): string {
    const normalized = String(status ?? '').toLowerCase();
    switch (normalized) {
      case 'active':
        return 'status status--active';
      case 'pending':
        return 'status status--pending';
      case 'complete':
      case 'completed':
      case 'closed':
        return 'status status--complete';
      default:
        return 'status';
    }
  }

  exceptionClass(hasException: boolean): string {
    return hasException ? 'exception-chip exception-chip--active' : 'exception-chip';
  }

  trackByReportId(_: number, row: ReportsRow): number {
    return row.id;
  }

  openReportDetails(row: ReportsRow): void {
    const summary = this.buildReportSummary(row);
    this.persistReportSummary(summary);

    void this.router.navigate(['/tender-awards', 'active', 'report', row.id], {
      state: { reportSummary: summary }
    });
  }

  openReportHistory(row: ReportsRow, event?: MouseEvent): void {
    event?.stopPropagation();

    const report = this.buildReportSummary(row);
    const data: ReportDetailsDialogData = {
      report,
      initialTab: 'history',
      viewMode: 'history'
    };

    this.dialog.open<ReportDetailsDialogComponent, ReportDetailsDialogData>(
      ReportDetailsDialogComponent,
      {
        data,
        maxWidth: '1200px',
        width: '95vw'
      }
    );
  }

  createReport(): void {
    if (this.creatingReport) {
      return;
    }

    this.creatingReport = true;

    const create$ = this.apiEndpoints
      .createBiddingReport({ reportDate: this.buildCurrentPeriod() })
      .pipe(
        take(1),
        finalize(() => {
          this.creatingReport = false;
        })
      )
      .subscribe({
        next: () => this.refreshReports(),
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to create bidding report', error);
        },
      });

    this.subscription.add(create$);
  }

  deleteReport(row: ReportsRow, event: MouseEvent): void {
    event.stopPropagation();

    if (this.isReportProcessing(row.id) || !this.canDeleteReport(row.status)) {
      return;
    }

    this.setReportProcessing(row.id, true);

    const delete$ = this.apiEndpoints
      .deleteBiddingReport(row.id)
      .pipe(
        take(1),
        finalize(() => this.setReportProcessing(row.id, false))
      )
      .subscribe({
        next: () => this.refreshReports(),
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to delete bidding report', error);
        },
      });

    this.subscription.add(delete$);
  }

  createExceptionReport(row: ReportsRow, event: MouseEvent): void {
    event.stopPropagation();

    if (row.exception || this.isReportProcessing(row.id)) {
      return;
    }

    this.setReportProcessing(row.id, true);

    const create$ = this.apiEndpoints
      .createExceptionReport(row.id)
      .pipe(
        take(1),
        finalize(() => this.setReportProcessing(row.id, false))
      )
      .subscribe({
        next: () => this.refreshReports(),
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to create exception report', error);
        },
      });

    this.subscription.add(create$);
  }

  isReportProcessing(reportId: number): boolean {
    return this.processingReports.has(reportId);
  }

  // data
  private loadReports(): void {
    const filterChanges$ = combineLatest([this.filters.selectedMonth$, this.filters.selectedYear$]);

    this.reports$ = combineLatest([filterChanges$, this.refreshReportsTrigger$]).pipe(
      switchMap(([[monthName, year]]) => {
        const month = this.normalizeMonthForFilter(monthName);
        const numericYear = this.toNumericYear(year);

        const request$ =
          month !== null && numericYear !== null
            ? this.apiEndpoints.getBiddingReports({ month, year: numericYear })
            : this.apiEndpoints.getBiddingReports();

        return request$.pipe(
          map((reports) => reports.map((report) => this.mapReport(report))),
          catchError((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to load bidding reports', error);
            return of<ReportsRow[]>([]);
          }),
          finalize(() => this.filters.completeLoading())
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private refreshReports(): void {
    this.refreshReportsTrigger$.next(undefined);
  }

  private mapReport(report: BiddingReport): ReportsRow {
    return {
      id: report.id,
      name: report.reportName ?? '',
      totalBidVolume: report.totalVolume ?? 0,
      totalBidVolumePr: report.totalPropaneVolume ?? 0,
      totalBidVolumePp: report.totalButaneVolume ?? 0,
      weightedAvgPr: report.weightedAvgPropanePrice ?? null,
      weightedAvgPp: report.weightedAvgButanePrice ?? null,
      weightedTotalPrice: report.weightedTotalPrice ?? null,
      month: this.toMonthName(report.reportMonth),
      year: report.reportYear ?? 0,
      historyFiles: report.previousReportLink ? [report.previousReportLink] : [],
      reportFile: report.fileName ?? '',
      reportLink: report.filePath ?? '',
      status: report.status ?? '',
      exception:
        typeof report.isExceptionReport === 'boolean'
          ? report.isExceptionReport
          : (report.reportName ?? '').toLowerCase().includes('exception')
    };
  }

  private buildReportSummary(row: ReportsRow): BiddingReport {
    return {
      id: row.id,
      reportName: row.name,
      reportMonth: row.month,
      reportYear: row.year,
      reportDate: '',
      status: row.status,
      totalButaneVolume: row.totalBidVolumePp,
      totalPropaneVolume: row.totalBidVolumePr,
      weightedAvgButanePrice: row.weightedAvgPp,
      weightedAvgPropanePrice: row.weightedAvgPr,
      weightedTotalPrice: row.weightedTotalPrice ?? null,
      biddingHistoryAnalysis: null,
      previousReportLink: row.historyFiles[0] ?? null,
      filePath: row.reportLink,
      fileName: row.reportFile,
      totalVolume: row.totalBidVolume,
      isExceptionReport: row.exception,
      createdBy: undefined,
      dateCreated: undefined,
    };
  }

  private persistReportSummary(summary: BiddingReport): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        `tender-awards-report-summary-${summary.id}`,
        JSON.stringify(summary)
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist report summary for tender awards', error);
    }
  }

  private toMonthName(monthValue: string | number | null | undefined): string {
    const trimmed = typeof monthValue === 'number' ? String(monthValue) : monthValue?.trim();
    if (!trimmed) {
      return '';
    }

    const monthNumber = Number(trimmed);
    if (Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
      return ReportsComponent.MONTH_NAMES[monthNumber - 1] ?? trimmed;
    }

    const normalized = trimmed.toLowerCase();
    const index = ReportsComponent.MONTH_NAMES.findIndex(
      (name) => name.toLowerCase() === normalized
    );
    if (index >= 0) {
      return ReportsComponent.MONTH_NAMES[index];
    }

    return this.toTitleCase(trimmed);
  }

  private normalizeMonthForFilter(monthName: string | null | undefined): number | null {
    if (!monthName) {
      return null;
    }

    const normalized = monthName.trim().toLowerCase();
    if (!normalized || normalized === 'all' || normalized === 'all months') {
      return null;
    }

    const numericMonth = Number(normalized);
    if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
      return Math.trunc(numericMonth);
    }

    const index = ReportsComponent.MONTH_NAMES.findIndex(
      (name) => name.toLowerCase() === normalized
    );

    return index >= 0 ? index + 1 : null;
  }

  private toNumericYear(year: number | string | null | undefined): number | null {
    if (typeof year === 'number' && Number.isFinite(year)) {
      return year;
    }

    if (typeof year === 'string') {
      const trimmed = year.trim().toLowerCase();
      if (!trimmed || trimmed === 'all years' || trimmed === 'all') {
        return null;
      }

      const parsed = Number(year);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  canDeleteReport(status: string | null | undefined): boolean {
    const normalized = String(status ?? '').toLowerCase();
    return normalized !== 'completed' && normalized !== 'complete' && normalized !== 'closed';
  }

  deleteTooltip(row: ReportsRow): string {
    return this.canDeleteReport(row.status)
      ? 'Delete report'
      : 'Delete not available for completed or closed reports';
  }

  private buildCurrentPeriod(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${now.getFullYear()}-${month}-${day}`;
  }

  private setReportProcessing(reportId: number, isProcessing: boolean): void {
    if (isProcessing) {
      this.processingReports.add(reportId);
    } else {
      this.processingReports.delete(reportId);
    }
  }

  private toTitleCase(value: string): string {
    return value.replace(/\w\S*/g, (word) => word[0]?.toUpperCase() + word.substring(1).toLowerCase());
  }
}
