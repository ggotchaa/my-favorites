import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import {
  ApprovalHistoryDto,
  CreateExceptionReportResultDto,
} from '../../../core/services/api.types';
import { HomeFiltersService } from '../services/home-filters.service';
import { BiddingReport } from './bidding-report.interface';
import {
  TenderAwardsInitiateStage,
  TenderAwardsWorkflowState,
  TENDER_AWARDS_WORKFLOW_STORAGE_KEY,
} from '../tender-awards/tender-awards-workflow-state';
import {
  ReportDetailsDialogComponent,
  ReportDetailsDialogData,
} from './report-details-dialog/report-details-dialog.component';
import { APPROVAL_ACTIONS, ApprovalRecord } from './report-approvals-dialog/report-approvals.interface';
import {
  ReportApprovalsDialogComponent,
  ReportApprovalsDialogData,
} from './report-approvals-dialog/report-approvals-dialog.component';
import { AccessControlService } from '../../../core/services/access-control.service';

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

type ReportsSortColumn =
  | 'name'
  | 'totalBidVolume'
  | 'totalBidVolumePr'
  | 'totalBidVolumePp'
  | 'weightedAvgPr'
  | 'weightedAvgPp'
  | 'month'
  | 'year'
  | 'status'
  | 'exception';

type ReportsSortDirection = 'asc' | 'desc' | null;

interface ReportsSortState {
  active: ReportsSortColumn | null;
  direction: ReportsSortDirection;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportsComponent implements OnInit, OnDestroy {
  private static readonly FULL_SCREEN_DIALOG_CONFIG: MatDialogConfig = {
    panelClass: 'full-screen-dialog',
    width: '100vw',
    maxWidth: '100vw',
    height: '100vh',
    maxHeight: '100vh',
  };

  private static readonly HISTORY_DIALOG_CONFIG: MatDialogConfig = {
    ...ReportsComponent.FULL_SCREEN_DIALOG_CONFIG,
    panelClass: ['full-screen-dialog', 'report-history-dialog'],
  };

  private static readonly APPROVALS_DIALOG_CONFIG: MatDialogConfig = {
    width: '800px',
    maxWidth: '90vw',
    panelClass: 'report-approvals-dialog',
  };

  private static readonly MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ] as const;

  readonly icons = {
    delete: 'assets/icons/delete.svg',
    approvalHistory: 'assets/icons/approvers-history.svg',
    exportPdf: 'assets/icons/export-pdf.svg',
  } as const;

  selectedMonth = '';
  selectedYear!: number | 'All';

  reports$!: Observable<ReportsRow[]>;
  readonly sortState$ = new BehaviorSubject<ReportsSortState>({
    active: null,
    direction: null,
  });

  creatingReport = false;

  private readonly refreshReportsTrigger$ = new BehaviorSubject<void>(undefined);
  private readonly deletingReports = new Set<number>();
  private readonly exportingReports = new Set<number>();
  private readonly exceptionReports = new Set<number>();
  private readonly approvalHistoryLoading = new Set<number>();
  private readonly subscription = new Subscription();
  private readonly accessControl = inject(AccessControlService);

