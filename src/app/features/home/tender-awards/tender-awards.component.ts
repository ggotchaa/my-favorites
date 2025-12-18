import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import {
  ApiEndpointService,
  BiddingReportDetailsResult,
} from '../../../core/services/api.service';
import { ReportApproversDto } from '../../../core/services/api.types';
import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { HomeFiltersService } from '../services/home-filters.service';
import { BiddingReport } from '../reports/bidding-report.interface';
import { BiddingReportDetail } from './bidding-report-detail.interface';
import {
  TenderStatusDialogComponent,
  TenderStatusDialogData,
  TenderStatusDialogResult,
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
  TenderCommentsDialogResult,
} from './comments-dialog/tender-comments-dialog.component';
import {
  HistoryCustomerDialogComponent,
  HistoryCustomerDialogData,
} from './history-customer-dialog/history-customer-dialog.component';
import { UserRole } from '../../../shared/utils/user-roles.enum';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

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

  private static readonly TAB_SLUG_TO_LABEL: Record<TenderTabSlug, TenderTab> =
    {
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
    'December',
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
    period: "SEPTEMBER",
    totalBidVolume: 0,
    totalLpgForRk: 0,
    weightedAverage: 0,
  };

  showExportMenu = false;
  approvalAccessResolved = false;

  activeTab: TenderTab = 'Active';
  private currentTabSlug: TenderTabSlug = 'active';
  currentReportId: number | null = null;

  readonly monthOptions: string[];
  readonly yearOptions: number[];

  @ViewChildren('historyCommentArea')
  historyCommentAreas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  @ViewChildren('activeCommentArea')
  activeCommentAreas!: QueryList<ElementRef<HTMLTextAreaElement>>;

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

  currentUserIsApprover: boolean | null = null;

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
    { key: 'missingProductsSum', label: 'Total Awarded Volume' },
    { key: 'takenPR', label: 'Lifted PR' },
    { key: 'takenBT', label: 'Lifted BT' },
    { key: 'oneMonthPerformanceScore', label: 'Performance' },
    { key: 'comments', label: 'Comments' },
  ];

  readonly awardsColumns: DataColumn[] = [
    { key: 'bidder', label: 'Bidder' },
    { key: 'kzRegion', label: 'Region' },
    { key: 'status', label: 'Status' },
    { key: 'totalBidVolume', label: 'Total Bid Volume' },
    { key: 'bidVolume', label: 'Bid Volume' },
    { key: 'bidPrice', label: 'Bid Price' },
    { key: 'rankPerPrice', label: 'Rank per Price' },
    { key: 'rollingLiftFactor', label: 'Rolling Lift Factor' },
    { key: 'awardedVolume', label: 'Recommended award volume' },
    { key: 'finalAwardedVolume', label: 'Final Awarded Volume' },
    { key: 'comments', label: 'Comments' },
  ];

  readonly activeStatusOptions: string[] = ['Suspended', 'Deactivated'];

  readonly historyStatusOptions: string[] = [
    'Accepted',
    'Suspended',
    'Deactivated',
  ];

  readonly historyDataSource = this.buildDataSource<BiddingReportHistoryEntry>(
    []
  );
  private readonly originalHistoryDetails = new Map<
    number,
    {
      additionalVolumePR: number | null;
      additionalVolumeBT: number | null;
      comments: string | null;
    }
  >();
  private readonly pendingHistoryUpdates = new Map<
    number,
    {
      id: number;
      additionalVolumePR: number | null;
      additionalVolumeBT: number | null;
      comments: string | null;
    }
  >();
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
  isSavingHistoryChanges = false;
  historyReportId: number | null = null;
  historyCustomerLoadingId: number | null = null;

  selectedMonth = '';
  selectedYear!: number | 'All';
  isLoadingProposals = false;
  isViewingProposals = false;
  isLoadingDetails = false;
  detailsLoadError = false;
  isCalculatingRollingFactor = false;
  isCalculatingSummary = false;
  isSendingForApproval = false;
  isManageApproversLoading = false;
  reportApprovers: ReportApproversDto[] = [];
  reportSummary: BiddingReport | null = null;
  previousMonthReport: BiddingReport | null = null;
  reportCreatedBy: string | null = null;
  reportStatus: string | null = null;
  isCommentsLoading = false;
  isSummaryUpdating = false;
  private approvalActionInProgress: ApprovalAction | null = null;

  @ViewChild('historySort')
  set historySort(sort: MatSort | undefined) {
    this.applySort(this.historyDataSource, sort);
  }

  @ViewChild('butaneSort')
  set butaneSort(sort: MatSort | undefined) {
    this.applySort(this.awardTables.butane.dataSource, sort);
  }

  @ViewChild('propaneSort')
  set propaneSort(sort: MatSort | undefined) {
    this.applySort(this.awardTables.propane.dataSource, sort);
  }
  private readonly subscription = new Subscription();

  private autoSaveDebounceTime = 1000; // 1 second debounce
  private autoSaveSubject = new Subject<void>();
  private shouldRefreshDetailsAfterAwardChange = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthStateSignalsService,
    private readonly accessControl: AccessControlService,
    private readonly decimalPipe: DecimalPipe
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

    this.subscription.add(
      this.autoSaveSubject
        .pipe(
          debounceTime(this.autoSaveDebounceTime),
          switchMap(() => {
            if (this.hasPendingChanges && !this.isSavingChanges) {
              return this.performAutoSave();
            }
            return of(void 0);
          })
        )
        .subscribe()
    );
  }

  get historyDisplayedColumns(): string[] {
    return this.historyColumns.map((column) => column.key);
  }

  get historyTotals(): {
    volumePR: number;
    volumeBT: number;
    additionalVolumePR: number;
    additionalVolumeBT: number;
    finalAwardedPR: number;
    finalAwardedBT: number;
    missingProductsSum: number;
    takenPR: number;
    takenBT: number;
  } {
    const rows = this.historyDataSource.data ?? [];
    const sum = (key: keyof BiddingReportHistoryEntry): number => {
      return rows.reduce((total, row) => total + (Number(row?.[key]) || 0), 0);
    };
    const missingProductsSum = rows.reduce(
      (total, row) => total + this.calculateHistoryMissingProductsSum(row),
      0
    );

    return {
      volumePR: sum('volumePR'),
      volumeBT: sum('volumeBT'),
      additionalVolumePR: sum('additionalVolumePR'),
      additionalVolumeBT: sum('additionalVolumeBT'),
      finalAwardedPR: sum('finalAwardedPR'),
      finalAwardedBT: sum('finalAwardedBT'),
      missingProductsSum,
      takenPR: sum('takenPR'),
      takenBT: sum('takenBT'),
    };
  }

  get canRollbackReport(): boolean {
    return this.isCurrentUserReportCreator;
  }

  get showRollbackAction(): boolean {
    return (
      this.isPendingApprovalStatus &&
      (this.isLpgCoordinator || this.canRollbackReport)
    );
  }

  get canExecuteRollback(): boolean {
    return (
      this.canPerformApprovalActions &&
      (this.canRollbackReport || this.isLpgCoordinator)
    );
  }

  get canApproveReport(): boolean {
    if (this.isCurrentUserReportCreator || !this.canPerformApprovalActions) {
      return false;
    }

    return true;
  }

  get shouldShowApprovalButtons(): boolean {
    if (!this.isPendingApprovalStatus) {
      return false;
    }

    if (this.isCommitteeRole && this.currentUserIsApprover !== true) {
      return false;
    }

    return true;
  }

  get canPerformApprovalActions(): boolean {
    return this.currentUserIsApprover === true;
  }

  get hasReportContext(): boolean {
    return (
      this.currentReportId !== null ||
      this.historyReportId !== null ||
      this.initiatedReportId !== null
    );
  }

  private get isCurrentUserReportCreator(): boolean {
    const creatorIds = [this.reportCreatedBy, this.reportSummary?.createdBy]
      .map((value) => this.normalizeIdentifier(value))
      .filter((value): value is string => typeof value === 'string');

    if (!creatorIds.length) {
      return false;
    }

    const currentUserId = this.currentUserIdentifier;
    return !!currentUserId && creatorIds.includes(currentUserId);
  }

  private get isCommitteeRole(): boolean {
    return this.accessControl.isCommitteeRole();
  }

  private get currentUserIdentifier(): string | null {
    const claims = this.authService.claimsSync();
    const claimRecord = (claims ?? null) as Record<string, unknown> | null;
    const candidateKeys = [
      'preferred_username',
      'email',
      'upn',
      'unique_name',
      'name',
    ];

    for (const key of candidateKeys) {
      const normalized = this.normalizeIdentifier(claimRecord?.[key]);
      if (normalized) {
        return normalized;
      }
    }

    const account = this.authService.account() as Record<
      string,
      unknown
    > | null;
    const accountIdentifier = this.normalizeIdentifier(account?.['username']);

    return accountIdentifier ?? null;
  }

  private hasRole(role: UserRole): boolean {
    return this.authService.roles().includes(role);
  }

  private normalizeIdentifier(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    return normalized.length ? normalized : null;
  }

  get awardsDisplayedColumns(): string[] {
    return this.awardsColumns.map((c) => c.key);
  }

  get hasAwardData(): boolean {
    return this.awardTableList.some(
      (table) => table.dataSource.data.length > 0
    );
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

  get canGetProposals(): boolean {
    return (
      this.isHistoryAnalyzedStatus && this.isLpgCoordinator
    );
  }

  get isPendingApprovalStatus(): boolean {
    return (
      this.normalizeStatus(this.reportStatus ?? this.reportSummary?.status) ===
      'pending approval'
    );
  }

  get isHistoryAnalyzedStatus(): boolean {
    return (
      this.normalizeStatus(this.reportStatus ?? this.reportSummary?.status) ===
      'history analyzed'
    );
  }

  private normalizeStatus(status: string | null | undefined): string {
    return String(status ?? '')
      .trim()
      .toLowerCase();
  }

  get displayMonth(): string {
    const summaryMonth = this.resolveDisplayMonth(this.reportSummary?.reportMonth);
    if (summaryMonth) {
      return summaryMonth;
    }

      const collectionMonth = this.resolveDisplayMonth(this.collectionForm?.month);
    if (collectionMonth) {
      return collectionMonth;
    }

        return this.resolveDisplayMonth(this.selectedMonth) || 'All';;
  }

  get displayYear(): string | number {
    const summaryYear = this.reportSummary?.reportYear;
    if (Number.isFinite(summaryYear)) {
      return summaryYear as number;
    }

    const collectionYear = this.collectionForm?.year;
    if (Number.isFinite(collectionYear)) {
      return collectionYear as number;
    }

    return this.selectedYear ?? 'All';
  }

  toggleTableExpansion(product: ProductKey): void {
    this.tableExpansion[product] = !this.tableExpansion[product];
    this.cdr.markForCheck();
  }

  isTableExpanded(product: ProductKey): boolean {
    return this.tableExpansion[product];
  }

    private resolveDisplayMonth(
    month: string | number | null | undefined
  ): string | null {
    if (month === null || month === undefined) {
      return null;
    }

    const trimmedMonth = `${month}`.trim();

    const parsedMonth = Number(trimmedMonth);
    if (Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      return TenderAwardsComponent.MONTH_NAMES[parsedMonth - 1];
    }

    const matchingMonth = TenderAwardsComponent.MONTH_NAMES.find(
      (name) => name.toLowerCase() === trimmedMonth.toLowerCase()
    );

    if (matchingMonth) {
      return matchingMonth;
    }

    return trimmedMonth || null;
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
      this.collectionError =
        'An active bidding report already exists. Complete it before starting a new flow.';
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
    const entryPricesPeriod = this.buildPeriodFromMonthYear(
      this.collectionForm.month,
      this.collectionForm.year
    );

    if (!entryPricesPeriod) {
      this.collectionError = 'Unable to resolve period for entry prices.';
      this.cdr.markForCheck();
      return;
    }

    this.collectionError = null;
    this.processingResultMessage = null;
    this.proposalsSuccessMessage = null;
    this.proposalsError = null;
    this.isCollectionLoading = true;

    const create$ = this.apiEndpoints
      .updateAribaEntryPrices({
        period: entryPricesPeriod,
        minEntryPrice: this.collectionForm.entryPricePropane ?? null,
        ansiButaneQuotation: this.collectionForm.benchmarkButane ?? null,
      })
      .pipe(
        take(1),
        switchMap(() =>
          this.apiEndpoints
            .createBiddingReport({ reportDate })
            .pipe(take(1))
        ),
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
          this.updateReportStatus(
            report?.status ?? 'New',
            this.initiatedReportId
          );
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

          this.filters.applyFilters(
            this.collectionForm.month,
            this.collectionForm.year
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to start data collection', error);
          this.collectionError =
            'Unable to save entry prices or create bidding report. Please try again.';
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
      .analyzeShipments({
        biddingReportId: this.initiatedReportId ?? undefined,
      })
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
          this.updateReportStatus(
            this.reportStatus ?? 'History Analyzed',
            this.initiatedReportId
          );
          if (this.initiatedReportId !== null) {
            this.historyReportId = this.initiatedReportId;
            this.persistInitiateWorkflowState({
              reportId: this.initiatedReportId,
              stage: 'processing-complete',
            });
            this.navigateToTab('History', this.initiatedReportId);
            this.loadReportHistory(this.initiatedReportId);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to analyze shipments', error);
          this.processingError =
            'Unable to analyze shipments. Please try again.';
          this.cdr.markForCheck();
        },
      });

    this.subscription.add(analyze$);
  }

  ngAfterViewInit(): void {
    const historyCommentsChange = this.historyCommentAreas.changes.subscribe(() =>
      this.resizeAllHistoryTextareas()
    );
    this.subscription.add(historyCommentsChange);
    this.resizeAllHistoryTextareas();

    const activeCommentsChange = this.activeCommentAreas.changes.subscribe(() =>
      this.resizeAllActiveTextareas()
    );
    this.subscription.add(activeCommentsChange);
    this.resizeAllActiveTextareas();
  }

  autoResizeTextarea(textarea?: HTMLTextAreaElement | null): void {
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  private resizeAllHistoryTextareas(): void {
    queueMicrotask(() => {
      this.historyCommentAreas?.forEach((textarea) =>
        this.autoResizeTextarea(textarea.nativeElement)
      );
    });
  }

  private resizeAllActiveTextareas(): void {
    queueMicrotask(() => {
      this.activeCommentAreas?.forEach((textarea) =>
        this.autoResizeTextarea(textarea.nativeElement)
      );
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get isReadOnlyView(): boolean {
    return this.accessControl.isReadOnlyMode();
  }

  get canManageApprovals(): boolean {
    return this.accessControl.canManageApprovals();
  }

  get isLpgCoordinator(): boolean {
    return this.canManageApprovals;
  }

  get isCommitteeMemberView(): boolean {
    return this.accessControl.isCommitteeRole();
  }

  isStatusUpdating(rowId: number): boolean {
    return this.statusUpdatesInProgress.has(rowId);
  }

  get isActiveStatus(): boolean {
    const status = this.resolveReportStatus();
    return status?.trim().toLowerCase() === 'active';
  }

  get isOpenStatus(): boolean {
    const status = this.resolveReportStatus();
    return status?.trim().toLowerCase() === 'open';
  }

  get canViewInitiateTab(): boolean {
    if (!this.isCommitteeMemberView) {
      return true;
    }

    return this.isLpgCoordinator || this.isOpenStatus;
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
      biddingDataId: Number(rowId),
      status: result.newStatus,
      dateFrom: this.toIsoDate(result.dateFrom),
      dateTo: this.toIsoDate(result.dateTo),
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
          this.loadReportDetails(Number(biddingReportId));
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

    const reportId =
      this.currentReportId ?? this.initiatedReportId ?? undefined;

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
          this.proposalsSuccessMessage =
            message ?? 'Proposals updated successfully.';
          this.proposalsError = null;
          this.currentReportId = reportId;

          this.updateReportStatus(
            'Active',
            reportId
          );

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

  private applyReportDetails(
    detailsResult: BiddingReportDetailsResult,
    summary: BiddingReport | null,
    reportId: number | null
  ): void {
    const resolvedSummary = summary ?? this.reportSummary;
    this.reportSummary = resolvedSummary ?? null;
    this.loadPreviousMonthReport(this.reportSummary);
    this.awardDetails = detailsResult.details;
    this.reportFileName = detailsResult.reportFileName ?? null;
    this.reportFilePath = detailsResult.reportFilePath ?? null;
    this.reportCreatedBy =
      detailsResult.createdBy ?? resolvedSummary?.createdBy ?? null;
    const resolvedStatus =
      detailsResult.status ?? resolvedSummary?.status ?? null;
    this.updateReportStatus(
      resolvedStatus,
      reportId ?? this.currentReportId ?? null
    );
    this.updateAwardTables();
    this.resetPendingChanges(this.awardDetails);
    this.isLoadingDetails = false;
    this.cdr.markForCheck();
  }

  private handleDetailsLoadError(
    reportId: number | null,
    error: unknown
  ): void {
    this.awardDetails = [];
    this.clearAwardTables();
    this.clearPendingChanges();
    this.reportFileName = null;
    this.reportFilePath = null;
    this.reportCreatedBy = null;
    this.approvalAccessResolved = true;
    this.updateReportStatus(null, reportId);
    this.isLoadingDetails = false;
    this.detailsLoadError = true;
    this.cdr.markForCheck();
    // eslint-disable-next-line no-console
    console.error('Failed to load bidding report details', error);
  }

  private resolveReportIdFromDetails(
    detailsResult: BiddingReportDetailsResult
  ): number | null {
    const detailReportId = detailsResult.details?.[0]?.biddingReportId;

    if (typeof detailReportId === 'number' && Number.isFinite(detailReportId)) {
      return detailReportId;
    }

    const summaryReportId = detailsResult.summaries?.find(
      (summary) => typeof summary?.biddingReportId === 'number'
    )?.biddingReportId;

    return typeof summaryReportId === 'number' &&
      Number.isFinite(summaryReportId)
      ? Number(summaryReportId)
      : null;
  }

  private loadActiveReportDetailsFallback(): void {
    this.isLoadingDetails = true;
    this.detailsLoadError = false;
    this.reportCreatedBy = null;
    this.reportStatus = null;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .getActiveBiddingReportDetails()
      .pipe(take(1))
      .subscribe({
        next: (detailsResult) => {
          const resolvedReportId =
            this.resolveReportIdFromDetails(detailsResult);
          if (resolvedReportId === null) {
            this.handleNoActiveReportFound();
            return;
          }
          const summary$ =
            resolvedReportId !== null
              ? this.loadReportSummary(resolvedReportId, { forceRefresh: true })
              : of(null);

          const summarySub = summary$.subscribe({
            next: (summary) => {
              this.currentReportId = resolvedReportId;
              this.applyReportDetails(
                detailsResult,
                summary ?? this.reportSummary ?? null,
                resolvedReportId
              );

              if (resolvedReportId !== null) {
                this.loadCurrentUserApprovalAccess(resolvedReportId);
              }
            },
            error: (error) => {
              this.handleDetailsLoadError(resolvedReportId, error);
            },
          });

          this.subscription.add(summarySub);
        },
        error: (error) => {
          this.handleNoActiveReportFound();
          // eslint-disable-next-line no-console
          console.error('Failed to load active bidding report details', error);
        },
      });

    this.subscription.add(load$);
  }

  private handleNoActiveReportFound(): void {
    this.clearActiveReport();
    this.isLoadingDetails = false;
    this.detailsLoadError = false;

    if (this.canViewInitiateTab) {
      this.navigateToTab('Initiate');
    }

    this.cdr.markForCheck();
  }

  viewProposals(): void {
    if (this.isViewingProposals) {
      return;
    }

    const period = this.resolvePeriodForProposals();

    if (!period) {
      this.viewProposalsError =
        'Select a valid month and year to view proposals.';
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

          this.dialog.open<
            ViewProposalsDialogComponent,
            ViewProposalsDialogData
          >(ViewProposalsDialogComponent, {
            //width: '1200px',
            maxWidth: '95vw',
            data,
          });
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load proposals', error);
          this.viewProposalsError =
            'Unable to load proposals right now. Please try again later.';
        },
      });

    this.subscription.add(load$);
  }

  calculateRollingFactor(): void {
    const reportId =
      this.currentReportId ??
      this.historyReportId ??
      this.initiatedReportId ??
      null;

    if (reportId === null || this.isCalculatingRollingFactor) {
      return;
    }

    this.isCalculatingRollingFactor = true;
    this.cdr.markForCheck();

    const calculate$ = this.apiEndpoints
      .calculateRollingFactor(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isCalculatingRollingFactor = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.loadReportDetails(reportId);
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to calculate rolling factor', error);
        },
      });

    this.subscription.add(calculate$);
  }

  calculateSummary(): void {
    const reportId =
      this.currentReportId ??
      this.historyReportId ??
      this.initiatedReportId ??
      null;

    if (reportId === null || this.isCalculatingSummary) {
      return;
    }

    this.isCalculatingSummary = true;
    this.cdr.markForCheck();

    const calculate$ = this.apiEndpoints
      .calculateReportSummary(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isCalculatingSummary = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.loadReportDetails(reportId);
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to calculate summary', error);
        },
      });

    this.subscription.add(calculate$);
  }

  navigateToTab(tab: TenderTab, reportId?: number | null): void {
    const slug = tab.toLowerCase() as TenderTabSlug;
    if (slug === 'initiate' && !this.canViewInitiateTab) {
      return;
    }
    if (slug === 'active' && this.isHistoryAnalyzedStatus) {
      return;
    }
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

    if (slug === 'active') {
      return (
        this.currentReportId ??
        this.historyReportId ??
        this.initiatedReportId ??
        null
      );
    }

    if (slug === 'history') {
      return (
        this.historyReportId ??
        this.currentReportId ??
        this.initiatedReportId ??
        null
      );
    }

    return (
      this.initiatedReportId ??
      this.historyReportId ??
      this.currentReportId ??
      null
    );
  }

  valueFor(
    row: Record<string, unknown>,
    key: string
  ): string | number | Date | undefined {
    const value = row[key];
    if (
      typeof value === 'number' ||
      value instanceof Date ||
      typeof value === 'string'
    ) {
      return value;
    }

    return undefined;
  }

  formatHistoryMonth(month: string | number | null | undefined): string {
    return this.toMonthName(month);
  }

  calculateHistoryMissingProductsSum(entry: BiddingReportHistoryEntry): number {
    return (
      (Number(entry.volumePR) || 0) +
      (Number(entry.volumeBT) || 0) +
      (Number(entry.finalAwardedPR) || 0) +
      (Number(entry.finalAwardedBT) || 0)
    );
  }

  get hasHistoryPendingChanges(): boolean {
    return this.pendingHistoryUpdates.size > 0;
  }

  onHistoryAdditionalVolumeChange(
    row: BiddingReportHistoryEntry,
    key: 'additionalVolumePR' | 'additionalVolumeBT',
    value: string | number | null
  ): void {
    if (this.isReadOnlyView) {
      return;
    }

    const numericValue =
      value === null || value === ''
        ? null
        : typeof value === 'number'
        ? value
        : Number(value);

    if (typeof numericValue === 'number' && Number.isNaN(numericValue)) {
      return;
    }

    row[key] = numericValue ?? 0;
    this.registerHistoryPendingChange(row);
    this.triggerHistoryAutoSave();
  }

  onHistoryCommentsChange(row: BiddingReportHistoryEntry, value: string): void {
    if (this.isReadOnlyView) {
      return;
    }

    row.comments = value;
    this.registerHistoryPendingChange(row);
    this.triggerHistoryAutoSave();
  }

  private triggerAutoSave(): void {
    this.autoSaveSubject.next();
  }

  private triggerHistoryAutoSave(): void {
    // Use the same debounce subject for history auto-save
    this.autoSaveSubject.next();
  }

  private performAutoSave(): Observable<void> {
    if (this.currentReportId === null || this.pendingUpdates.size === 0) {
      return of(void 0);
    }

    const updates = Array.from(this.pendingUpdates.values()).map((entry) => ({
      id: entry.id,
      comments: this.normalizeComment(entry.comments),
      finalAwardedVolume: entry.finalAwardedVolume,
      status: this.resolveCurrentStatus(entry.id),
    }));

    this.isSavingChanges = true;
    this.cdr.markForCheck();

    return this.apiEndpoints
      .updateActiveBiddingReport(this.currentReportId, updates)
      .pipe(
        take(1),
        finalize(() => {
          this.isSavingChanges = false;
          this.cdr.markForCheck();
        }),
        tap({
          next: () => {
            // Update original values to match current values
            for (const update of updates) {
              this.originalAwardDetails.set(update.id, {
                comments: update.comments,
                finalAwardedVolume: update.finalAwardedVolume,
              });
            }
            this.pendingUpdates.clear();
            this.hasPendingChanges = false;
            this.refreshAwardTables();
            if (this.shouldRefreshDetailsAfterAwardChange) {
              if (this.currentReportId !== null) {
                this.loadReportDetails(this.currentReportId);
              }
              this.shouldRefreshDetailsAfterAwardChange = false;
            }
          },
          error: (error) => {
            // eslint-disable-next-line no-console
            console.error('Auto-save failed', error);
          },
        }),
        map(() => void 0),
        catchError(() => of(void 0))
      );
  }

  private performHistoryAutoSave(): Observable<void> {
    const reportId = this.historyReportId ?? this.currentReportId;

    if (reportId === null || this.pendingHistoryUpdates.size === 0) {
      return of(void 0);
    }

    const updates = Array.from(this.pendingHistoryUpdates.values()).map(
      (entry) => ({
        id: entry.id,
        additionalVolumePR: entry.additionalVolumePR,
        additionalVolumeBT: entry.additionalVolumeBT,
        comments: this.normalizeComment(entry.comments),
      })
    );

    this.isSavingHistoryChanges = true;
    this.cdr.markForCheck();

    return this.apiEndpoints
      .updateBiddingHistoryAnalysis(reportId, updates)
      .pipe(
        take(1),
        finalize(() => {
          this.isSavingHistoryChanges = false;
          this.cdr.markForCheck();
        }),
        tap({
          next: () => {
            // Update original values to match current values
            for (const update of updates) {
              this.originalHistoryDetails.set(update.id, {
                additionalVolumePR: update.additionalVolumePR,
                additionalVolumeBT: update.additionalVolumeBT,
                comments: update.comments,
              });
            }
            this.pendingHistoryUpdates.clear();
            this.historyDataSource.data = [...this.historyDataSource.data];
          },
          error: (error) => {
            // eslint-disable-next-line no-console
            console.error('History auto-save failed', error);
          },
        }),
        map(() => void 0),
        catchError(() => of(void 0))
      );
  }

  statusClass(status: unknown): string {
    const normalized =
      typeof status === 'string'
        ? status.toLowerCase()
        : String(status ?? '').toLowerCase();

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

  openStatusDialog<
    T extends Record<string, unknown> & {
      id?: number;
      status?: string;
      biddingReportId?: number;
    }
  >(
    row: T,
    dataSource: MatTableDataSource<T>,
    options: string[] = this.historyStatusOptions
  ): void {
    if (this.isReadOnlyView) {
      return;
    }

    const availableOptions =
      options.length > 0 ? options : this.historyStatusOptions;
    const data: TenderStatusDialogData = {
      currentStatus: row.status ?? availableOptions[0] ?? '',
      statusOptions: availableOptions,
    };

    const dialogRef = this.dialog.open<
      TenderStatusDialogComponent,
      TenderStatusDialogData,
      TenderStatusDialogResult
    >(TenderStatusDialogComponent, {
      ...TenderAwardsComponent.STATUS_DIALOG_CONFIG,
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.applyStatusChange(row, dataSource, result);
    });
  }

  private applyStatusChange<
    T extends Record<string, unknown> & {
      id?: number;
      status?: string;
      biddingReportId?: number;
    }
  >(
    row: T,
    dataSource: MatTableDataSource<T>,
    result: TenderStatusDialogResult
  ): void {
    const historyAnalysisId =
      typeof row.id === 'number' ? row.id : Number(row['historyAnalysisId']);
    const reportIdCandidate =
      typeof row.biddingReportId === 'number'
        ? row.biddingReportId
        : Number(row['biddingReportId']);
    const biddingReportId = Number.isFinite(reportIdCandidate)
      ? reportIdCandidate
      : this.historyReportId ?? this.currentReportId;

    if (
      !Number.isFinite(historyAnalysisId) ||
      !Number.isFinite(biddingReportId)
    ) {
      return;
    }

    const payload = {
      biddingReportId: Number(biddingReportId),
      historyAnalysisId: Number(historyAnalysisId),
      status: result.newStatus,
      dateFrom: this.toIsoDate(result.dateFrom),
      dateTo: this.toIsoDate(result.dateTo),
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
          this.loadReportDetails(Number(biddingReportId));
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update history analysis status', error);
        },
      });

    this.subscription.add(update$);
  }

  openSendForApprovalDialog(): void {
    if (!this.isActiveStatus && !this.isLpgCoordinator) {
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
        .startApprovalFlow(reportId!, { comment: result.comment ?? null })
        .pipe(
          take(1),
          finalize(() => {
            this.isSendingForApproval = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.updateReportStatus('Pending Approval', reportId);
            this.loadReportDetails(reportId!);
            this.showExportMenu = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
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
    const period = this.buildPeriodFromMonthYear(
      entry.biddingMonth ?? null,
      entry.biddingYear ?? null
    );

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

          this.dialog.open<
            HistoryCustomerDialogComponent,
            HistoryCustomerDialogData
          >(HistoryCustomerDialogComponent, {
            width: '1200px',
            maxWidth: '95vw',
            data,
          });
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load customer bidding data', error);
        },
      });

    this.subscription.add(load$);
  }

  approveReport(): void {
    if (!this.isCommitteeMemberView && !this.canPerformApprovalActions) {
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
        title: 'Approve Request',
        description: 'Add an approval comment for this request.',
        confirmLabel: 'Approve',
        requireComment: true,
      },
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      const comment = result?.comment?.trim();
      if (!comment) {
        return;
      }

      this.runApprovalAction('approve', () =>
        this.apiEndpoints.approveApprovalFlow(reportId!, { comment })
      );
    });

    this.subscription.add(dialogClosed$);
  }

  rejectReport(): void {
    if (!this.isCommitteeMemberView && !this.canPerformApprovalActions) {
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
      const comment = result?.comment?.trim();
      if (!comment) {
        return;
      }

      this.runApprovalAction('reject', () =>
        this.apiEndpoints.rejectApprovalFlow(reportId!, { comment })
      );
    });

    this.subscription.add(dialogClosed$);
  }

  rollbackReport(): void {
    if (!this.isPendingApprovalStatus && !this.isLpgCoordinator) {
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
        description:
          'Provide a comment explaining why this approval should be rolled back.',
        confirmLabel: 'Rollback',
        requireComment: true,
      },
    });

    const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
      const comment = result?.comment?.trim();
      if (!comment) {
        return;
      }

      this.runApprovalAction('rollback', () =>
        this.apiEndpoints.rollbackApprovalFlow(reportId!, { comment })
      );
    });

    this.subscription.add(dialogClosed$);
  }

  isApprovalActionInProgress(action: ApprovalAction): boolean {
    return this.approvalActionInProgress === action;
  }

  onCommentChange(row: AwardsTableRow, comments: string): void {
    if (this.isReadOnlyView) {
      return;
    }

    row.comments = comments;
    this.registerPendingChange(row);
    this.triggerAutoSave();
  }

  onFinalAwardedVolumeChange(
    row: AwardsTableRow,
    value: string | number | null
  ): void {
    if (this.isReadOnlyView) {
      return;
    }

    const previousValue = row.finalAwardedVolume ?? null;
    const numericValue =
      value === null || value === ''
        ? null
        : typeof value === 'number'
        ? value
        : Number(value);

    if (typeof numericValue === 'number' && Number.isNaN(numericValue)) {
      return;
    }

    const normalizedValue =
      numericValue === null ? null : Math.max(0, numericValue);

    row.finalAwardedVolume = normalizedValue;
    if (normalizedValue !== previousValue) {
      this.shouldRefreshDetailsAfterAwardChange = true;
    }
    this.registerPendingChange(row);
    this.triggerAutoSave();
  }

  private toIsoDate(date: Date | null | undefined): string | null {
    if (!(date instanceof Date)) {
      return null;
    }

    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    return Number.isNaN(utcDate.getTime()) ? null : utcDate.toISOString();
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
    const save$ = this.performAutoSave().subscribe();
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
          this.collectionForm.benchmarkButane =
            prices?.ansiButaneQuotation ?? null;
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load entry prices', error);
          this.entryPricesError =
            'Unable to load entry prices for the selected period.';
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
    return this.toIsoDate(date);
  }

  private resolveMonthIndex(monthName: string | null | undefined): number {
    if (!monthName) {
      return -1;
    }

    const normalized = monthName.trim().toLowerCase();
    return this.monthOptions.findIndex(
      (month) => month.trim().toLowerCase() === normalized
    );
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
      this.selectedMonth && this.selectedMonth !== 'All'
        ? this.selectedMonth
        : null,
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
    dataSource.sortingDataAccessor = (item: any, property: string) =>
      this.sortingDataAccessor(item as Record<string, unknown>, property);
    return dataSource;
  }

  private isHistoryEntry(item: unknown): item is BiddingReportHistoryEntry {
    return (
      typeof item === 'object' &&
      item !== null &&
      ['volumePR', 'volumeBT', 'finalAwardedPR', 'finalAwardedBT'].every(
        (key) => key in item
      )
    );
  }

  private applySort<T>(
    dataSource: MatTableDataSource<T>,
    sort?: MatSort
  ): void {
    if (!sort) {
      return;
    }

    dataSource.sort = sort;
    dataSource._updateChangeSubscription();
  }

  private sortingDataAccessor(
    item: Record<string, unknown>,
    property: string
  ): string | number {
    if (property === 'missingProductsSum') {
      if (this.isHistoryEntry(item)) {
        return this.calculateHistoryMissingProductsSum(item);
      }

      return 0;
    }

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

  private persistInitiateWorkflowState(
    state: TenderAwardsWorkflowState | null
  ): void {
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

  private clearTenderAwardsSessionStorage(reportId: number | null): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      if (reportId !== null) {
        window.sessionStorage.removeItem(
          `tender-awards-report-summary-${reportId}`
        );
      }
      window.sessionStorage.removeItem(TENDER_AWARDS_WORKFLOW_STORAGE_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear tender awards session storage', error);
    }
  }

  private resolveReportStatus(): string | null {
    return this.reportStatus ?? this.reportSummary?.status ?? null;
  }

  private updateReportStatus(
    status: string | null,
    reportId: number | null = null
  ): void {
    this.reportStatus = status;
    this.applyStatusProgress(status, reportId);

    if (
      typeof status === 'string' &&
      status.trim().toLowerCase() === 'pending approval'
    ) {
      this.showExportMenu = false;
    }

    this.cdr.markForCheck();
  }

  private applyStatusProgress(
    status: string | null,
    reportId: number | null
  ): void {
    this.resetProgressFlags();

    if (!status) {
      return;
    }

    const normalizedStatus = this.normalizeReportStatus(status);
    const resolvedReportId =
      reportId ??
      this.currentReportId ??
      this.initiatedReportId ??
      this.historyReportId ??
      null;

    if (resolvedReportId !== null) {
      this.initiatedReportId = resolvedReportId;
    }

    if (normalizedStatus === 'new') {
      this.isCollectionCompleted = true;
      this.isProcessingAvailable = true;
      return;
    }

    if (
      normalizedStatus === 'history analyzed' ||
      normalizedStatus === 'pending approval' ||
      normalizedStatus === 'active' ||
      normalizedStatus === 'complete' ||
      normalizedStatus === 'completed'
    ) {
      this.isCollectionCompleted = true;
      this.isProcessingAvailable = true;
      this.isProcessingCompleted = true;
      this.isCompletionAvailable = true;

      if (normalizedStatus === 'complete' || normalizedStatus === 'completed') {
        this.clearTenderAwardsSessionStorage(resolvedReportId);
      }
    }
  }

  private resetProgressFlags(): void {
    this.isCollectionCompleted = false;
    this.isProcessingAvailable = false;
    this.isProcessingLoading = false;
    this.isProcessingCompleted = false;
    this.processingError = null;
    this.processingResultMessage = null;
    this.isCompletionAvailable = false;
  }

  private handleRouteParams(params: ParamMap): void {
    const tabSlug = this.normalizeTabSlug(params.get('tab'));
    const routeReportId = this.parseReportId(params.get('reportId'));
    this.currentTabSlug = tabSlug;
    this.activeTab = TenderAwardsComponent.TAB_SLUG_TO_LABEL[tabSlug];

    if (tabSlug === 'history') {
      this.currentUserIsApprover = null;
      this.applyInitiateWorkflowState(null);
      const reportId = routeReportId ?? null;
      this.historyReportId = reportId;
      this.initiatedReportId = this.initiatedReportId ?? reportId;
      this.clearActiveReport();

      if (reportId === null) {
        this.clearHistory();
      } else {
        this.loadReportHistory(reportId);
        this.loadHistoryReportSummary(reportId);
        this.loadReportDetails(reportId);
      }

      return;
    }

    this.historyReportId = null;
    this.currentUserIsApprover = null;
    this.clearHistory();

    if (tabSlug === 'initiate') {
      this.clearActiveReport();
      const workflowState = this.resolveInitiateWorkflowState();
      this.applyInitiateWorkflowState(workflowState);
      const reportId = workflowState?.reportId ?? routeReportId ?? null;
      this.initiatedReportId = reportId;
      this.currentReportId = reportId;
      this.reportSummary =
        reportId !== null ? this.resolveReportSummary(reportId) : null;
      if (reportId !== null) {
        this.loadReportDetails(reportId);
      }
      this.cdr.markForCheck();
      return;
    }

    if (tabSlug !== 'active') {
      this.applyInitiateWorkflowState(null);
      this.clearActiveReport();
      return;
    }

    const reportId = routeReportId ?? null;
    this.applyInitiateWorkflowState(null);

    if (reportId === null) {
      this.clearActiveReport();
      this.loadActiveReportDetailsFallback();
      return;
    }
    this.currentReportId = reportId;
    const summary = this.resolveReportSummary(reportId);
    this.reportSummary =
      summary ??
      (this.reportSummary?.id === reportId ? this.reportSummary : null);
    this.loadReportDetails(reportId);
  }

  private applyInitiateWorkflowState(
    workflowState: TenderAwardsWorkflowState | null
  ): void {
    this.initiatedReportId =
      workflowState?.reportId ?? this.initiatedReportId ?? null;
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
  }

  private resolveInitiateWorkflowState(): TenderAwardsWorkflowState | null {
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state as
      | TenderAwardsNavigationState
      | undefined;
    const navWorkflow = navState?.tenderAwardsWorkflow;

    if (
      navWorkflow &&
      typeof navWorkflow.reportId === 'number' &&
      this.isValidInitiateStage(navWorkflow.stage)
    ) {
      return navWorkflow;
    }

    if (typeof window !== 'undefined') {
      const historyState = window.history?.state as
        | TenderAwardsNavigationState
        | undefined;
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

  private isValidInitiateStage(
    stage: unknown
  ): stage is TenderAwardsInitiateStage {
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
    this.previousMonthReport = null;
    this.reportCreatedBy = null;
    this.reportStatus = null;
    this.approvalAccessResolved = false;
    this.currentUserIsApprover = null;
    this.cdr.markForCheck();

    const details$ = this.apiEndpoints
      .getBiddingReportDetails(reportId)
      .pipe(take(1));
    const summary$ = this.loadReportSummary(reportId, { forceRefresh: true });

    const load$ = forkJoin([details$, summary$]).subscribe({
      next: ([detailsResult, summary]) => {
        this.applyReportDetails(
          detailsResult,
          summary ?? this.reportSummary ?? null,
          reportId
        );

        this.loadCurrentUserApprovalAccess(reportId);
      },
      error: (error) => {
        this.handleDetailsLoadError(reportId, error);
      },
    });

    this.subscription.add(load$);
  }

  private loadCurrentUserApprovalAccess(reportId: number): void {
    if (!this.isCommitteeMemberView || !this.isPendingApprovalStatus) {
      this.approvalAccessResolved = true;
      this.cdr.markForCheck();
      return;
    }

    this.approvalAccessResolved = false;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .isCurrentUserApprover(reportId)
      .pipe(
        take(1),
        catchError((error) => {

          console.error(
            'Failed to check current user approver permissions',
            error
          );
          return of(false);
        })
      )
      .subscribe((isApprover) => {
        if (this.currentReportId !== reportId) {
          this.approvalAccessResolved = true;
          this.cdr.markForCheck();
          return;
        }

        this.currentUserIsApprover = isApprover === true;
        this.approvalAccessResolved = true;
        this.cdr.markForCheck();
      });

    this.subscription.add(load$);
  }

  private clearActiveReport(): void {
    this.currentReportId = null;
    this.reportSummary = null;
    this.previousMonthReport = null;
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
    this.currentUserIsApprover = null;
    this.approvalAccessResolved = true;
    this.cdr.markForCheck();
  }

  private resolveReportSummary(reportId: number): BiddingReport | null {
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state as
      | TenderAwardsNavigationState
      | undefined;
    if (navState?.reportSummary?.id === reportId) {
      return navState.reportSummary;
    }

    if (typeof window !== 'undefined') {
      const historyState = window.history?.state as
        | TenderAwardsNavigationState
        | undefined;
      if (historyState?.reportSummary?.id === reportId) {
        return historyState.reportSummary;
      }

      try {
        const stored = window.sessionStorage?.getItem(
          `tender-awards-report-summary-${reportId}`
        );
        if (stored) {
          const parsed = JSON.parse(stored) as BiddingReport;
          if (parsed?.id === reportId) {
            return parsed;
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to load tender award report summary from storage',
          error
        );
      }
    }

    return null;
  }

  private loadReportSummary(
    reportId: number,
    options?: { forceRefresh?: boolean }
  ): Observable<BiddingReport | null> {
    const forceRefresh = options?.forceRefresh === true;

    if (!forceRefresh && this.reportSummary?.id === reportId) {
      return of(this.reportSummary).pipe(take(1));
    }

    return this.apiEndpoints.getBiddingReports().pipe(
      map(
        (reports) => reports.find((report) => report.id === reportId) ?? null
      ),
      take(1)
    );
  }

  private loadPreviousMonthReport(summary: BiddingReport | null): void {
    const previousPeriod = this.getPreviousMonthPeriod(summary);

    if (!previousPeriod) {
      this.previousMonthReport = null;
      this.calculateSummaries();
      return;
    }

    const load$ = this.apiEndpoints
      .getBiddingReports(previousPeriod)
      .pipe(take(1))
      .subscribe({
        next: (reports) => {
          this.previousMonthReport =
            reports.find(
              (report) =>
                this.getMonthNumber(report.reportMonth) ===
                  previousPeriod.month && report.reportYear === previousPeriod.year
            ) ?? null;
          this.calculateSummaries();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load previous month bidding report', error);
          this.previousMonthReport = null;
          this.calculateSummaries();
        },
      });

    this.subscription.add(load$);
  }

  private getPreviousMonthPeriod(
    summary: BiddingReport | null
  ): { month: number; year: number } | null {
    const monthNumber = this.getMonthNumber(summary?.reportMonth);
    const year = summary?.reportYear;

    if (!monthNumber || typeof year !== 'number') {
      return null;
    }

    if (monthNumber === 1) {
      return { month: 12, year: year - 1 };
    }

    return { month: monthNumber - 1, year };
  }

  private getMonthNumber(
    monthValue: string | number | null | undefined
  ): number | null {
    if (typeof monthValue === 'number') {
      return Number.isFinite(monthValue) && monthValue >= 1 && monthValue <= 12
        ? monthValue
        : null;
    }

    const trimmed = monthValue?.trim();
    if (!trimmed) {
      return null;
    }

    const numericMonth = Number(trimmed);
    if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
      return numericMonth;
    }

    const normalized = trimmed.toLowerCase();
    const index = TenderAwardsComponent.MONTH_NAMES.findIndex(
      (name) => name.toLowerCase() === normalized
    );

    return index >= 0 ? index + 1 : null;
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

  private runApprovalAction(
    action: ApprovalAction,
    actionFactory: () => Observable<void>
  ): void {
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

  private registerHistoryPendingChange(row: BiddingReportHistoryEntry): void {
    if (!row || typeof row.id !== 'number') {
      return;
    }

    const normalizedComment = this.normalizeComment(row.comments);
    const normalizedAdditionalPR = row.additionalVolumePR ?? null;
    const normalizedAdditionalBT = row.additionalVolumeBT ?? null;
    const original =
      this.originalHistoryDetails.get(row.id) ??
      ({
        additionalVolumePR: null,
        additionalVolumeBT: null,
        comments: null,
      } as const);

    const matchesOriginal =
      normalizedComment === original.comments &&
      normalizedAdditionalPR === original.additionalVolumePR &&
      normalizedAdditionalBT === original.additionalVolumeBT;

    if (matchesOriginal) {
      this.pendingHistoryUpdates.delete(row.id);
    } else {
      this.pendingHistoryUpdates.set(row.id, {
        id: row.id,
        additionalVolumePR: normalizedAdditionalPR,
        additionalVolumeBT: normalizedAdditionalBT,
        comments: normalizedComment,
      });
    }

    this.historyDataSource.data = [...this.historyDataSource.data];
    this.cdr.markForCheck();
  }

  saveHistoryChanges(): void {
    const save$ = this.performHistoryAutoSave().subscribe();
    this.subscription.add(save$);
  }

  private filterAwardsByProduct(product: ProductKey): AwardsTableRow[] {
    return this.awardDetails.filter(
      (detail) => this.normalizeProduct(detail.product) === product
    );
  }

  private normalizeProduct(
    product: string | null | undefined
  ): ProductKey | null {
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
    this.awardTables.propane.dataSource.data =
      this.filterAwardsByProduct('propane');
    this.awardTables.butane.dataSource.data =
      this.filterAwardsByProduct('butane');

    this.calculateSummaries();
  }

  private roundToHundredths(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private calculateSummaries(): void {
    // Calculate Propane summaries
    const propaneData = this.awardTables.propane.dataSource.data;
    const propaneWeightedAverage = this.roundToHundredths(
      this.reportSummary?.weightedAvgPropanePrice ??
        this.calculateWeightedAverage(propaneData)
    );
    this.propaneSummary = {
      totalVolume: this.roundToHundredths(
        propaneData.reduce((sum, row) => sum + (row.bidVolume || 0), 0)
      ),
      weightedAverage: propaneWeightedAverage,
      difference: this.calculatePriceDifference('propane'),
      totalRk: this.roundToHundredths(
        propaneData.reduce(
          (sum, row) => sum + (row.finalAwardedVolume || 0),
          0
        )
      ),
    };

    // Calculate Butane summaries
    const butaneData = this.awardTables.butane.dataSource.data;
    const butaneWeightedAverage = this.roundToHundredths(
      this.reportSummary?.weightedAvgButanePrice ??
        this.calculateWeightedAverage(butaneData)
    );
    this.butaneSummary = {
      totalVolume: this.roundToHundredths(
        butaneData.reduce((sum, row) => sum + (row.bidVolume || 0), 0)
      ),
      weightedAverage: butaneWeightedAverage,
      difference: this.calculatePriceDifference('butane'),
      totalRk: this.roundToHundredths(
        butaneData.reduce(
          (sum, row) => sum + (row.finalAwardedVolume || 0),
          0
        )
      ),
    };

    // Update statistics
    this.statistics.totalBidVolume = this.roundToHundredths(
      this.propaneSummary.totalVolume + this.butaneSummary.totalVolume
    );
    this.statistics.totalLpgForRk = this.roundToHundredths(
      this.propaneSummary.totalRk + this.butaneSummary.totalRk
    );
    this.statistics.weightedAverage = this.calculateOverallWeightedAverage();

    this.cdr.markForCheck();
  }

  formatDifference(value: number, digitsInfo: string = '1.0-0'): string {
    const formatted = this.decimalPipe.transform(
      Math.abs(value || 0),
      digitsInfo
    );

    if (value > 0) {
      return `+${formatted}`;
    }

    if (value < 0) {
      return `-${formatted}`;
    }

    return formatted ?? '0';
  }

  getDifferenceClasses(value: number): Record<string, boolean> {
    return {
      'summary-card--success': value > 0,
      'summary-card--danger': value < 0,
    };
  }

  private calculateWeightedAverage(data: AwardsTableRow[]): number {
    const totalVolume = data.reduce(
      (sum, row) => sum + (row.finalAwardedVolume || 0),
      0
    );
    if (totalVolume === 0) return 0;

    const weightedSum = data.reduce((sum, row) => {
      return sum + (row.bidPrice || 0) * (row.finalAwardedVolume || 0);
    }, 0);

    return this.roundToHundredths(weightedSum / totalVolume);
  }

  private calculateOverallWeightedAverage(): number {
    const allData = [
      ...this.awardTables.propane.dataSource.data,
      ...this.awardTables.butane.dataSource.data,
    ];
    return this.calculateWeightedAverage(allData);
  }

  private calculatePriceDifference(product: ProductKey): number {
    if (!this.previousMonthReport) {
      return 0;
    }

    const currentPrice =
      product === 'propane'
        ? this.reportSummary?.weightedAvgPropanePrice
        : this.reportSummary?.weightedAvgButanePrice;

    const previousPrice =
      product === 'propane'
        ? this.previousMonthReport?.weightedAvgPropanePrice
        : this.previousMonthReport?.weightedAvgButanePrice;

    const safeCurrent = typeof currentPrice === 'number' ? currentPrice : 0;
    const safePrevious = typeof previousPrice === 'number' ? previousPrice : 0;

    return this.roundToHundredths(safeCurrent - safePrevious);
  }

  openManageApproversDialog(): void {
    if (!this.isActiveStatus && !this.isLpgCoordinator) {
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

  private fetchReportApprovers(
    reportId: number
  ): Observable<ReportApproversDto[]> {
    return this.apiEndpoints.getReportApprovers(reportId).pipe(
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
    return (
      this.currentReportId === reportId || this.initiatedReportId === reportId
    );
  }


  private loadHistoryReportSummary(reportId: number): void {
    const summary$ = this.loadReportSummary(reportId).subscribe({
      next: (summary) => {
        if (this.historyReportId !== reportId) {
          return;
        }

        this.reportSummary = summary ?? null;
        this.reportCreatedBy = summary?.createdBy ?? this.reportCreatedBy;
        this.updateReportStatus(
          summary?.status ?? this.reportStatus ?? null,
          reportId
        );
        this.cdr.markForCheck();
      },
      error: (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load bidding report summary', error);
      },
    });

    this.subscription.add(summary$);
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
          this.resetHistoryPendingChanges(entries);
          this.historyLoadError = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.historyDataSource.data = [];
          this.resetHistoryPendingChanges([]);
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
    this.resetHistoryPendingChanges([]);
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

  private resetHistoryPendingChanges(
    entries: BiddingReportHistoryEntry[]
  ): void {
    this.originalHistoryDetails.clear();
    this.pendingHistoryUpdates.clear();

    for (const entry of entries) {
      const normalizedComment = this.normalizeComment(entry.comments);
      entry.comments = normalizedComment ?? '';

      this.originalHistoryDetails.set(entry.id, {
        additionalVolumePR: entry.additionalVolumePR ?? null,
        additionalVolumeBT: entry.additionalVolumeBT ?? null,
        comments: normalizedComment,
      });
    }
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
    if (this.currentReportId === null || this.isSummaryUpdating) {
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
          this.cdr.markForCheck();
          this.isCommentsLoading = false;

        })
      )
      .subscribe({
        next: (summaries) => {
          const dialogRef = this.dialog.open<
            TenderCommentsDialogComponent,
            TenderCommentsDialogData,
            TenderCommentsDialogResult
          >(TenderCommentsDialogComponent, {
            width: '600px',
            maxWidth: '95vw',
            data: {
              reportName,
              summaries,
            },
          });

          const closed$ = dialogRef.afterClosed().subscribe((result) => {
            const additionalInformation =
              result?.additionalInformation?.trim() ?? '';

            if (!additionalInformation || this.currentReportId === null) {
              return;
            }

            this.submitAdditionalInformation(
              this.currentReportId,
              additionalInformation
            );
          });

          this.subscription.add(closed$);
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch report summary', error);
        },
      });

    this.subscription.add(summary$);
  }

  private submitAdditionalInformation(
    reportId: number,
    additionalInformation: string
  ): void {
    this.isCommentsLoading = true;
    this.isSummaryUpdating = true;
    this.cdr.markForCheck();

    const update$ = this.apiEndpoints
      .updateReportSummary({
        biddingReportId: reportId,
        additionalInformation,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.isCommentsLoading = false;
          this.isSummaryUpdating = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to update report summary', error);
        },
      });

    this.subscription.add(update$);
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
          this.activeReportCheckError =
            'Unable to verify if another active report exists.';
          this.cdr.markForCheck();
        },
      });

    this.subscription.add(check$);
  }

  private toMonthName(monthValue: string | number | null | undefined): string {
    const trimmed =
      typeof monthValue === 'number' ? String(monthValue) : monthValue?.trim();
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
    return value.replace(
      /\w\S*/g,
      (word) => word[0]?.toUpperCase() + word.substring(1).toLowerCase()
    );
  }

  private normalizeReportStatus(status: string | null | undefined): string {
    return String(status ?? '')
      .trim()
      .toLowerCase();
  }
}
