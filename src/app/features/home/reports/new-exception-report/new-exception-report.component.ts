import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../../core/services/api.service';
import { BiddingReport } from '../bidding-report.interface';
import { BiddingReportDetail } from '../../tender-awards/bidding-report-detail.interface';
import { ReportApproversDto } from '../../../../core/services/api.types';
import {
  ManageApproversDialogComponent,
  ManageApproversDialogData,
  ManageApproversDialogResult,
} from '../../tender-awards/manage-approvers-dialog/manage-approvers-dialog.component';
import {
  SendForApprovalDialogComponent,
  SendForApprovalDialogData,
  SendForApprovalDialogResult,
} from '../../tender-awards/send-for-approval-dialog/send-for-approval-dialog.component';
import { AccessControlService } from '../../../../core/services/access-control.service';

type EditableNumberKey = 'finalAwardedVolume';

type ApprovalAction = 'approve' | 'reject' | 'rollback';

interface EditableExceptionRow {
  id: number;
  product: string;
  bidder: string;
  status: string;
  month: string;
  year: number;
  bidPrice: number | null;
  bidVolume: number | null;
  awardedVolume: number | null;
  finalAwardedVolume: number | null;
  comments: string | null;
}

@Component({
  selector: 'app-new-exception-report',
  templateUrl: './new-exception-report.component.html',
  styleUrls: ['./new-exception-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NewExceptionReportComponent implements OnInit, OnDestroy {
  readonly displayedColumns: (keyof EditableExceptionRow)[] = [
    'product',
    'bidder',
    'status',
    'month',
    'year',
    'bidPrice',
    'bidVolume',
    'awardedVolume',
    'finalAwardedVolume',
    'comments',
  ];

  readonly dataSource = new MatTableDataSource<EditableExceptionRow>([]);

  reportSummary: BiddingReport | null = null;
  reportId: number | null = null;

  isLoading = false;
  loadError = false;
  isSaving = false;
  saveSuccess = false;
  saveError = false;
  isManageApproversLoading = false;
  isSendingForApproval = false;
  isApprovalActionInProgress: ApprovalAction | null = null;
  reportApprovers: ReportApproversDto[] = [];

  private readonly subscription = new Subscription();
  private readonly accessControl = inject(AccessControlService);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscription.add(this.route.queryParamMap.subscribe((params) => this.handleParams(params)));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get isReadOnlyView(): boolean {
    return this.accessControl.isReadOnlyMode();
  }

  trackRow(_: number, row: EditableExceptionRow): number {
    return row.id;
  }

  get isPendingApprovalStatus(): boolean {
    const status = this.reportSummary?.status ?? '';
    return status.trim().toLowerCase() === 'pending approval';
  }

  onNumberChange(row: EditableExceptionRow, key: EditableNumberKey, value: string): void {
    if (this.isReadOnlyView) {
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      row[key] = null;
    } else {
      const parsed = Number(trimmed);
      row[key] = Number.isFinite(parsed) ? parsed : row[key];
    }

    this.refreshTable();
  }

  onCommentsChange(row: EditableExceptionRow, value: string): void {
    if (this.isReadOnlyView) {
      return;
    }

    row.comments = value;
    this.refreshTable();
  }

  save(): void {
    if (this.isReadOnlyView || !this.reportId || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = false;
    this.cdr.markForCheck();

    this.apiEndpoints
      .updateExceptionReport({
        exceptionReportId: this.reportId,
        biddingData: this.dataSource.data.map((row) => ({
          id: row.id,
          bidPrice: row.bidPrice,
          bidVolume: row.bidVolume,
          awardedVolume: row.awardedVolume,
          finalAwardedVolume: row.finalAwardedVolume,
          comments: row.comments,
        })),
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSaving = false;
          this.saveError = true;
          this.cdr.markForCheck();
          // eslint-disable-next-line no-console
          console.error('Failed to update exception report', error);
        },
      });
  }

  get hasData(): boolean {
    return this.dataSource.data.length > 0;
  }

  backToReports(): void {
    void this.router.navigate(['/reports']);
  }

  openManageApproversDialog(): void {
    if (
      !this.accessControl.canManageApprovals() ||
      !this.reportId ||
      this.isManageApproversLoading
    ) {
      return;
    }

    const reportId = this.reportId;
    this.isManageApproversLoading = true;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .getReportApprovers(reportId, { isExceptionReport: true })
      .pipe(
        take(1),
        map((approvers) => this.normalizeReportApprovers(approvers)),
        catchError((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load approvers for exception report', error);
          return of<ReportApproversDto[]>([]);
        })
      )
      .subscribe((approvers) => {
        this.isManageApproversLoading = false;
        this.reportApprovers = approvers;
        this.cdr.markForCheck();

        const dialogRef = this.dialog.open<
          ManageApproversDialogComponent,
          ManageApproversDialogData,
          ManageApproversDialogResult
        >(ManageApproversDialogComponent, {
          width: '760px',
          maxWidth: '95vw',
          data: {
            reportId,
            approvers,
            isExceptionReport: true,
          },
        });

        const close$ = dialogRef.afterClosed().subscribe((result) => {
          if (result?.updated) {
            this.reloadReportApprovers(reportId);
          }
        });

        this.subscription.add(close$);
      });

    this.subscription.add(load$);
  }

  openSendForApprovalDialog(): void {
    if (
      !this.accessControl.canManageApprovals() ||
      !this.reportId ||
      this.isSendingForApproval ||
      this.isApprovalActionInProgress !== null
    ) {
      return;
    }

    const reportId = this.reportId;
    const dialogRef = this.dialog.open<
      SendForApprovalDialogComponent,
      SendForApprovalDialogData | undefined,
      SendForApprovalDialogResult
    >(SendForApprovalDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.isSendingForApproval = true;
      this.cdr.markForCheck();

      const submit$ = this.apiEndpoints
        .startApprovalFlow(reportId, { comment: result.comment ?? null }, { isExceptionReport: true })
        .pipe(
          take(1),
          finalize(() => {
            this.isSendingForApproval = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.setReportPendingStatus();
            this.reloadReportDetails(reportId, true);
          },
          error: (error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to start exception approval flow', error);
          },
        });

      this.subscription.add(submit$);
    });

    this.subscription.add(dialogClosed$);
  }

  approveReport(): void {
    if (
      !this.accessControl.canManageApprovals() ||
      !this.reportId ||
      this.isApprovalActionInProgress !== null
    ) {
      return;
    }

    const reportId = this.reportId;
    this.runApprovalAction('approve', () =>
      this.apiEndpoints.approveApprovalFlow(reportId, { isExceptionReport: true })
    );
  }

  rejectReport(): void {
    if (
      !this.accessControl.canManageApprovals() ||
      !this.reportId ||
      this.isApprovalActionInProgress !== null
    ) {
      return;
    }

    const reportId = this.reportId;
    const dialogRef = this.dialog.open<
      SendForApprovalDialogComponent,
      SendForApprovalDialogData,
      SendForApprovalDialogResult
    >(SendForApprovalDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {
        title: 'Reject Approval',
        description: 'Provide a reason for rejecting this exception report.',
        confirmLabel: 'Reject',
        requireComment: true,
      },
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      if (!result?.comment) {
        return;
      }

      this.runApprovalAction('reject', () =>
        this.apiEndpoints.rejectApprovalFlow(
          reportId,
          { comment: result.comment },
          { isExceptionReport: true }
        )
      );
    });

    this.subscription.add(dialogClosed$);
  }

  rollbackReport(): void {
    if (
      !this.accessControl.canManageApprovals() ||
      !this.reportId ||
      this.isApprovalActionInProgress !== null
    ) {
      return;
    }

    const reportId = this.reportId;
    const dialogRef = this.dialog.open<
      SendForApprovalDialogComponent,
      SendForApprovalDialogData,
      SendForApprovalDialogResult
    >(SendForApprovalDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {
        title: 'Rollback Approval',
        description: 'Provide a comment explaining why this approval should be rolled back.',
        confirmLabel: 'Rollback',
        requireComment: true,
      },
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      if (!result?.comment) {
        return;
      }

      this.runApprovalAction('rollback', () =>
        this.apiEndpoints.rollbackApprovalFlow(
          reportId,
          { comment: result.comment },
          { isExceptionReport: true }
        )
      );
    });

    this.subscription.add(dialogClosed$);
  }

  isApprovalActionPending(action: ApprovalAction): boolean {
    return this.isApprovalActionInProgress === action;
  }

  private handleParams(params: ParamMap): void {
    const reportId = this.parseReportId(params.get('reportId'));

    if (!reportId) {
      this.reportId = null;
      this.dataSource.data = [];
      this.loadError = true;
      this.cdr.markForCheck();
      return;
    }

    if (this.reportId === reportId && this.dataSource.data.length > 0) {
      return;
    }

    this.reportId = reportId;
    this.loadReportSummary(reportId);
    this.loadDetails(reportId);
  }

  private loadReportSummary(reportId: number, forceReload = false): void {
    if (!forceReload) {
      const resolved = this.resolveReportSummary(reportId);
      if (resolved) {
        this.reportSummary = resolved;
        this.cdr.markForCheck();
        return;
      }
    }

    this.apiEndpoints
      .getBiddingReports()
      .pipe(
        take(1),
        map((reports) => reports.find((report) => report.id === reportId) ?? null)
      )
      .subscribe((summary) => {
        this.reportSummary = summary;
        this.cdr.markForCheck();
      });
  }

  private loadDetails(reportId: number): void {
    this.isLoading = true;
    this.loadError = false;
    this.saveSuccess = false;
    this.saveError = false;
    this.cdr.markForCheck();

    this.apiEndpoints
      .getBiddingReportDetails(reportId, { isExceptionReport: true })
      .pipe(take(1))
      .subscribe({
        next: (details) => {
          this.isLoading = false;
          this.dataSource.data = this.toEditableRows(details.details);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          this.loadError = true;
          this.dataSource.data = [];
          this.cdr.markForCheck();
          // eslint-disable-next-line no-console
          console.error('Failed to load exception report details', error);
        },
      });
  }

  private toEditableRows(details: BiddingReportDetail[]): EditableExceptionRow[] {
    return details.map((detail) => ({
      id: detail.id ?? 0,
      product: detail.product ?? '',
      bidder: detail.bidder ?? '',
      status: detail.status ?? '',
      month: detail.month ?? '',
      year: detail.year ?? 0,
      bidPrice: detail.bidPrice ?? null,
      bidVolume: detail.bidVolume ?? null,
      awardedVolume: detail.awardedVolume ?? null,
      finalAwardedVolume: detail.finalAwardedVolume ?? null,
      comments: detail.comments ?? null,
    }));
  }

  private refreshTable(): void {
    this.saveSuccess = false;
    this.saveError = false;
    this.dataSource.data = [...this.dataSource.data];
    this.cdr.markForCheck();
  }

  private normalizeReportApprovers(
    approvers: ReportApproversDto[] | null | undefined
  ): ReportApproversDto[] {
    if (!Array.isArray(approvers)) {
      return [];
    }

    return approvers
      .filter(
        (approver): approver is ReportApproversDto =>
          !!approver && typeof approver === 'object' && !Array.isArray(approver)
      )
      .map((approver) => ({ ...approver }));
  }

  private reloadReportApprovers(reportId: number): void {
    this.isManageApproversLoading = true;
    this.cdr.markForCheck();

    const reload$ = this.apiEndpoints
      .getReportApprovers(reportId, { isExceptionReport: true })
      .pipe(
        take(1),
        map((approvers) => this.normalizeReportApprovers(approvers)),
        catchError((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to refresh approvers for exception report', error);
          return of<ReportApproversDto[]>([]);
        }),
        finalize(() => {
          this.isManageApproversLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((approvers) => {
        this.reportApprovers = approvers;
      });

    this.subscription.add(reload$);
  }

  private reloadReportDetails(reportId: number, forceSummaryReload = false): void {
    this.loadReportSummary(reportId, forceSummaryReload);
    this.loadDetails(reportId);
  }

  private runApprovalAction(action: ApprovalAction, actionFactory: () => Observable<void>): void {
    if (!this.reportId || this.isApprovalActionInProgress !== null) {
      return;
    }

    this.isApprovalActionInProgress = action;
    this.cdr.markForCheck();

    const submit$ = actionFactory()
      .pipe(
        take(1),
        finalize(() => {
          this.isApprovalActionInProgress = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          if (this.reportId) {
            this.reloadReportDetails(this.reportId, true);
          }
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update exception report approval flow', error);
        },
      });

    this.subscription.add(submit$);
  }

  private parseReportId(raw: string | null): number | null {
    if (!raw) {
      return null;
    }

    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private resolveReportSummary(reportId: number): BiddingReport | null {
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state as { reportSummary?: BiddingReport } | undefined;
    if (navState?.reportSummary?.id === reportId) {
      return navState.reportSummary;
    }

    if (typeof window !== 'undefined') {
      const historyState = window.history?.state as { reportSummary?: BiddingReport } | undefined;
      if (historyState?.reportSummary?.id === reportId) {
        return historyState.reportSummary;
      }

      try {
        const stored = window.sessionStorage?.getItem(`tender-awards-report-summary-${reportId}`);
        if (stored) {
          const parsed = JSON.parse(stored) as BiddingReport;
          if (parsed?.id === reportId) {
            return parsed;
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load exception report summary from storage', error);
      }
    }

    return null;
  }

  private setReportPendingStatus(): void {
    if (this.reportSummary) {
      this.reportSummary = { ...this.reportSummary, status: 'Pending Approval' };
    }

    this.cdr.markForCheck();
  }
}
