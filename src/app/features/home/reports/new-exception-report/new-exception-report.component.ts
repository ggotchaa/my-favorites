import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../../core/services/api.service';
import { BiddingReport } from '../bidding-report.interface';
import { BiddingReportDetail } from '../../tender-awards/bidding-report-detail.interface';

type EditableNumberKey = 'finalAwardedVolume';

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

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(this.route.queryParamMap.subscribe((params) => this.handleParams(params)));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackRow(_: number, row: EditableExceptionRow): number {
    return row.id;
  }

  onNumberChange(row: EditableExceptionRow, key: EditableNumberKey, value: string): void {
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
    row.comments = value;
    this.refreshTable();
  }

  save(): void {
    if (!this.reportId || this.isSaving) {
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
}
