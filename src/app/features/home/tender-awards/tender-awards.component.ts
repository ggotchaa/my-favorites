import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import { HomeFiltersService } from '../services/home-filters.service';
import { BiddingReport } from '../reports/bidding-report.interface';
import { BiddingReportDetail } from './bidding-report-detail.interface';
import {
  TenderStatusDialogComponent,
  TenderStatusDialogData,
  TenderStatusDialogResult
} from './status-change-dialog/tender-status-dialog.component';
import {
  SendForApprovalDialogComponent,
  SendForApprovalDialogData,
  SendForApprovalDialogResult,
} from './send-for-approval-dialog/send-for-approval-dialog.component';
import {
  ManageBiddersDialogComponent,
  ManageBiddersDialogData,
  ManageBiddersDialogResult,
} from './manage-bidders-dialog/manage-bidders-dialog.component';
import {
  ManageApproversDialogComponent,
  ManageApproversDialogData,
  ManageApproversDialogResult,
} from './manage-approvers-dialog/manage-approvers-dialog.component';
import { BiddingReportHistoryEntry } from '../reports/report-history-entry.interface';
import {
  TenderAwardsInitiateStage,
  TenderAwardsWorkflowState,
  TENDER_AWARDS_WORKFLOW_STORAGE_KEY,
} from './tender-awards-workflow-state';

type TenderTab = 'Initiate' | 'History' | 'Active';
type TenderTabSlug = 'initiate' | 'history' | 'active';
type AwardsTableRow = BiddingReportDetail;
type ApprovalAction = 'approve' | 'reject' | 'rollback';

type TenderAwardsNavigationState = {
  reportSummary?: BiddingReport;
  tenderAwardsWorkflow?: TenderAwardsWorkflowState;
};

interface DataColumn {
  key: string;
  label: string;
}

type ProductKey = 'butane' | 'propane';

interface ProductTableConfig {
  key: ProductKey;
  label: string;
  dataSource: MatTableDataSource<AwardsTableRow>;
}

