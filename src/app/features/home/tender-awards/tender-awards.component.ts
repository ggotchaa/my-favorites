import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { ManageBiddersDialogComponent } from './manage-bidders-dialog/manage-bidders-dialog.component';
import {
  SendForApprovalDialogComponent,
  SendForApprovalDialogData,
  SendForApprovalDialogResult,
} from './send-for-approval-dialog/send-for-approval-dialog.component';
import {
  ViewProposalsDialogComponent,
  ViewProposalsDialogData,
} from './view-proposals-dialog/view-proposals-dialog.component';

type TenderTab = 'Initiate' | 'History' | 'Active';
type TenderTabSlug = 'initiate' | 'history' | 'active';
type AwardsTableRow = BiddingReportDetail;

interface DataColumn {
  key: string;
  label: string;
}

interface DataRow {
  status?: string;
  [key: string]: string | number | Date | undefined;
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
  private static readonly TAB_SLUG_TO_LABEL: Record<TenderTabSlug, TenderTab> = {
    initiate: 'Initiate',
    history: 'History',
    active: 'Active',
  };

  activeTab: TenderTab = 'Active';
  private currentTabSlug: TenderTabSlug = 'active';
  currentReportId: number | null = null;

  readonly historyColumns: DataColumn[] = [
    { key: 'period', label: 'Period' },
    { key: 'awards', label: 'Awards' },
    { key: 'volume', label: 'Volume' },
    { key: 'status', label: 'Status' }
  ];

  readonly historyTableData: DataRow[] = [
    { period: 'Oct 2023', awards: 12, volume: '1,240', status: 'Completed' },
    { period: 'Nov 2023', awards: 9, volume: '980', status: 'Active' },
    { period: 'Dec 2023', awards: 11, volume: '1,105', status: 'Pending' }
  ];

  readonly awardsColumns: DataColumn[] = [
    { key: 'product', label: 'Product' },
    { key: 'bidder', label: 'Bidder' },
    { key: 'status', label: 'Status' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'bidVolume', label: 'Bid Volume' },
    { key: 'bidPrice', label: 'Bid Price' },
    { key: 'differentialPrice', label: 'Differential Price' },
    { key: 'rankPerPrice', label: 'Rank Per Price' },
    { key: 'rollingLiftFactor', label: 'Rolling Lift Factor' },
    { key: 'awardedVolume', label: 'Awarded Volume' },
    { key: 'finalAwardedVolume', label: 'Final Awarded Volume' },
    { key: 'comments', label: 'Comments' }
  ];

  readonly statusOptions: string[] = ['Pending', 'Active', 'Completed'];