  constructor(
    private readonly apiEndpoints: ApiEndpointService,
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
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

  get isReadOnlyView(): boolean {
    return this.accessControl.isReadOnlyMode();
  }

  get showDeleteColumn(): boolean {
    return this.accessControl.canShowDeleteColumn();
  }

  statusClass(status: string | null | undefined): string {
    const normalized = String(status ?? '').toLowerCase();
    switch (normalized) {
      case 'active':
        return 'status status--active';
      case 'pending':
      case 'history analyzed':
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

  isActiveStatus(status: string | null | undefined): boolean {
    return String(status ?? '').toLowerCase() === 'active';
  }

  trackByReportId(_: number, row: ReportsRow): number {
    return row.id;
  }

  changeSort(column: ReportsSortColumn): void {
    const current = this.sortState$.value;
    let direction: ReportsSortDirection = 'asc';

    if (current.active === column) {
      direction = current.direction === 'asc' ? 'desc' : current.direction === 'desc' ? null : 'asc';
    }

    const nextState: ReportsSortState = {
      active: direction ? column : null,
      direction,
    };

    this.sortState$.next(nextState);
  }

  sortIcon(column: ReportsSortColumn): string {
    const { active, direction } = this.sortState$.value;

    if (active !== column || !direction) {
      return 'unfold_more';
    }

    return direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  openReportDetails(row: ReportsRow): void {
    const summary = this.buildReportSummary(row);
    this.persistReportSummary(summary);

    if (row.exception) {
      this.navigateToExceptionReport(row.id, summary);
      return;
    }

    const normalizedStatus = this.normalizeStatus(row.status);

    if (normalizedStatus === 'new') {
      this.navigateToTenderAwardsInitiate(row.id, summary, 'collection-complete');
      return;
    }

    if (normalizedStatus === 'history analyzed') {
      this.navigateToTenderAwardsTab('history', row.id, summary);
      return;
    }

    if (normalizedStatus === 'active') {
      this.navigateToTenderAwardsTab('active', row.id, summary);
      return;
    }

    if (this.isCompletedStatus(row.status)) {
      this.navigateToCompletedReport(row.id, summary);
      return;
    }

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
        ...ReportsComponent.HISTORY_DIALOG_CONFIG,
        data,
      }
    );
  }

  openApprovalHistory(row: ReportsRow, isExceptionReport: boolean, event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isApprovalHistoryLoading(row.id)) {
      return;
    }

    this.setApprovalHistoryLoading(row.id, true);

    const load$ = this.apiEndpoints
      .getApprovalHistory(row.id, {isExceptionReport: isExceptionReport})
      .pipe(
        take(1),
        finalize(() => this.setApprovalHistoryLoading(row.id, false))
      )
      .subscribe({
        next: (history) => {
          const approvers: ApprovalRecord[] = (history ?? [])
            .map((entry) => this.mapToApprovalRecord(entry))
            .filter((entry): entry is ApprovalRecord => entry !== null);

          this.dialog.open<ReportApprovalsDialogComponent, ReportApprovalsDialogData>(
            ReportApprovalsDialogComponent,
            {
              ...ReportsComponent.APPROVALS_DIALOG_CONFIG,
              data: { approvers, reportName: row.name },
            }
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load approval history', error);

          this.dialog.open<ReportApprovalsDialogComponent, ReportApprovalsDialogData>(
            ReportApprovalsDialogComponent,
            {
              ...ReportsComponent.APPROVALS_DIALOG_CONFIG,
              data: { approvers: [], reportName: row.name },
            }
          );
        },
      });

    this.subscription.add(load$);
  }

  createReport(): void {
    if (this.isReadOnlyView || this.creatingReport) {
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

    if (
      this.isReadOnlyView ||
      this.isDeleting(row.id) ||
      !this.canDeleteReport(row.status)
    ) {
      return;
    }

    this.setDeleting(row.id, true);

    const delete$ = this.apiEndpoints
      .deleteBiddingReport(row.id)
      .pipe(
        take(1),
        finalize(() => this.setDeleting(row.id, false))
      )
      .subscribe({
        next: () => {
          this.clearReportSessionStorage(row.id);
          this.refreshReports();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to delete bidding report', error);
        },
      });

    this.subscription.add(delete$);
  }

  exportReportToPDF(row: ReportsRow, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isExporting(row.id)) {
      return;
    }
    this.setExporting(row.id, true);

    const export$ = this.apiEndpoints
      .exportBiddingReportToPDF(row.id)
      .pipe(
        take(1),
        finalize(() => this.setExporting(row.id, false))
      )
      .subscribe({
        next: (blob) =>  this.apiEndpoints.handleReportExportedBlob(blob, `${row.name}.pdf`),
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to export bidding report to PDF', error);
        },
      });

    this.subscription.add(export$);
  }

  createExceptionReport(row: ReportsRow, event: MouseEvent): void {
    event.stopPropagation();

    if (
      this.isReadOnlyView ||
      row.exception ||
      this.isExceptionProcessing(row.id) ||
      this.isActiveStatus(row.status)
    ) {
      return;
    }

    this.setExceptionProcessing(row.id, true);

    const create$ = this.apiEndpoints
      .createExceptionReport(row.id)
      .pipe(
        take(1),
        finalize(() => this.setExceptionProcessing(row.id, false))
      )
      .subscribe({
        next: (result) => this.handleExceptionReportCreated(row, result),
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to create exception report', error);
        },
      });

    this.subscription.add(create$);
  }

