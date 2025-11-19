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
import { catchError, finalize, map, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import { ReportApproversDto } from '../../../core/services/api.types';
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
import {
  ViewProposalsDialogComponent,
  ViewProposalsDialogData,
} from './view-proposals-dialog/view-proposals-dialog.component';
import {
  TenderCommentsDialogComponent,
  TenderCommentsDialogData,
} from './comments-dialog/tender-comments-dialog.component';
import {
  HistoryCustomerDialogComponent,
  HistoryCustomerDialogData,
} from './history-customer-dialog/history-customer-dialog.component';

type TenderTab = 'Initiate' | 'History' | 'Active';
type TenderTabSlug = 'initiate' | 'history' | 'active';
type AwardsTableRow = BiddingReportDetail;
type ApprovalAction = 'approve' | 'reject' | 'rollback';

type TenderAwardsNavigationState = {
  reportSummary?: BiddingReport;
  tenderAwardsWorkflow?: TenderAwardsWorkflowState;
};

type TenderAwardsReportContext = {
  activeReportId: number | null;
  historyReportId: number | null;
  initiatedReportId: number | null;
  reportStatus: string | null;
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
  private static readonly REPORT_CONTEXT_STORAGE_KEY = 'tender-awards-report-context';
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

  viewProposalsError: string | null = null;
  proposalsSuccessMessage: string | null = null;
  proposalsError: string | null = null;

  isCollectionLoading = false;
  isCollectionCompleted = false;
  hasBlockingActiveReport = false;
  isCheckingActiveReports = false;
  activeReportCheckError: string | null = null;

  isProcessingAvailable = false;
  isProcessingLoading = false;
  isProcessingCompleted = false;

  isCompletionAvailable = false;

  private initiatedReportId: number | null = null;
  isEntryPricesLoading = false;
  entryPricesError: string | null = null;

  readonly historyColumns: DataColumn[] = [
    { key: 'customerName', label: 'Customer' },
    { key: 'biddingMonth', label: 'Month' },
    { key: 'biddingYear', label: 'Year' },
    { key: 'status', label: 'Status' },
    { key: 'volumePR', label: 'Volume PR' },
    { key: 'volumeBT', label: 'Volume BT' },
    { key: 'additionalVolumePR', label: 'Additional PR' },
    { key: 'additionalVolumeBT', label: 'Additional BT' },
    { key: 'finalAwardedPR', label: 'Final Awarded PR' },
    { key: 'finalAwardedBT', label: 'Final Awarded BT' },
    { key: 'takenPR', label: 'Lifted PR' },
    { key: 'takenBT', label: 'Lifted BT' },
    { key: 'oneMonthPerformanceScore', label: 'Performance' },
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

  readonly activeStatusOptions: string[] = [
    'Not Nominated',
    'Partially Nominated',
    'Not Proposed',
    'Nominated',
    'Suspended',
    'Deactivated'
  ];

  readonly historyStatusOptions: string[] = ['Accepted', 'Suspended', 'Deactivated'];

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
  private originalAwardDetails = new Map<
    number,
    { comments: string | null; finalAwardedVolume: number | null }
  >();
  private pendingUpdates = new Map<
    number,
    { id: number; comments: string | null; finalAwardedVolume: number | null }
  >();
  private statusUpdatesInProgress = new Set<number>();

  reportFilePath: string | null = null;
  reportFileName: string | null = null;
  hasPendingChanges = false;
  isSavingChanges = false;
  isLoadingHistory = false;
  historyLoadError = false;
  historyReportId: number | null = null;
  historyCustomerLoadingId: number | null = null;

  selectedMonth = '';
  selectedYear!: number | 'All';
  isLoadingProposals = false;
  isViewingProposals = false;
  isLoadingDetails = false;
  detailsLoadError = false;
  isSendingForApproval = false;
  isManageApproversLoading = false;
  reportApprovers: ReportApproversDto[] = [];
  reportSummary: BiddingReport | null = null;
  reportCreatedBy: string | null = null;
  reportStatus: string | null = null;
  private persistedReportContext: TenderAwardsReportContext | null = null;
  isCommentsLoading = false;
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

    this.loadEntryPricesForSelection();

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
      !this.isCollectionCompleted &&
      !this.hasBlockingActiveReport &&
      !this.isCheckingActiveReports
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

    this.checkActiveReportAvailability();
  }

  onCollectionPeriodChange(): void {
    this.loadEntryPricesForSelection();
  }

  startDataCollection(): void {
    if (!this.canStartCollection) {
      return;
    }

    if (this.hasBlockingActiveReport) {
      this.collectionError = 'An active bidding report already exists. Complete it before starting a new flow.';
      this.cdr.markForCheck();
      return;
    }

    const monthIndex = this.resolveMonthIndex(this.collectionForm.month);

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
          this.updateReportStatus(report?.status ?? 'New');
          this.isCollectionCompleted = true;
          this.processingError = null;
          this.isProcessingCompleted = false;
          this.isProcessingAvailable = this.initiatedReportId !== null;
          this.isCompletionAvailable = false;

          if (this.initiatedReportId !== null) {
            this.persistInitiateWorkflowState({
              reportId: this.initiatedReportId,
              stage: 'collection-complete',
            });
          }

          this.filters.applyFilters(this.collectionForm.month, this.collectionForm.year);
          this.persistReportContext();

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
          this.updateReportStatus(this.reportStatus ?? 'History Analyzed');
          if (this.initiatedReportId !== null) {
            this.historyReportId = this.initiatedReportId;
            this.persistInitiateWorkflowState({
              reportId: this.initiatedReportId,
              stage: 'processing-complete',
            });
            this.persistReportContext();
            this.navigateToTab('History', this.initiatedReportId);
            this.loadReportHistory(this.initiatedReportId);
          }
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

  private applyActiveStatusChange(
    row: AwardsTableRow,
    result: TenderStatusDialogResult
  ): void {
    const rowId = row.id;
    const biddingReportId = this.currentReportId ?? row.biddingReportId ?? null;

    if (!Number.isFinite(rowId) || !Number.isFinite(biddingReportId)) {
      return;
    }

    const payload = {
      biddingReportId: Number(biddingReportId),
      biddingDataIds: [Number(rowId)],
      status: result.newStatus,
      dateFrom: result.dateFrom ? result.dateFrom.toISOString() : null,
      dateTo: result.dateTo ? result.dateTo.toISOString() : null,
    };

    this.statusUpdatesInProgress.add(Number(rowId));
    this.cdr.markForCheck();

    const update$ = this.apiEndpoints
      .updateBiddingDataStatus(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.statusUpdatesInProgress.delete(Number(rowId));
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          row.status = result.newStatus;
          this.refreshAwardTables();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update active bidding data status', error);
        },
      });

    this.subscription.add(update$);
  }

  completeBiddingReport(): void {
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
          this.currentReportId = reportId;
          this.navigateToTab('Active', reportId);
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

  viewProposals(): void {
    if (this.isViewingProposals) {
      return;
    }

    const period = this.resolvePeriodForProposals();

    if (!period) {
      this.viewProposalsError = 'Select a valid month and year to view proposals.';
      this.cdr.markForCheck();
      return;
    }

    this.isViewingProposals = true;
    this.viewProposalsError = null;

    const displayPeriod = this.formatPeriodLabel(period);

    const load$ = this.apiEndpoints
      .getAribaProposals(period)
      .pipe(
        take(1),
        finalize(() => {
          this.isViewingProposals = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (proposals) => {
          const data: ViewProposalsDialogData = {
            period: displayPeriod,
            proposals: proposals ?? [],
          };

          this.dialog.open<ViewProposalsDialogComponent, ViewProposalsDialogData>(
            ViewProposalsDialogComponent,
            {
              width: '960px',
              maxWidth: '95vw',
              data,
            }
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load proposals', error);
          this.viewProposalsError = 'Unable to load proposals right now. Please try again later.';
        },
      });

    this.subscription.add(load$);
  }

  navigateToTab(tab: TenderTab, reportId?: number | null): void {
    const slug = tab.toLowerCase() as TenderTabSlug;
    const commands: (string | number)[] = ['/tender-awards', slug];

    const resolvedReportId = this.resolveReportIdForTab(slug, reportId);

    if (typeof resolvedReportId === 'number') {
      commands.push('report', resolvedReportId);
    }

    void this.router.navigate(commands);
  }

  private resolveReportIdForTab(
    slug: TenderTabSlug,
    reportId?: number | null
  ): number | null {
    if (typeof reportId === 'number') {
      return reportId;
    }

    const storedContext = this.loadReportContextFromStorage();

    if (slug === 'active') {
      return (
        this.currentReportId ??
        storedContext?.activeReportId ??
        storedContext?.historyReportId ??
        storedContext?.initiatedReportId ??
        null
      );
    }

    if (slug === 'history') {
      return (
        this.historyReportId ??
        this.currentReportId ??
        storedContext?.historyReportId ??
        storedContext?.activeReportId ??
        storedContext?.initiatedReportId ??
        null
      );
    }

    return (
      this.initiatedReportId ??
      storedContext?.initiatedReportId ??
      storedContext?.historyReportId ??
      storedContext?.activeReportId ??
      null
    );
  }

  valueFor(row: Record<string, unknown>, key: string): string | number | Date | undefined {
    const value = row[key];
    if (typeof value === 'number' || value instanceof Date || typeof value === 'string') {
      return value;
    }

    return undefined;
  }

  formatHistoryMonth(month: string | number | null | undefined): string {
    return this.toMonthName(month);
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
      case 'accepted':
        return 'status-badge--completed';
      case 'nominated':
      case 'partially nominated':
        return 'status-badge--nominated';
      case 'not nominated':
      case 'not proposed':
        return 'status-badge--default';
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
    dataSource: MatTableDataSource<T>,
    options: string[] = this.historyStatusOptions
  ): void {
    const availableOptions = options.length > 0 ? options : this.historyStatusOptions;
    const data: TenderStatusDialogData = {
      currentStatus: row.status ?? availableOptions[0] ?? '',
      statusOptions: availableOptions
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
    const historyAnalysisId = typeof row.id === 'number' ? row.id : Number(row['historyAnalysisId']);
    const reportIdCandidate =
      typeof row.biddingReportId === 'number' ? row.biddingReportId : Number(row['biddingReportId']);
    const biddingReportId = Number.isFinite(reportIdCandidate)
      ? reportIdCandidate
      : this.historyReportId ?? this.currentReportId;

    if (!Number.isFinite(historyAnalysisId) || !Number.isFinite(biddingReportId)) {
      return;
    }

    const payload = {
      biddingReportId: Number(biddingReportId),
      historyAnalysisId: Number(historyAnalysisId),
      status: result.newStatus,
      dateFrom: result.dateFrom ? result.dateFrom.toISOString() : null,
      dateTo: result.dateTo ? result.dateTo.toISOString() : null,
    };

    this.statusUpdatesInProgress.add(Number(historyAnalysisId));
    this.cdr.markForCheck();

    const update$ = this.apiEndpoints
      .updateBiddingHistoryAnalysisStatus(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.statusUpdatesInProgress.delete(Number(historyAnalysisId));
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
          console.error('Failed to update history analysis status', error);
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

  openHistoryCustomerDialog(entry: BiddingReportHistoryEntry): void {
    if (this.historyCustomerLoadingId !== null) {
      return;
    }

    const customerName = entry.customerName?.trim();
    const period = this.buildPeriodFromMonthYear(entry.biddingMonth ?? null, entry.biddingYear ?? null);

    if (!customerName || !period) {
      return;
    }

    const loadingId = typeof entry.id === 'number' ? entry.id : -1;
    this.historyCustomerLoadingId = loadingId;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .getCustomerBiddingData(customerName, period)
      .pipe(
        take(1),
        finalize(() => {
          this.historyCustomerLoadingId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (rows) => {
          const data: HistoryCustomerDialogData = {
            customerName,
            period: this.formatPeriodLabel(period),
            entries: rows ?? [],
          };

          this.dialog.open<HistoryCustomerDialogComponent, HistoryCustomerDialogData>(
            HistoryCustomerDialogComponent,
            {
              width: '720px',
              maxWidth: '95vw',
              data,
            }
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load customer bidding data', error);
        },
      });

    this.subscription.add(load$);
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

  openActiveStatusDialog(row: AwardsTableRow): void {
    if (!row) {
      return;
    }

    const data: TenderStatusDialogData = {
      currentStatus: row.status ?? this.activeStatusOptions[0] ?? '',
      statusOptions: this.activeStatusOptions,
    };

    const dialogRef = this.dialog.open<
      TenderStatusDialogComponent,
      TenderStatusDialogData,
      TenderStatusDialogResult
    >(TenderStatusDialogComponent, {
      ...TenderAwardsComponent.STATUS_DIALOG_CONFIG,
      data,
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.applyActiveStatusChange(row, result);
    });

    this.subscription.add(dialogClosed$);
  }

  savePendingChanges(): void {
    if (this.currentReportId === null || this.pendingUpdates.size === 0 || this.isSavingChanges) {
      return;
    }

    const updates = Array.from(this.pendingUpdates.values()).map((entry) => ({
      id: entry.id,
      comments: this.normalizeComment(entry.comments),
      finalAwardedVolume: entry.finalAwardedVolume,
      status: this.resolveCurrentStatus(entry.id),
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
          if (this.currentReportId !== null) {
            this.loadReportDetails(this.currentReportId);
          } else {
            this.resetPendingChanges(this.awardDetails);
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to save bidding report updates', error);
        },
      });

    this.subscription.add(save$);
  }

  private loadEntryPricesForSelection(): void {
    const month = this.collectionForm.month;
    const year = this.collectionForm.year;
    const period = this.buildPeriodFromMonthYear(month, year);

    if (!period) {
      this.collectionForm.entryPricePropane = null;
      this.collectionForm.benchmarkButane = null;
      this.entryPricesError = null;
      this.cdr.markForCheck();
      return;
    }

    this.isEntryPricesLoading = true;
    this.entryPricesError = null;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .getAribaEntryPrices(period)
      .pipe(
        take(1),
        finalize(() => {
          this.isEntryPricesLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (prices) => {
          this.collectionForm.entryPricePropane = prices?.minEntryPrice ?? null;
          this.collectionForm.benchmarkButane = prices?.ansiButaneQuotation ?? null;
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load entry prices', error);
          this.entryPricesError = 'Unable to load entry prices for the selected period.';
          this.collectionForm.entryPricePropane = null;
          this.collectionForm.benchmarkButane = null;
        },
      });

    this.subscription.add(load$);
  }

  private buildReportDate(month: number, year: number): string {
    const currentDay = new Date().getDate();
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(currentDay).padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  private buildPeriodFromMonthYear(
    monthName: string | null | undefined,
    year: unknown
  ): string | null {
    if (!monthName || typeof year !== 'number' || !Number.isFinite(year)) {
      return null;
    }

    const monthIndex = this.resolveMonthIndex(monthName);

    if (monthIndex < 0) {
      return null;
    }

    const date = new Date(Date.UTC(year, monthIndex, 1));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private resolveMonthIndex(monthName: string | null | undefined): number {
    if (!monthName) {
      return -1;
    }

    const normalized = monthName.trim().toLowerCase();
    return this.monthOptions.findIndex((month) => month.trim().toLowerCase() === normalized);
  }

  private resolvePeriodForProposals(): string | null {
    const summaryDate = this.reportSummary?.reportDate?.trim();
    if (summaryDate) {
      return summaryDate;
    }

    const summaryPeriod = this.buildPeriodFromMonthYear(
      this.reportSummary?.reportMonth ?? null,
      this.reportSummary?.reportYear ?? null
    );

    if (summaryPeriod) {
      return summaryPeriod;
    }

    const collectionPeriod = this.buildPeriodFromMonthYear(
      this.collectionForm.month,
      this.collectionForm.year
    );

    if (collectionPeriod) {
      return collectionPeriod;
    }

    const fallbackPeriod = this.buildPeriodFromMonthYear(
      this.selectedMonth && this.selectedMonth !== 'All' ? this.selectedMonth : null,
      typeof this.selectedYear === 'number' ? this.selectedYear : null
    );

    return fallbackPeriod;
  }

  private formatPeriodLabel(period: string): string {
    const date = new Date(period);
    if (Number.isNaN(date.getTime())) {
      return period;
    }

    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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

  private loadReportContextFromStorage(): TenderAwardsReportContext | null {
    if (this.persistedReportContext) {
      return this.persistedReportContext;
    }

    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }

    try {
      const stored = window.sessionStorage.getItem(
        TenderAwardsComponent.REPORT_CONTEXT_STORAGE_KEY
      );

      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as Partial<TenderAwardsReportContext>;

      const normalizeId = (value: unknown): number | null =>
        typeof value === 'number' && Number.isFinite(value) ? value : null;

      const context: TenderAwardsReportContext = {
        activeReportId: normalizeId(parsed.activeReportId),
        historyReportId: normalizeId(parsed.historyReportId),
        initiatedReportId: normalizeId(parsed.initiatedReportId),
        reportStatus: typeof parsed.reportStatus === 'string' ? parsed.reportStatus : null,
      };

      this.persistedReportContext = context;
      return context;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load tender awards report context', error);
      return null;
    }
  }

  private persistReportContext(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    const context: TenderAwardsReportContext = {
      activeReportId: this.currentReportId ?? null,
      historyReportId: this.historyReportId ?? null,
      initiatedReportId: this.initiatedReportId ?? null,
      reportStatus: this.resolveReportStatus(),
    };

    try {
      window.sessionStorage.setItem(
        TenderAwardsComponent.REPORT_CONTEXT_STORAGE_KEY,
        JSON.stringify(context)
      );
      this.persistedReportContext = context;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist tender awards report context', error);
    }
  }

  private persistInitiateWorkflowState(state: TenderAwardsWorkflowState | null): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      if (state) {
        window.sessionStorage.setItem(
          TENDER_AWARDS_WORKFLOW_STORAGE_KEY,
          JSON.stringify(state)
        );
      } else {
        window.sessionStorage.removeItem(TENDER_AWARDS_WORKFLOW_STORAGE_KEY);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist tender awards workflow state', error);
    }
  }

  private resolveReportStatus(): string | null {
    return this.reportStatus ?? this.reportSummary?.status ?? null;
  }

  private updateReportStatus(status: string | null): void {
    this.reportStatus = status;
    this.persistReportContext();
  }

  private stageFromStatus(status: string | null | undefined): TenderAwardsInitiateStage | null {
    const normalized = typeof status === 'string' ? status.trim().toLowerCase() : '';

    if (normalized === 'history analyzed' || normalized === 'active' || normalized === 'pending approval') {
      return 'processing-complete';
    }

    if (normalized === 'new') {
      return 'collection-complete';
    }

    return null;
  }

  private handleRouteParams(params: ParamMap): void {
    const tabSlug = this.normalizeTabSlug(params.get('tab'));
    const storedContext = this.loadReportContextFromStorage();
    this.currentTabSlug = tabSlug;
    this.activeTab = TenderAwardsComponent.TAB_SLUG_TO_LABEL[tabSlug];

    if (tabSlug === 'history') {
      this.applyInitiateWorkflowState(null);
      const reportId =
        this.parseReportId(params.get('reportId')) ??
        storedContext?.historyReportId ??
        storedContext?.activeReportId ??
        storedContext?.initiatedReportId ??
        null;
      this.historyReportId = reportId;
      this.clearActiveReport();

      if (reportId === null) {
        this.clearHistory();
      } else {
        this.loadReportHistory(reportId);
      }

      this.persistReportContext();

      return;
    }

    this.historyReportId = null;
    this.clearHistory();

    if (tabSlug === 'initiate') {
      this.clearActiveReport();
      const workflowState = this.resolveInitiateWorkflowState();
      this.applyInitiateWorkflowState(workflowState);
      const reportId = workflowState?.reportId ?? storedContext?.initiatedReportId ?? null;
      this.reportSummary = reportId !== null ? this.resolveReportSummary(reportId) : null;
      this.persistReportContext();
      this.cdr.markForCheck();
      return;
    }

    if (tabSlug !== 'active') {
      this.applyInitiateWorkflowState(null);
      this.clearActiveReport();
      this.persistReportContext();
      return;
    }

    const reportId =
      this.parseReportId(params.get('reportId')) ??
      storedContext?.activeReportId ??
      storedContext?.historyReportId ??
      storedContext?.initiatedReportId ??
      null;
    if (reportId === null) {
      this.clearActiveReport();
      this.persistReportContext();
      return;
    }

    this.applyInitiateWorkflowState(null);
    this.currentReportId = reportId;
    const summary = this.resolveReportSummary(reportId);
    this.reportSummary = summary ?? (this.reportSummary?.id === reportId ? this.reportSummary : null);
    this.persistReportContext();
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

    this.persistInitiateWorkflowState(workflowState);
    this.persistReportContext();
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

    const context = this.loadReportContextFromStorage();
    const inferredStage = this.stageFromStatus(context?.reportStatus);
    const contextReportId =
      context?.initiatedReportId ??
      context?.historyReportId ??
      context?.activeReportId ??
      null;

    if (inferredStage && typeof contextReportId === 'number') {
      return { reportId: contextReportId, stage: inferredStage };
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
        const resolvedStatus = detailsResult.status ?? resolvedSummary?.status ?? null;
        this.updateReportStatus(resolvedStatus);
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
        this.updateReportStatus(null);
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
    this.reportApprovers = [];
    this.persistReportContext();
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
    this.showExportMenu = false;

    if (this.currentReportId === null) {
      return;
    }

    const reportId = this.currentReportId;
    const fileName = `Tender_Award_Analysis_${this.selectedMonth}_${this.selectedYear}.csv`;

    const export$ = this.apiEndpoints
      .exportBiddingReportToCSV(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (blob) => {
          this.apiEndpoints.handleReportExportedBlob(blob, fileName);
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to export report to CSV', error);
        },
      });

    this.subscription.add(export$);
  }

  exportToPDF(): void {
    this.showExportMenu = false;

    if (this.currentReportId === null) {
      return;
    }

    const reportId = this.currentReportId;
    const fileName = `Tender_Award_Analysis_${this.selectedMonth}_${this.selectedYear}.pdf`;

    const export$ = this.apiEndpoints
      .exportBiddingReportToPDF(reportId, { isExceptionReport: false })
      .pipe(
        take(1),
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (blob) => {
          this.apiEndpoints.handleReportExportedBlob(blob, fileName);
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to export report to PDF', error);
        },
      });

    this.subscription.add(export$);
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
    if (this.isManageApproversLoading) {
      return;
    }

    const reportId = this.currentReportId ?? this.initiatedReportId;

    if (reportId === null) {
      return;
    }
    this.isManageApproversLoading = true;
    this.cdr.markForCheck();

    const load$ = this.fetchReportApprovers(reportId)
      .pipe(
        finalize(() => {
          this.isManageApproversLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((approvers) => {
        if (!this.isReportContext(reportId)) {
          return;
        }
        this.reportApprovers = approvers;
        this.cdr.markForCheck();
        this.showManageApproversDialog(reportId, approvers);
      });

    this.subscription.add(load$);
  }

  private showManageApproversDialog(
    reportId: number,
    approvers: ReportApproversDto[]
  ): void {
    const dialogRef = this.dialog.open<
      ManageApproversDialogComponent,
      ManageApproversDialogData,
      ManageApproversDialogResult
    >(ManageApproversDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { reportId, approvers },
    });

    const close$ = dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result?.updated) {
          this.reloadReportApprovers(reportId);
        }
      });

    this.subscription.add(close$);
  }

  private fetchReportApprovers(reportId: number): Observable<ReportApproversDto[]> {
    return this.apiEndpoints
      .getReportApprovers(reportId)
      .pipe(
        take(1),
        map((approvers) => this.normalizeReportApprovers(approvers)),
        catchError((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load report approvers', error);
          return of<ReportApproversDto[]>([]);
        })
      );
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
    if (!this.isReportContext(reportId)) {
      return;
    }

    this.isManageApproversLoading = true;
    this.cdr.markForCheck();

    const reload$ = this.fetchReportApprovers(reportId)
      .pipe(
        finalize(() => {
          this.isManageApproversLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((approvers) => {
        if (!this.isReportContext(reportId)) {
          return;
        }
        this.reportApprovers = approvers;
        this.cdr.markForCheck();
      });

    this.subscription.add(reload$);
  }

  private isReportContext(reportId: number): boolean {
    return this.currentReportId === reportId || this.initiatedReportId === reportId;
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

  private resolveCurrentStatus(rowId: number): string | null {
    const matchingRow = this.awardDetails.find((detail) => detail.id === rowId);
    return matchingRow?.status ?? null;
  }

  openCommentsDialog(): void {
    if (this.currentReportId === null) {
      return;
    }

    const reportId = this.currentReportId;
    const reportName = `${this.selectedMonth} ${this.selectedYear}`;

    this.isCommentsLoading = true;
    this.cdr.markForCheck();

    const summary$ = this.apiEndpoints
      .getBiddingReportSummary(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isCommentsLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (summaries) => {
          this.dialog.open<TenderCommentsDialogComponent, TenderCommentsDialogData>(
            TenderCommentsDialogComponent,
            {
              width: '600px',
              maxWidth: '95vw',
              data: {
                reportName,
                summaries,
              },
            }
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch report summary', error);
        },
      });

    this.subscription.add(summary$);
  }

  private checkActiveReportAvailability(): void {
    this.isCheckingActiveReports = true;
    this.activeReportCheckError = null;
    this.cdr.markForCheck();

    const check$ = this.apiEndpoints
      .getBiddingReports()
      .pipe(
        take(1),
        finalize(() => {
          this.isCheckingActiveReports = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (reports) => {
          this.hasBlockingActiveReport = (reports ?? []).some(
            (report) => this.normalizeReportStatus(report.status) === 'active'
          );

          if (
            !this.hasBlockingActiveReport &&
            this.collectionError &&
            this.collectionError.includes('active report')
          ) {
            this.collectionError = null;
          }

          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to verify active bidding reports', error);
          this.activeReportCheckError = 'Unable to verify if another active report exists.';
          this.cdr.markForCheck();
        },
      });

    this.subscription.add(check$);
  }

  private toMonthName(monthValue: string | number | null | undefined): string {
    const trimmed = typeof monthValue === 'number' ? String(monthValue) : monthValue?.trim();
    if (!trimmed) {
      return '';
    }

    const monthNumber = Number(trimmed);
    if (Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
      return TenderAwardsComponent.MONTH_NAMES[monthNumber - 1] ?? trimmed;
    }

    const normalized = trimmed.toLowerCase();
    const index = TenderAwardsComponent.MONTH_NAMES.findIndex(
      (name) => name.toLowerCase() === normalized
    );

    if (index >= 0) {
      return TenderAwardsComponent.MONTH_NAMES[index];
    }

    return this.toTitleCase(trimmed);
  }

  private toTitleCase(value: string): string {
    return value.replace(/\w\S*/g, (word) => word[0]?.toUpperCase() + word.substring(1).toLowerCase());
  }

  private normalizeReportStatus(status: string | null | undefined): string {
    return String(status ?? '').trim().toLowerCase();
  }
}


