import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import {
  ApiEndpointService,
  BiddingReportDetailsResult,
} from '../../../../core/services/api.service';
import { BiddingReport } from '../bidding-report.interface';
import { BiddingReportDetail } from '../../tender-awards/bidding-report-detail.interface';

 type ProductKey = 'butane' | 'propane';

interface ProductTableConfig {
  key: ProductKey;
  label: string;
  dataSource: MatTableDataSource<BiddingReportDetail>;
}

@Component({
  selector: 'app-report-bidding-details',
  templateUrl: './report-bidding-details.component.html',
  styleUrls: ['./report-bidding-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportBiddingDetailsComponent
  implements AfterViewInit, OnDestroy, OnInit
{
  readonly awardsColumns = [
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
    { key: 'comments', label: 'Comments' },
  ] as const;

  readonly awardsDisplayedColumns = this.awardsColumns.map((column) => column.key);

  readonly awardTables: Record<ProductKey, ProductTableConfig> = {
    propane: {
      key: 'propane',
      label: 'Propane Awards',
      dataSource: new MatTableDataSource<BiddingReportDetail>([]),
    },
    butane: {
      key: 'butane',
      label: 'Butane Awards',
      dataSource: new MatTableDataSource<BiddingReportDetail>([]),
    },
  };

  readonly awardTableOrder: ProductTableConfig[] = [
    this.awardTables.propane,
    this.awardTables.butane,
  ];

  reportSummary: BiddingReport | null = null;
  summaries: BiddingReportDetailsResult['summaries'] = [];
  isLoading = false;
  hasError = false;
  isDownloading = false;
  isArchivedReportAvailable = false;

  private reportId: number | null = null;
  private readonly subscription = new Subscription();
  private awardDetails: BiddingReportDetail[] = [];

  @ViewChild('propaneSort') propaneSort?: MatSort;
  @ViewChild('butaneSort') butaneSort?: MatSort;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.paramMap.subscribe((params) => this.handleParams(params))
    );
  }

  ngAfterViewInit(): void {
    this.updateTableSorts();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackDetail(_: number, detail: BiddingReportDetail): number {
    return detail.id;
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

  valueFor(row: Record<string, unknown>, key: string): string | number | undefined {
    const value = row[key];

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return value;
    }

    return undefined;
  }

  get hasAwardData(): boolean {
    return this.awardTableOrder.some((table) => table.dataSource.data.length > 0);
  }

  get hasSummaries(): boolean {
    return this.summaries.length > 0;
  }

  backToReports(): void {
    void this.router.navigate(['/reports']);
  }

  private handleParams(params: ParamMap): void {
    const reportId = this.parseReportId(params.get('reportId'));

    if (!reportId) {
      this.resetStateForError();
      return;
    }

    if (this.reportId === reportId && this.awardDetails.length > 0) {
      return;
    }

    this.reportId = reportId;
    this.loadReportSummary(reportId);
    this.loadDetails(reportId);
  }

  private loadDetails(reportId: number): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.apiEndpoints
      .getBiddingReportDetails(reportId)
      .pipe(take(1))
      .subscribe({
        next: (details) => {
          this.isLoading = false;
          this.awardDetails = details.details;
          this.summaries = details.summaries;
          this.isArchivedReportAvailable = !!(details?.reportFileName);
          this.populateTables();
          this.updateTableSorts();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          this.hasError = true;
          this.awardDetails = [];
          this.summaries = [];
          this.clearTables();
          this.cdr.markForCheck();
          // eslint-disable-next-line no-console
          console.error('Failed to load bidding report details', error);
        },
      });
  }

  private loadReportSummary(reportId: number): void {
    const resolved = this.resolveReportSummary(reportId);
    if (resolved) {
      this.reportSummary = resolved;
      this.cdr.markForCheck();
      return;
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

  private populateTables(): void {
    for (const table of this.awardTableOrder) {
      table.dataSource.data = this.filterByProduct(table.key);
    }
  }

  private clearTables(): void {
    for (const table of this.awardTableOrder) {
      table.dataSource.data = [];
    }
  }

  private filterByProduct(product: ProductKey): BiddingReportDetail[] {
    return this.awardDetails.filter((detail) => this.normalizeProduct(detail.product) === product);
  }

  private normalizeProduct(product: string | null | undefined): ProductKey | null {
    const normalized = (product ?? '').trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    if (normalized.includes('propane')) {
      return 'propane';
    }

    if (normalized.includes('butane')) {
      return 'butane';
    }

    return null;
  }

  private updateTableSorts(): void {
    const propaneSort = this.propaneSort;
    if (propaneSort) {
      this.awardTables.propane.dataSource.sort = propaneSort;
    }

    const butaneSort = this.butaneSort;
    if (butaneSort) {
      this.awardTables.butane.dataSource.sort = butaneSort;
    }
  }

  private resetStateForError(): void {
    this.reportId = null;
    this.reportSummary = null;
    this.awardDetails = [];
    this.summaries = [];
    this.clearTables();
    this.isLoading = false;
    this.hasError = true;
    this.cdr.markForCheck();
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
        console.error('Failed to load report summary from storage', error);
      }
    }

    return null;
  }

  downloadArchivedReport(): void {
    if (this.reportId === null || this.isDownloading) {
      return;
    }

    const fileName = this.reportSummary
      ? `Tender_Award_Report_${this.reportSummary.reportMonth}_${this.reportSummary.reportYear}.pdf`
      : `Tender_Award_Report_${this.reportId}.pdf`;

    this.isDownloading = true;
    this.cdr.markForCheck();

    const download$ = this.apiEndpoints
      .downloadBiddingReportPDF(this.reportId)
      .pipe(take(1))
      .subscribe({
        next: (blob) => {
          this.isDownloading = false;
          this.cdr.detectChanges();
          this.apiEndpoints.handleReportExportedBlob(blob, fileName);
        },
        error: (error) => {
          console.error('Failed to download report PDF', error);
          this.isDownloading = false;
          this.cdr.detectChanges();
        },
      });

    this.subscription.add(download$);
  }
}