  getExceptionTooltip(row: ReportsRow): string {
    if (this.isActiveStatus(row.status)) {
      return 'Exception reports are unavailable while the report status is Active.';
    }

    if (this.isExceptionProcessing(row.id)) {
      return 'Creating exception report…';
    }

    return 'Create exception report';
  }

  isDeleting(reportId: number): boolean {
    return this.deletingReports.has(reportId);
  }

  isExporting(reportId: number): boolean {
    return this.exportingReports.has(reportId);
  }

  isExceptionProcessing(reportId: number): boolean {
    return this.exceptionReports.has(reportId);
  }

  isAnyActionInProgress(reportId: number): boolean {
    return (
      this.isDeleting(reportId) ||
      this.isExporting(reportId) ||
      this.isExceptionProcessing(reportId)
    );
  }

  isApprovalHistoryLoading(reportId: number): boolean {
    return this.approvalHistoryLoading.has(reportId);
  }

  // data
  private loadReports(): void {
    const filterChanges$ = combineLatest([this.filters.selectedMonth$, this.filters.selectedYear$]);

    this.reports$ = combineLatest([
      filterChanges$,
      this.refreshReportsTrigger$,
      this.sortState$,
    ]).pipe(
      switchMap(([[monthName, year], , sortState]) => {
        const month = this.normalizeMonthForFilter(monthName);
        const numericYear = this.toNumericYear(year);

        const filters: { month?: number; year?: number } = {};

        if (month !== null) {
          filters.month = month;
        }

        if (numericYear !== null) {
          filters.year = numericYear;
        }

        const hasFilters = typeof filters.month === 'number' || typeof filters.year === 'number';

        const request$ = hasFilters
          ? this.apiEndpoints.getBiddingReports(filters)
          : this.apiEndpoints.getBiddingReports();

        return request$.pipe(
          map((reports) =>
            this.sortReports(
              reports.map((report) => this.mapReport(report)),
              sortState
            )
          ),
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

  private fetchReportsSnapshot(): Observable<ReportsRow[]> {
    const month = this.normalizeMonthForFilter(this.selectedMonth);
    const numericYear = this.toNumericYear(this.selectedYear);

    const filters: { month?: number; year?: number } = {};

    if (month !== null) {
      filters.month = month;
    }

    if (numericYear !== null) {
      filters.year = numericYear;
    }

    const hasFilters = typeof filters.month === 'number' || typeof filters.year === 'number';

    const request$ = hasFilters
      ? this.apiEndpoints.getBiddingReports(filters)
      : this.apiEndpoints.getBiddingReports();

    return request$.pipe(
      take(1),
      map((reports) => reports.map((report) => this.mapReport(report))),
      catchError((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch bidding reports after creating exception report', error);
        return of<ReportsRow[]>([]);
      })
    );
  }

  private sortReports(
    reports: ReportsRow[],
    sortState: ReportsSortState
  ): ReportsRow[] {
    const { active, direction } = sortState;

    if (!active || !direction) {
      return reports;
    }

    const sorted = [...reports].sort((left, right) => {
      const leftValue = this.getSortableValue(left, active);
      const rightValue = this.getSortableValue(right, active);

      if (leftValue === rightValue) {
        return 0;
      }

      return leftValue < rightValue ? -1 : 1;
    });

    return direction === 'asc' ? sorted : sorted.reverse();
  }

  private getSortableValue(
    report: ReportsRow,
    column: ReportsSortColumn
  ): string | number {
    if (column === 'month') {
      return this.normalizeMonthForFilter(report.month) ?? report.month.toLowerCase();
    }

    if (column === 'year') {
      return this.toNumericYear(report.year) ?? 0;
    }

    if (column === 'exception') {
      return report.exception ? 1 : 0;
    }

    const value = report[column];

    if (typeof value === 'number') {
      return value;
    }

    return String(value ?? '').toLowerCase();
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

  private mapToApprovalRecord(entry: ApprovalHistoryDto | null | undefined): ApprovalRecord | null {
    if (!entry) {
      return null;
    }

    return {
      approverName: entry.approverName?.trim() || 'Unknown',
      action: this.normalizeAction(entry.action),
      comment: entry.comment?.trim() || '',
      attempt: entry.attempt ?? 1,
      date: entry.date || null,
    };
  }

  private normalizeAction(action: string | null | undefined): ApprovalRecord['action'] {
    const normalized = action?.trim();
    switch (normalized) {
      case APPROVAL_ACTIONS.SENT_FOR_APPROVAL:
      case APPROVAL_ACTIONS.APPROVED:
      case APPROVAL_ACTIONS.REJECTED:
      case APPROVAL_ACTIONS.ROLLED_BACK:
      case APPROVAL_ACTIONS.WAITING:
        return normalized;
      default:
        return 'Unknown';
    }
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

  private setDeleting(reportId: number, isProcessing: boolean): void {
    if (isProcessing) {
      this.deletingReports.add(reportId);
    } else {
      this.deletingReports.delete(reportId);
    }
  }

  private setExporting(reportId: number, isProcessing: boolean): void {
    if (isProcessing) {
      this.exportingReports.add(reportId);
    } else {
      this.exportingReports.delete(reportId);
    }
  }

  private setExceptionProcessing(reportId: number, isProcessing: boolean): void {
    if (isProcessing) {
      this.exceptionReports.add(reportId);
    } else {
      this.exceptionReports.delete(reportId);
    }
  }

  private setApprovalHistoryLoading(reportId: number, loading: boolean): void {
    if (loading) {
      this.approvalHistoryLoading.add(reportId);
    } else {
      this.approvalHistoryLoading.delete(reportId);
    }

    this.cdr.markForCheck();
  }

  private toTitleCase(value: string): string {
    return value.replace(/\w\S*/g, (word) => word[0]?.toUpperCase() + word.substring(1).toLowerCase());
  }

  private isCompletedStatus(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'completed' || normalized === 'complete' || normalized === 'closed';
  }

  private normalizeStatus(status: string | null | undefined): string {
    return String(status ?? '').trim().toLowerCase();
  }

  private navigateToTenderAwardsInitiate(
    reportId: number,
    summary: BiddingReport,
    stage: TenderAwardsInitiateStage
  ): void {
    const workflowState: TenderAwardsWorkflowState = { reportId, stage };
    this.persistTenderAwardsWorkflowState(workflowState);

    void this.router.navigate(['/tender-awards', 'initiate'], {
      state: {
        reportSummary: summary,
        tenderAwardsWorkflow: workflowState,
      },
    });
  }

  private navigateToCompletedReport(reportId: number, summary: BiddingReport): void {
    void this.router.navigate(['/reports', reportId, 'details'], {
      state: { reportSummary: summary },
    });
  }

  private navigateToTenderAwardsTab(
    tab: 'history' | 'active',
    reportId: number,
    summary: BiddingReport
  ): void {
    void this.router.navigate(['/tender-awards', tab, 'report', reportId], {
      state: { reportSummary: summary },
    });
  }

  private handleExceptionReportCreated(row: ReportsRow, result: CreateExceptionReportResultDto | void): void {
    this.refreshReports();

    const targetReportId = result?.biddingReportId ?? row.id;

    const load$ = this.fetchReportsSnapshot().subscribe((reports) => {
      const targetRow = reports.find((report) => report.id === targetReportId) ?? row;

      this.navigateToNewExceptionReport(targetReportId, targetRow);
    });

    this.subscription.add(load$);
  }

  private navigateToNewExceptionReport(reportId: number, row: ReportsRow): void {
    const summary = this.buildReportSummary(row);
    this.persistReportSummary(summary);

    this.navigateToExceptionReport(reportId, summary);
  }

  private navigateToExceptionReport(reportId: number, summary: BiddingReport): void {
    void this.router.navigate(['/reports', 'exception'], {
      queryParams: { reportId },
      state: { reportSummary: summary },
    });
  }

  private persistTenderAwardsWorkflowState(state: TenderAwardsWorkflowState): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        TENDER_AWARDS_WORKFLOW_STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist tender awards workflow state', error);
    }
  }

  private clearReportSessionStorage(reportId: number): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.removeItem(`tender-awards-report-summary-${reportId}`);
      window.sessionStorage.removeItem(TENDER_AWARDS_WORKFLOW_STORAGE_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear tender awards session storage', error);
    }
  }
}