  readonly historyDataSource = this.buildDataSource(this.historyTableData);
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
    this.awardTables.butane,
    this.awardTables.propane,
  ];

  private editingCommentsRowId: number | null = null;
  private awardDetails: AwardsTableRow[] = [];

  selectedMonth = '';
  selectedYear!: number | 'All';
  isLoadingProposals = false;
  isLoadingDetails = false;
  detailsLoadError = false;
  isLoadingApprovers = false;
  isSendingForApproval = false;
  reportSummary: BiddingReport | null = null;

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
    this.selectedMonth = this.filters.selectedMonth;
    this.selectedYear = this.filters.selectedYear;

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
    return [...this.awardsColumns.map((column) => column.key), 'actions'];
  }

  get hasAwardData(): boolean {
    return this.awardTableList.some((table) => table.dataSource.data.length > 0);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.route.paramMap.subscribe((params) => this.handleRouteParams(params))
    );
  }

  isEditingComments(row: AwardsTableRow): boolean {
    return this.editingCommentsRowId === row.id;
  }

  enableCommentEditing(row: AwardsTableRow): void {
    if (this.editingCommentsRowId === row.id) {
      return;
    }

    this.editingCommentsRowId = row.id;
    this.cdr.markForCheck();
  }

  activateCommentEditing(event: Event, row: AwardsTableRow): void {
    event.preventDefault();
    this.enableCommentEditing(row);
  }

  disableCommentEditing(): void {
    if (this.editingCommentsRowId === null) {
      return;
    }

    this.editingCommentsRowId = null;
    this.cdr.markForCheck();
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

  openProposalsDialog(): void {
    if (this.isLoadingProposals) {
      return;
    }

    const period = this.buildCurrentPeriod();

    this.isLoadingProposals = true;

    const load$ = this.apiEndpoints
      .getAribaProposals(period)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadingProposals = false;
        })
      )
      .subscribe({
        next: (proposals) => {
          this.dialog.open<ViewProposalsDialogComponent, ViewProposalsDialogData>(
            ViewProposalsDialogComponent,
            {
              width: '960px',
              maxHeight: '80vh',
              data: {
                period,
                proposals,
              },
            }
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load Ariba proposals', error);
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
      default:
        return 'status-badge--default';
    }
  }

  openStatusDialog(
    row: Record<string, unknown>,
    dataSource: MatTableDataSource<AwardsTableRow | DataRow>
  ): void {
    const data: TenderStatusDialogData = {
      currentStatus: (row['status'] as string) ?? 'Pending',
      statusOptions: this.statusOptions
    };

    const dialogRef = this.dialog.open<TenderStatusDialogComponent, TenderStatusDialogData, TenderStatusDialogResult>(
      TenderStatusDialogComponent,
      {
        width: '420px',
        data
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.applyStatusChange(row, dataSource, result.newStatus);
    });
  }

  private applyStatusChange(
    row: Record<string, unknown>,
    dataSource: MatTableDataSource<AwardsTableRow | DataRow>,
    newStatus: string
  ): void {
    row['status'] = newStatus;
    dataSource.data = [...dataSource.data];
  }

  openSendForApprovalDialog(): void {
    if (this.currentReportId === null || this.isLoadingApprovers || this.isSendingForApproval) {
      return;
    }

    const reportId = this.currentReportId;
    this.isLoadingApprovers = true;
    this.cdr.markForCheck();

    const load$ = this.apiEndpoints
      .getReportApprovers(reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadingApprovers = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (approvers) => {
          const dialogRef = this.dialog.open<
            SendForApprovalDialogComponent,
            SendForApprovalDialogData,
            SendForApprovalDialogResult
          >(SendForApprovalDialogComponent, {
            width: '460px',
            data: { approvers },
          });

          const dialogClosed$ = dialogRef.afterClosed().subscribe((result) => {
            if (!result || !Array.isArray(result.approvers) || result.approvers.length === 0) {
              return;
            }

            this.isSendingForApproval = true;
            this.cdr.markForCheck();

            const submit$ = this.apiEndpoints
              .setReportApprovers(reportId, result.approvers)
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
                  console.error('Failed to send bidding report for approval', error);
                },
              });

            this.subscription.add(submit$);
          });

          this.subscription.add(dialogClosed$);
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load report approvers', error);
        },
      });

    this.subscription.add(load$);
  }

  onCommentChange(row: AwardsTableRow, comments: string): void {
    row.comments = comments;
    this.refreshAwardTables();
    this.cdr.markForCheck();
  }

  openManageBiddersDialog(): void {
    this.dialog.open(ManageBiddersDialogComponent, {
      width: '680px',
      maxHeight: '80vh',
    });
  }

  private buildCurrentPeriod(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${now.getFullYear()}-${month}-${day}`;
  }

  private buildDataSource<T extends Record<string, unknown>>(rows: T[]): MatTableDataSource<T> {
    const dataSource = new MatTableDataSource(rows);
    dataSource.sortingDataAccessor = (item, property) => this.sortingDataAccessor(item, property);
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

    if (tabSlug !== 'active') {
      this.clearActiveReport();
      return;
    }

    const reportId = this.parseReportId(params.get('reportId'));
    if (reportId === null) {
      this.clearActiveReport();
      return;
    }

    this.currentReportId = reportId;
    const summary = this.resolveReportSummary(reportId);
    this.reportSummary = summary ?? (this.reportSummary?.id === reportId ? this.reportSummary : null);
    this.loadReportDetails(reportId);
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
    this.cdr.markForCheck();

    const details$ = this.apiEndpoints.getBiddingReportDetails(reportId).pipe(take(1));
    const summary$ = this.loadReportSummary(reportId);

    const load$ = forkJoin([details$, summary$]).subscribe({
      next: ([details, summary]) => {
        const resolvedSummary = summary ?? this.reportSummary;
        this.reportSummary = resolvedSummary ?? null;
        this.editingCommentsRowId = null;
        this.awardDetails = details;
        this.updateAwardTables();
        this.isLoadingDetails = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.editingCommentsRowId = null;
        this.awardDetails = [];
        this.clearAwardTables();
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
    this.editingCommentsRowId = null;
    this.awardDetails = [];
    this.clearAwardTables();
    this.isLoadingDetails = false;
    this.detailsLoadError = false;
    this.cdr.markForCheck();
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

  private updateAwardTables(): void {
    for (const table of this.awardTableList) {
      table.dataSource.data = this.filterAwardsByProduct(table.key);
    }
  }

  private clearAwardTables(): void {
    for (const table of this.awardTableList) {
      table.dataSource.data = [];
    }
  }

  private refreshAwardTables(): void {
    for (const table of this.awardTableList) {
      table.dataSource.data = [...table.dataSource.data];
    }
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

}


