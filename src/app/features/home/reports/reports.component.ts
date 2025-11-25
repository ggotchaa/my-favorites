//reports/exception?reportId=1 knopnki Approve,Reject,Rollback ne poyavilis
//Skirt Mange Approvers, Send for Approver, Save Changes
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import {
  ApprovalHistory,
  ApprovalHistoryDto,
  Approver,
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
import {
  ReportApprovalsDialogComponent,
  ReportApprovalsDialogData,
} from './report-approvals-dialog/report-approvals-dialog.component';

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
  approversHistory: string[];
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

  creatingReport = false;

  private readonly refreshReportsTrigger$ = new BehaviorSubject<void>(undefined);
  private readonly processingReports = new Set<number>();
  private readonly approvalHistoryLoading = new Set<number>();
  private readonly subscription = new Subscription();

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
        ...ReportsComponent.FULL_SCREEN_DIALOG_CONFIG,
        data,
      }
    );
  }

  openApprovalHistory(row: ReportsRow, event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isApprovalHistoryLoading(row.id)) {
      return;
    }

    this.setApprovalHistoryLoading(row.id, true);

    const load$ = this.apiEndpoints
      .getApprovalHistory(row.id)
      .pipe(
        take(1),
        finalize(() => this.setApprovalHistoryLoading(row.id, false))
      )
      .subscribe({
        next: (history) => {
          const approvers = (history ?? [])
            .map((entry) => this.describeApprovalHistoryDto(entry))
            .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);

          this.dialog.open<ReportApprovalsDialogComponent, ReportApprovalsDialogData>(
            ReportApprovalsDialogComponent,
            {
              ...ReportsComponent.FULL_SCREEN_DIALOG_CONFIG,
              data: { approvers, reportName: row.name },
            }
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load approval history', error);

          const fallback = row.approversHistory ?? [];

          this.dialog.open<ReportApprovalsDialogComponent, ReportApprovalsDialogData>(
            ReportApprovalsDialogComponent,
            {
              ...ReportsComponent.FULL_SCREEN_DIALOG_CONFIG,
              data: { approvers: fallback, reportName: row.name },
            }
          );
        },
      });

    this.subscription.add(load$);
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

  exportReportToPDF(row: ReportsRow, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isReportProcessing(row.id)) {
      return;
    }
    this.setReportProcessing(row.id, true);

    const export$ = this.apiEndpoints
      .exportBiddingReportToPDF(row.id)
      .pipe(
        take(1),
        finalize(() => this.setReportProcessing(row.id, false))
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

    if (row.exception || this.isReportProcessing(row.id) || this.isActiveStatus(row.status)) {
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

    if (this.isReportProcessing(row.id)) {
      return 'Creating exception report…';
    }

    return 'Create exception report';
  }

  isReportProcessing(reportId: number): boolean {
    return this.processingReports.has(reportId);
  }

  isApprovalHistoryLoading(reportId: number): boolean {
    return this.approvalHistoryLoading.has(reportId);
  }

  // data
  private loadReports(): void {
    const filterChanges$ = combineLatest([this.filters.selectedMonth$, this.filters.selectedYear$]);

    this.reports$ = combineLatest([filterChanges$, this.refreshReportsTrigger$]).pipe(
      switchMap(([[monthName, year]]) => {
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
          : (report.reportName ?? '').toLowerCase().includes('exception'),
      approversHistory: this.buildApproversHistory(report),
    };
  }

  private buildApproversHistory(report: BiddingReport): string[] {
    const approvalHistory = (report.approvalHistories ?? [])
      .slice()
      .sort((left, right) => this.getApprovalTimestamp(left?.dateCreated) - this.getApprovalTimestamp(right?.dateCreated))
      .map((entry) => this.describeApprovalHistoryEntry(entry))
      .filter((description): description is string => typeof description === 'string' && description.length > 0);

    if (approvalHistory.length > 0) {
      return approvalHistory;
    }

    const approverDescriptions = (report.approvers ?? [])
      .map((approver) => this.describeApprover(approver))
      .filter((description): description is string => typeof description === 'string' && description.length > 0);

    return approverDescriptions;
  }

  private describeApprovalHistoryEntry(entry: ApprovalHistory | null | undefined): string | null {
    if (!entry) {
      return null;
    }

    const actor =
      entry.actorUser?.displayName?.trim() ||
      entry.actorUser?.email?.trim() ||
      entry.createdBy?.trim() ||
      entry.actorUserId?.trim() ||
      null;

    const eventName = entry.eventType?.name?.trim() || null;
    const timestamp = this.formatApprovalTimestamp(entry.dateCreated);
    const comments = entry.comments?.trim() || null;

    const base = actor && eventName
      ? `${actor} – ${eventName}`
      : actor ?? eventName ?? 'Approval activity';

    const withTimestamp = timestamp ? `${base} (${timestamp})` : base;

    return comments ? `${withTimestamp} – ${comments}` : withTimestamp;
  }

  private describeApprovalHistoryDto(entry: ApprovalHistoryDto | null | undefined): string | null {
    if (!entry) {
      return null;
    }

    const actor = entry.approverName?.trim() || null;
    const action = entry.action?.trim() || null;
    const attempt = typeof entry.attempt === 'number' ? `Attempt ${entry.attempt}` : null;
    const timestamp = this.formatApprovalTimestamp(entry.date);
    const comment = entry.comment?.trim() || null;

    const baseParts = [actor, action, attempt].filter(
      (part): part is string => typeof part === 'string' && part.length > 0
    );

    const base = baseParts.length ? baseParts.join(' – ') : 'Approval activity';
    const withTimestamp = timestamp ? `${base} (${timestamp})` : base;

    return comment ? `${withTimestamp} – ${comment}` : withTimestamp;
  }

  private describeApprover(approver: Approver | null | undefined): string | null {
    if (!approver) {
      return null;
    }

    const name =
      approver.user?.displayName?.trim() ||
      approver.user?.email?.trim() ||
      approver.userId?.trim() ||
      null;

    const delegate =
      approver.delegateUser?.displayName?.trim() ||
      //approver.delegateName?.trim() ||
      approver.delegateUserId?.trim() ||
      null;

    const qualifiers: string[] = [];

    if (approver.isEndorser) {
      qualifiers.push('Endorser');
    }

    if (delegate) {
      qualifiers.push(`Delegate: ${delegate}`);
    }

    const baseName = name ?? 'Unknown approver';

    return qualifiers.length > 0 ? `${baseName} – ${qualifiers.join(', ')}` : baseName;
  }

  private formatApprovalTimestamp(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  }

  private getApprovalTimestamp(value: string | null | undefined): number {
    if (!value) {
      return 0;
    }

    const parsed = new Date(value);
    const timestamp = parsed.getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
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
    this.navigateToNewExceptionReport(targetReportId, row);
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
}