@Component({
  selector: 'app-tender-awards',
  templateUrl: './tender-awards.component.html',
  styleUrls: ['./tender-awards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TenderAwardsComponent implements AfterViewInit, OnDestroy, OnInit {
  private static readonly STATUS_DIALOG_CONFIG: MatDialogConfig = {
    width: '420px',
    maxWidth: '90vw',
    autoFocus: false,
  };

  private static readonly TAB_SLUG_TO_LABEL: Record<TenderTabSlug, TenderTab> = {
    initiate: 'Initiate',
    history: 'History',
    active: 'Active',
  };

  propaneSummary = {
    totalVolume: 0,
    weightedAverage: 0,
    difference: 0,
    totalRk: 0,
  };

  butaneSummary = {
    totalVolume: 0,
    weightedAverage: 0,
    difference: 0,
    totalRk: 0,
  };

  statistics = {
    invitedBuyers: 50,
    participatedBuyers: 30,
    period: "SEPTEMBER'S",
    totalBidVolume: 0,
    totalLpgForRk: 0,
    weightedAverage: 0,
  };

  showExportMenu = false;

  activeTab: TenderTab = 'Active';
  private currentTabSlug: TenderTabSlug = 'active';
  currentReportId: number | null = null;

  readonly monthOptions: string[];
  readonly yearOptions: number[];

  collectionForm!: {
    month: string;
    year: number;
    entryPricePropane: number | null;
    benchmarkButane: number | null;
  };

  collectionError: string | null = null;
  processingError: string | null = null;
  processingResultMessage: string | null = null;

  proposalsSuccessMessage: string | null = null;
  proposalsError: string | null = null;

  isCollectionLoading = false;
  isCollectionCompleted = false;

  isProcessingAvailable = false;
  isProcessingLoading = false;
  isProcessingCompleted = false;

  isCompletionAvailable = false;

  private initiatedReportId: number | null = null;

  readonly historyColumns: DataColumn[] = [
    { key: 'customerName', label: 'Customer' },
    { key: 'biddingMonth', label: 'Month' },
    { key: 'biddingYear', label: 'Year' },
    { key: 'finalAwardedPR', label: 'Final Awarded PR' },
    { key: 'finalAwardedBT', label: 'Final Awarded BT' },
    { key: 'status', label: 'Status' },
    { key: 'comments', label: 'Comments' },
  ];

  readonly awardsColumns: DataColumn[] = [
    { key: 'bidder', label: 'Bidder' },
    { key: 'status', label: 'Status' },
    { key: 'bidVolume', label: 'Bid Volume' },
    { key: 'awardedVolume', label: 'Awarded Volume' },
    { key: 'finalAwardedVolume', label: 'Final Awarded Volume' },
    { key: 'bidPrice', label: 'Bid Price' },
    { key: 'differentialPrice', label: 'Differential Price' },
    { key: 'rankPerPrice', label: 'Rank per Price' },
    { key: 'rollingLiftFactor', label: 'Rolling Lift Factor' },
    { key: 'comments', label: 'Comments' }
  ];

  readonly statusOptions: string[] = ['Nominated', 'Deactivate', 'Suspend'];

  readonly historyDataSource = this.buildDataSource<BiddingReportHistoryEntry>([]);
  readonly awardTables: Record<ProductKey, ProductTableConfig> = {
    butane: {
      key: 'butane',
      label: 'Butane Awards',
      dataSource: this.buildDataSource<AwardsTableRow>([]),
    },
    propane: {
      key: 'propane',
      label: 'Propane Awards',
      dataSource: this.buildDataSource<AwardsTableRow>([]),
    },
  };

  readonly awardTableList: ProductTableConfig[] = [
    this.awardTables.propane,
    this.awardTables.butane,
  ];

  readonly tableExpansion: Record<ProductKey, boolean> = {
    propane: true,
    butane: true,
  };

  private awardDetails: AwardsTableRow[] = [];
  private originalAwardDetails = new Map<number, { comments: string | null; finalAwardedVolume: number | null }>();
  private pendingUpdates = new Map<number, { id: number; comments: string | null; finalAwardedVolume: number | null }>();
  private statusUpdatesInProgress = new Set<number>();

  reportFilePath: string | null = null;
  reportFileName: string | null = null;
  hasPendingChanges = false;
  isSavingChanges = false;
  isLoadingHistory = false;
  historyLoadError = false;
  historyReportId: number | null = null;

  selectedMonth = '';
  selectedYear!: number | 'All';
  isLoadingProposals = false;
  isLoadingDetails = false;
  detailsLoadError = false;
  isSendingForApproval = false;
  isManageApproversLoading = false;
  reportSummary: BiddingReport | null = null;
  reportCreatedBy: string | null = null;
  reportStatus: string | null = null;
  private approvalActionInProgress: ApprovalAction | null = null;

  @ViewChild('historySort') historySort?: MatSort;
  @ViewChild('butaneSort') butaneSort?: MatSort;
  @ViewChild('propaneSort') propaneSort?: MatSort;
  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.monthOptions = [...this.filters.months];
    this.yearOptions = [...this.filters.years];

    const initialMonth = this.filters.selectedMonth;
    const initialYear = this.filters.selectedYear;

    this.selectedMonth = initialMonth;
    this.selectedYear = initialYear;

    const defaultMonth = initialMonth === 'All' ? '' : initialMonth;
    const defaultYear =
      typeof initialYear === 'number' ? initialYear : this.yearOptions[0];

    this.collectionForm = {
      month: defaultMonth,
      year: defaultYear,
      entryPricePropane: null,
      benchmarkButane: null,
    };

    this.subscription.add(
      this.filters.selectedMonth$.subscribe((month) => {
        this.selectedMonth = month;
        if (this.filters.isLoading) {
          this.filters.completeLoading();
        }
      })
    );

    this.subscription.add(
      this.filters.selectedYear$.subscribe((year) => {
        this.selectedYear = year;
        if (this.filters.isLoading) {
          this.filters.completeLoading();
        }
      })
    );
  }

  get historyDisplayedColumns(): string[] {
    return [...this.historyColumns.map((column) => column.key), 'actions'];
  }

  get awardsDisplayedColumns(): string[] {
    return this.awardsColumns.map(c => c.key);
  }

  get hasAwardData(): boolean {
    return this.awardTableList.some((table) => table.dataSource.data.length > 0);
  }

  get progressStep(): number {
    if (this.isProcessingCompleted) {
      return 3;
    }

    if (this.isCollectionCompleted) {
      return 2;
    }

    return 1;
  }

  get progressValue(): number {
    switch (this.progressStep) {
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 33;
    }
  }

  get canStartCollection(): boolean {
    return (
      Boolean(this.collectionForm.month) &&
      Number.isFinite(this.collectionForm.year) &&
      !this.isCollectionLoading &&
      !this.isCollectionCompleted
    );
  }

  get canAnalyzeAndProcess(): boolean {
    return (
      this.isProcessingAvailable &&
      !this.isProcessingLoading &&
      !this.isProcessingCompleted &&
      this.initiatedReportId !== null
    );
  }

  get isPendingApprovalStatus(): boolean {
    const resolvedStatus = this.reportStatus ?? this.reportSummary?.status ?? null;
    return resolvedStatus === 'Pending Approval';
  }

  toggleTableExpansion(product: ProductKey): void {
    this.tableExpansion[product] = !this.tableExpansion[product];
    this.cdr.markForCheck();
  }

  isTableExpanded(product: ProductKey): boolean {
    return this.tableExpansion[product];
  }

  ngOnInit(): void {
    this.subscription.add(
      this.route.paramMap.subscribe((params) => this.handleRouteParams(params))
    );
  }

  startDataCollection(): void {
    if (!this.canStartCollection) {
      return;
    }

    const monthIndex = this.monthOptions.findIndex(
      (month) => month === this.collectionForm.month
    );

    if (monthIndex < 0) {
      this.collectionError = 'Select a valid month to continue.';
      this.cdr.markForCheck();
      return;
    }

    const selectedYear = this.collectionForm.year;

    if (!Number.isFinite(selectedYear)) {
      this.collectionError = 'Select a valid year to continue.';
      this.cdr.markForCheck();
      return;
    }

    const reportDate = this.buildReportDate(monthIndex + 1, selectedYear);

    this.collectionError = null;
    this.processingResultMessage = null;
    this.proposalsSuccessMessage = null;
    this.proposalsError = null;
    this.isCollectionLoading = true;

    const create$ = this.apiEndpoints
      .createBiddingReport({ reportDate })
      .pipe(
        take(1),
        finalize(() => {
          this.isCollectionLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (report) => {
          this.initiatedReportId = report.id ?? null;
          this.currentReportId = this.initiatedReportId;
          this.reportSummary = report;
          this.isCollectionCompleted = true;
          this.processingError = null;
          this.isProcessingCompleted = false;
          this.isProcessingAvailable = this.initiatedReportId !== null;
          this.isCompletionAvailable = false;

          this.filters.applyFilters(this.collectionForm.month, this.collectionForm.year);

          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to create bidding report', error);
          this.collectionError = 'Unable to create bidding report. Please try again.';
          this.cdr.markForCheck();
        },
      });

    this.subscription.add(create$);
  }

  analyzeAndProcess(): void {
    if (!this.canAnalyzeAndProcess) {
      return;
    }

    this.processingError = null;
    this.processingResultMessage = null;
    this.isProcessingLoading = true;

    const analyze$ = this.apiEndpoints
      .analyzeShipments({ biddingReportId: this.initiatedReportId ?? undefined })
      .pipe(
        take(1),
        finalize(() => {
          this.isProcessingLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (message) => {
          this.processingResultMessage = message ?? null;
          this.isProcessingCompleted = true;
          this.isCompletionAvailable = true;
          this.proposalsSuccessMessage = null;
          this.proposalsError = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to analyze shipments', error);
          this.processingError = 'Unable to analyze shipments. Please try again.';
          this.cdr.markForCheck();
        },
      });

    this.subscription.add(analyze$);
  }

  ngAfterViewInit(): void {
    if (this.historySort) {
      this.historyDataSource.sort = this.historySort;
    }

    const butaneSort = this.butaneSort;
    if (butaneSort) {
      this.awardTables.butane.dataSource.sort = butaneSort;
    }

    const propaneSort = this.propaneSort;
    if (propaneSort) {
      this.awardTables.propane.dataSource.sort = propaneSort;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isStatusUpdating(rowId: number): boolean {
    return this.statusUpdatesInProgress.has(rowId);
  }

  openProposalsDialog(): void {
    if (this.isLoadingProposals) {
      return;
    }

    const reportId = this.currentReportId ?? this.initiatedReportId ?? undefined;

    if (typeof reportId !== 'number') {
      this.proposalsError = 'No bidding report available to update.';
      this.proposalsSuccessMessage = null;
      this.cdr.markForCheck();
      return;
    }

    this.proposalsSuccessMessage = null;
    this.proposalsError = null;
    this.isLoadingProposals = true;

    const load$ = this.apiEndpoints
      .updateBiddingProposals({ biddingReportId: reportId })
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadingProposals = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (message) => {
          this.proposalsSuccessMessage = message ?? 'Proposals updated successfully.';
          this.proposalsError = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update bidding proposals', error);
          this.proposalsError = 'Unable to update proposals. Please try again.';
          this.proposalsSuccessMessage = null;
          this.cdr.markForCheck();
        },
      });

    this.subscription.add(load$);
  }

  navigateToTab(tab: TenderTab): void {
    const slug = tab.toLowerCase() as TenderTabSlug;
    const commands: (string | number)[] = ['/tender-awards', slug];

    if (slug === 'active' && this.currentReportId !== null) {
      commands.push('report', this.currentReportId);
    }

    void this.router.navigate(commands);
  }

  valueFor(row: Record<string, unknown>, key: string): string | number | Date | undefined {
    const value = row[key];
    if (typeof value === 'number' || value instanceof Date || typeof value === 'string') {
      return value;
    }

    return undefined;
  }

  statusClass(status: unknown): string {
    const normalized = typeof status === 'string' ? status.toLowerCase() : String(status ?? '').toLowerCase();

    switch (normalized) {
      case 'pending':
        return 'status-badge--pending';
      case 'active':
        return 'status-badge--active';
      case 'completed':
      case 'complete':
        return 'status-badge--completed';
      case 'nominated':
        return 'status-badge--nominated';
      case 'deactivate':
      case 'deactivated':
      case 'inactive':
        return 'status-badge--inactive';
      case 'suspend':
      case 'suspended':
        return 'status-badge--suspended';
      default:
        return 'status-badge--default';
    }
  }

  openStatusDialog<T extends Record<string, unknown> & { id?: number; status?: string; biddingReportId?: number }>(
    row: T,
    dataSource: MatTableDataSource<T>
  ): void {
    const data: TenderStatusDialogData = {
      currentStatus: row.status ?? this.statusOptions[0],
      statusOptions: this.statusOptions
    };

    const dialogRef = this.dialog.open<
      TenderStatusDialogComponent,
      TenderStatusDialogData,
      TenderStatusDialogResult
    >(TenderStatusDialogComponent, {
      ...TenderAwardsComponent.STATUS_DIALOG_CONFIG,
      data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.applyStatusChange(row, dataSource, result);
    });
  }

  private applyStatusChange<T extends Record<string, unknown> & { id?: number; status?: string; biddingReportId?: number }>(
    row: T,
    dataSource: MatTableDataSource<T>,
    result: TenderStatusDialogResult
  ): void {
    const biddingDataId = typeof row.id === 'number' ? row.id : Number(row['biddingDataId']);
    const reportIdCandidate =
      typeof row.biddingReportId === 'number' ? row.biddingReportId : Number(row['biddingReportId']);
    const biddingReportId = Number.isFinite(reportIdCandidate)
      ? reportIdCandidate
      : this.currentReportId;

    if (!Number.isFinite(biddingDataId) || !Number.isFinite(biddingReportId)) {
      return;
    }

    const payload = {
      biddingReportId: Number(biddingReportId),
      biddingDataIds: [Number(biddingDataId)],
      status: result.newStatus,
      dateFrom: result.dateFrom ? result.dateFrom.toISOString() : null,
      dateTo: result.dateTo ? result.dateTo.toISOString() : null,
    };

    this.statusUpdatesInProgress.add(Number(biddingDataId));
    this.cdr.markForCheck();

    const update$ = this.apiEndpoints
      .updateBiddingDataStatus(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.statusUpdatesInProgress.delete(Number(biddingDataId));
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          row.status = result.newStatus;
          dataSource.data = [...dataSource.data];
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update bidding data status', error);
        },
      });

    this.subscription.add(update$);
  }

  openSendForApprovalDialog(): void {
    if (this.currentReportId === null || this.isSendingForApproval || this.approvalActionInProgress) {
      return;
    }

    const reportId = this.currentReportId;
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
        .startApprovalFlow(reportId, { comment: result.comment ?? null })
        .pipe(
          take(1),
          finalize(() => {
            this.isSendingForApproval = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          error: (error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to start approval flow', error);
          },
        });

      this.subscription.add(submit$);
    });

    this.subscription.add(dialogClosed$);
  }

  approveReport(): void {
    if (this.currentReportId === null || this.approvalActionInProgress !== null) {
      return;
    }

    const reportId = this.currentReportId;
    this.runApprovalAction('approve', () => this.apiEndpoints.approveApprovalFlow(reportId));
  }

  rejectReport(): void {
    if (this.currentReportId === null || this.approvalActionInProgress !== null) {
      return;
    }

    const reportId = this.currentReportId;
    const dialogRef = this.dialog.open<
      SendForApprovalDialogComponent,
      SendForApprovalDialogData,
      SendForApprovalDialogResult
    >(SendForApprovalDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {
        title: 'Reject Approval',
        description: 'Provide a reason for rejecting this approval request.',
        confirmLabel: 'Reject',
        requireComment: true,
      },
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      if (!result?.comment) {
        return;
      }

      this.runApprovalAction('reject', () =>
        this.apiEndpoints.rejectApprovalFlow(reportId, { comment: result.comment })
      );
    });

    this.subscription.add(dialogClosed$);
  }

  rollbackReport(): void {
    if (this.currentReportId === null || this.approvalActionInProgress !== null) {
      return;
    }

    const reportId = this.currentReportId;
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
        this.apiEndpoints.rollbackApprovalFlow(reportId, { comment: result.comment })
      );
    });

    this.subscription.add(dialogClosed$);
  }

  isApprovalActionInProgress(action: ApprovalAction): boolean {
    return this.approvalActionInProgress === action;
  }

  onCommentChange(row: AwardsTableRow, comments: string): void {
    row.comments = comments;
    this.registerPendingChange(row);
  }

  onFinalAwardedVolumeChange(row: AwardsTableRow, value: string | number | null): void {
    const numericValue =
      value === null || value === ''
        ? null
        : typeof value === 'number'
          ? value
          : Number(value);

    if (typeof numericValue === 'number' && Number.isNaN(numericValue)) {
      return;
    }

    row.finalAwardedVolume = numericValue ?? null;
    this.registerPendingChange(row);
  }

  savePendingChanges(): void {
    if (this.currentReportId === null || this.pendingUpdates.size === 0 || this.isSavingChanges) {
      return;
    }

    const updates = Array.from(this.pendingUpdates.values()).map((entry) => ({
      id: entry.id,
      comments: this.normalizeComment(entry.comments),
      finalAwardedVolume: entry.finalAwardedVolume,
    }));

    this.isSavingChanges = true;
    this.cdr.markForCheck();

    const save$ = this.apiEndpoints
      .updateActiveBiddingReport(this.currentReportId, updates)
      .pipe(
        take(1),
        finalize(() => {
          this.isSavingChanges = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.resetPendingChanges(this.awardDetails);
          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to save bidding report updates', error);
        },
      });

    this.subscription.add(save$);
  }

  private buildReportDate(month: number, year: number): string {
    const currentDay = new Date().getDate();
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(currentDay).padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  private buildDataSource<T extends object>(rows: T[]): MatTableDataSource<T> {
    const dataSource = new MatTableDataSource(rows);
    dataSource.sortingDataAccessor = (item: any, property: string) => this.sortingDataAccessor(item as Record<string, unknown>, property);
    return dataSource;
  }

  private sortingDataAccessor(item: Record<string, unknown>, property: string): string | number {
    const value = item[property];

    if (typeof value === 'number') {
      return value;
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'string') {
      const numericCandidate = Number(value.replace(/[^0-9.-]+/g, ''));
      if (!Number.isNaN(numericCandidate) && value.match(/[0-9]/)) {
        return numericCandidate;
      }

      return value.toLowerCase();
    }

    return '';
  }

  private handleRouteParams(params: ParamMap): void {
    const tabSlug = this.normalizeTabSlug(params.get('tab'));
    this.currentTabSlug = tabSlug;
    this.activeTab = TenderAwardsComponent.TAB_SLUG_TO_LABEL[tabSlug];

    if (tabSlug === 'history') {
      this.applyInitiateWorkflowState(null);
      const reportId = this.parseReportId(params.get('reportId'));
      this.historyReportId = reportId;
      this.clearActiveReport();

      if (reportId === null) {
        this.clearHistory();
      } else {
        this.loadReportHistory(reportId);
      }

      return;
    }

    this.historyReportId = null;
    this.clearHistory();

    if (tabSlug === 'initiate') {
      this.clearActiveReport();
      const workflowState = this.resolveInitiateWorkflowState();
      this.applyInitiateWorkflowState(workflowState);
      const reportId = workflowState?.reportId ?? null;
      this.reportSummary = reportId !== null ? this.resolveReportSummary(reportId) : null;
      this.cdr.markForCheck();
      return;
    }

    if (tabSlug !== 'active') {
      this.applyInitiateWorkflowState(null);
      this.clearActiveReport();
      return;
    }

    const reportId = this.parseReportId(params.get('reportId'));
    if (reportId === null) {
      this.clearActiveReport();
      return;
    }

    this.applyInitiateWorkflowState(null);
    this.currentReportId = reportId;
    const summary = this.resolveReportSummary(reportId);
    this.reportSummary = summary ?? (this.reportSummary?.id === reportId ? this.reportSummary : null);
    this.loadReportDetails(reportId);
  }

  private applyInitiateWorkflowState(
    workflowState: TenderAwardsWorkflowState | null
  ): void {
    this.initiatedReportId = workflowState?.reportId ?? null;
    this.isCollectionLoading = false;
    this.collectionError = null;
    this.isCollectionCompleted = false;
    this.isProcessingAvailable = false;
    this.isProcessingLoading = false;
    this.isProcessingCompleted = false;
    this.processingError = null;
    this.processingResultMessage = null;
    this.isCompletionAvailable = false;
    this.proposalsError = null;
    this.proposalsSuccessMessage = null;
    this.isLoadingProposals = false;

    if (!workflowState) {
      return;
    }

    this.isCollectionCompleted = true;
    this.isProcessingAvailable = true;

    if (workflowState.stage === 'processing-complete') {
      this.isProcessingCompleted = true;
      this.isCompletionAvailable = true;
    }
  }

  private resolveInitiateWorkflowState(): TenderAwardsWorkflowState | null {
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state as TenderAwardsNavigationState | undefined;
    const navWorkflow = navState?.tenderAwardsWorkflow;

    if (
      navWorkflow &&
      typeof navWorkflow.reportId === 'number' &&
      this.isValidInitiateStage(navWorkflow.stage)
    ) {
      return navWorkflow;
    }

    if (typeof window !== 'undefined') {
      const historyState = window.history?.state as TenderAwardsNavigationState | undefined;
      const historyWorkflow = historyState?.tenderAwardsWorkflow;

      if (
        historyWorkflow &&
        typeof historyWorkflow.reportId === 'number' &&
        this.isValidInitiateStage(historyWorkflow.stage)
      ) {
        return historyWorkflow;
      }

      try {
        const stored = window.sessionStorage?.getItem(
          TENDER_AWARDS_WORKFLOW_STORAGE_KEY
        );

        if (stored) {
          const parsed = JSON.parse(stored) as TenderAwardsWorkflowState;
          if (
            typeof parsed?.reportId === 'number' &&
            this.isValidInitiateStage(parsed.stage)
          ) {
            return parsed;
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load tender awards workflow state', error);
      }
    }

    return null;
  }

  private isValidInitiateStage(stage: unknown): stage is TenderAwardsInitiateStage {
    return stage === 'collection-complete' || stage === 'processing-complete';
  }

  private normalizeTabSlug(rawTab: string | null): TenderTabSlug {
    const normalized = (rawTab ?? 'active').toLowerCase();

    if (normalized === 'history' || normalized === 'initiate') {
      return normalized;
    }

    return 'active';
  }

  private parseReportId(rawValue: string | null): number | null {
    if (!rawValue) {
      return null;
    }

    const numeric = Number(rawValue);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private loadReportDetails(reportId: number): void {
    this.isLoadingDetails = true;
    this.detailsLoadError = false;
    this.reportCreatedBy = null;
    this.reportStatus = null;
    this.cdr.markForCheck();

    const details$ = this.apiEndpoints.getBiddingReportDetails(reportId).pipe(take(1));
    const summary$ = this.loadReportSummary(reportId);

    const load$ = forkJoin([details$, summary$]).subscribe({
      next: ([detailsResult, summary]) => {
        const resolvedSummary = summary ?? this.reportSummary;
        this.reportSummary = resolvedSummary ?? null;
        this.awardDetails = detailsResult.details;
        this.reportFileName = detailsResult.reportFileName ?? null;
        this.reportFilePath = detailsResult.reportFilePath ?? null;
        this.reportCreatedBy = detailsResult.createdBy ?? resolvedSummary?.createdBy ?? null;
        this.reportStatus = detailsResult.status ?? resolvedSummary?.status ?? null;
        this.updateAwardTables();
        this.resetPendingChanges(this.awardDetails);
        this.isLoadingDetails = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.awardDetails = [];
        this.clearAwardTables();
        this.clearPendingChanges();
        this.reportFileName = null;
        this.reportFilePath = null;
        this.reportCreatedBy = null;
        this.reportStatus = null;
        this.isLoadingDetails = false;
        this.detailsLoadError = true;
        this.cdr.markForCheck();
        // eslint-disable-next-line no-console
        console.error('Failed to load bidding report details', error);
      }
    });

    this.subscription.add(load$);
  }

  private clearActiveReport(): void {
    this.currentReportId = null;
    this.reportSummary = null;
    this.awardDetails = [];
    this.clearAwardTables();
    this.clearPendingChanges();
    this.reportFileName = null;
    this.reportFilePath = null;
    this.isLoadingDetails = false;
    this.detailsLoadError = false;
    this.reportCreatedBy = null;
    this.reportStatus = null;
    this.cdr.markForCheck();
  }

  private resolveReportSummary(reportId: number): BiddingReport | null {
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state as TenderAwardsNavigationState | undefined;
    if (navState?.reportSummary?.id === reportId) {
      return navState.reportSummary;
    }

    if (typeof window !== 'undefined') {
      const historyState = window.history?.state as TenderAwardsNavigationState | undefined;
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
        console.error('Failed to load tender award report summary from storage', error);
      }
    }

    return null;
  }

  private loadReportSummary(reportId: number): Observable<BiddingReport | null> {
    if (this.reportSummary?.id === reportId) {
      return of(this.reportSummary).pipe(take(1));
    }

    return this.apiEndpoints
      .getBiddingReports()
      .pipe(
        map((reports) => reports.find((report) => report.id === reportId) ?? null),
        take(1)
      );
  }

  // private updateAwardTables(): void {
  //   for (const table of this.awardTableList) {
  //     table.dataSource.data = this.filterAwardsByProduct(table.key);
  //   }
  // }

  private clearAwardTables(): void {
    for (const table of this.awardTableList) {
      table.dataSource.data = [];
    }
  }

  private refreshAwardTables(): void {
    for (const table of this.awardTableList) {
      table.dataSource.data = [...table.dataSource.data];
    }
    this.cdr.markForCheck();
  }

  private runApprovalAction(action: ApprovalAction, actionFactory: () => Observable<void>): void {
    if (this.approvalActionInProgress !== null) {
      return;
    }

    this.approvalActionInProgress = action;
    this.cdr.markForCheck();

    const submit$ = actionFactory()
      .pipe(
        take(1),
        finalize(() => {
          this.approvalActionInProgress = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          if (this.currentReportId !== null) {
            this.loadReportDetails(this.currentReportId);
          }
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update approval flow', error);
        },
      });

    this.subscription.add(submit$);
  }

  private filterAwardsByProduct(product: ProductKey): AwardsTableRow[] {
    return this.awardDetails.filter((detail) => this.normalizeProduct(detail.product) === product);
  }

  private normalizeProduct(product: string | null | undefined): ProductKey | null {
    const normalized = (product ?? '').trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    if (normalized.includes('butane')) {
      return 'butane';
    }

    if (normalized.includes('propane')) {
      return 'propane';
    }

    return null;
  }

   toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  exportToExcel(): void {
    console.log('Exporting to Excel...');
    this.showExportMenu = false;
    // TODO: Implement Excel export
  }

  exportToPDF(): void {
    console.log('Exporting to PDF...');
    this.showExportMenu = false;
    // TODO: Implement PDF export
  }

  openCommentsDialog(): void {
    console.log('Opening comments dialog...');
    // TODO: Implement comments dialog
  }

  private updateAwardTables(): void {
    // Propane first, then Butane
    this.awardTables.propane.dataSource.data = this.filterAwardsByProduct('propane');
    this.awardTables.butane.dataSource.data = this.filterAwardsByProduct('butane');
    
    this.calculateSummaries();
  }

  private calculateSummaries(): void {
    // Calculate Propane summaries
    const propaneData = this.awardTables.propane.dataSource.data;
    this.propaneSummary = {
      totalVolume: propaneData.reduce((sum, row) => sum + (row.bidVolume || 0), 0),
      weightedAverage: this.calculateWeightedAverage(propaneData),
      difference: 1000, // TODO: Calculate from previous month
      totalRk: propaneData.reduce((sum, row) => sum + (row.finalAwardedVolume || 0), 0),
    };

    // Calculate Butane summaries
    const butaneData = this.awardTables.butane.dataSource.data;
    this.butaneSummary = {
      totalVolume: butaneData.reduce((sum, row) => sum + (row.bidVolume || 0), 0),
      weightedAverage: this.calculateWeightedAverage(butaneData),
      difference: -3, // TODO: Calculate from previous month
      totalRk: butaneData.reduce((sum, row) => sum + (row.finalAwardedVolume || 0), 0),
    };

    // Update statistics
    this.statistics.totalBidVolume = this.propaneSummary.totalVolume + this.butaneSummary.totalVolume;
    this.statistics.totalLpgForRk = this.propaneSummary.totalRk + this.butaneSummary.totalRk;
    this.statistics.weightedAverage = this.calculateOverallWeightedAverage();
    
    this.cdr.markForCheck();
  }

  private calculateWeightedAverage(data: AwardsTableRow[]): number {
    const totalVolume = data.reduce((sum, row) => sum + (row.bidVolume || 0), 0);
    if (totalVolume === 0) return 0;
    
    const weightedSum = data.reduce((sum, row) => {
      return sum + ((row.bidPrice || 0) * (row.bidVolume || 0));
    }, 0);
    
    return weightedSum / totalVolume;
  }

  private calculateOverallWeightedAverage(): number {
    const allData = [
      ...this.awardTables.propane.dataSource.data,
      ...this.awardTables.butane.dataSource.data
    ];
    return this.calculateWeightedAverage(allData);
  }

  calculate12MonthsRLF(): void {
    console.log('Calculate 12 months RLF');
    // TODO: Implement calculate 12 months RLF logic
  }

  openManageApproversDialog(): void {
    if (this.currentReportId === null || this.isManageApproversLoading) {
      return;
    }

    const reportId = this.currentReportId;
    this.isManageApproversLoading = true;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .getReportApprovers(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isManageApproversLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (approvers) => {
          this.dialog.open<
            ManageApproversDialogComponent,
            ManageApproversDialogData,
            ManageApproversDialogResult
          >(ManageApproversDialogComponent, {
            width: '760px',
            maxWidth: '95vw',
            data: { reportId, approvers },
          });
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load report approvers', error);
        },
      });

    this.subscription.add(load$);
  }

  openAndDownload(): void {
    if (!this.reportFilePath) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.open(this.reportFilePath, '_blank');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unable to open report file', error);
    }
  }

  private loadReportHistory(reportId: number): void {
    this.isLoadingHistory = true;
    this.historyLoadError = false;
    this.cdr.markForCheck();

    const history$ = this.apiEndpoints
      .getBiddingReportHistory(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadingHistory = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (entries) => {
          this.historyDataSource.data = entries;
          this.historyLoadError = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.historyDataSource.data = [];
          this.historyLoadError = true;
          // eslint-disable-next-line no-console
          console.error('Failed to load bidding report history', error);
        },
      });

    this.subscription.add(history$);
  }

  private clearHistory(): void {
    this.historyDataSource.data = [];
    this.isLoadingHistory = false;
    this.historyLoadError = false;
    this.cdr.markForCheck();
  }

  private resetPendingChanges(details: AwardsTableRow[]): void {
    this.originalAwardDetails.clear();
    this.pendingUpdates.clear();

    for (const detail of details) {
      if (detail.comments === null) {
        detail.comments = '';
      }
      this.originalAwardDetails.set(detail.id, {
        comments: this.normalizeComment(detail.comments),
        finalAwardedVolume: detail.finalAwardedVolume ?? null,
      });
    }

    this.hasPendingChanges = false;
  }

  private clearPendingChanges(): void {
    this.originalAwardDetails.clear();
    this.pendingUpdates.clear();
    this.hasPendingChanges = false;
    this.isSavingChanges = false;
  }

  private registerPendingChange(row: AwardsTableRow): void {
    if (!row || typeof row.id !== 'number') {
      return;
    }

    const normalizedComment = this.normalizeComment(row.comments);
    row.comments = normalizedComment ?? '';

    const normalizedVolume = row.finalAwardedVolume ?? null;
    const original = this.originalAwardDetails.get(row.id) ?? {
      comments: null,
      finalAwardedVolume: null,
    };

    const matchesOriginal =
      (normalizedComment ?? null) === (original.comments ?? null) &&
      (normalizedVolume ?? null) === (original.finalAwardedVolume ?? null);

    if (matchesOriginal) {
      this.pendingUpdates.delete(row.id);
    } else {
      this.pendingUpdates.set(row.id, {
        id: row.id,
        comments: normalizedComment,
        finalAwardedVolume: normalizedVolume,
      });
    }

    this.hasPendingChanges = this.pendingUpdates.size > 0;
    this.refreshAwardTables();
    this.calculateSummaries();
  }

  private normalizeComment(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}


