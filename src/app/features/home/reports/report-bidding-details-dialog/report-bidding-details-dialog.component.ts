import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { finalize, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../../core/services/api.service';
import { BiddingReport } from '../bidding-report.interface';
import { BiddingReportDetail } from '../../tender-awards/bidding-report-detail.interface';

type ProductKey = 'butane' | 'propane';

interface ProductTableConfig {
  key: ProductKey;
  label: string;
  dataSource: MatTableDataSource<BiddingReportDetail>;
}

export interface ReportBiddingDetailsDialogData {
  reportId: number;
  reportName: string;
  reportSummary: BiddingReport;
}

@Component({
  selector: 'app-report-bidding-details-dialog',
  templateUrl: './report-bidding-details-dialog.component.html',
  styleUrls: ['./report-bidding-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportBiddingDetailsDialogComponent implements OnInit {
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

  readonly awardTables: Record<ProductKey, ProductTableConfig> = {
    butane: {
      key: 'butane',
      label: 'Butane Awards',
      dataSource: new MatTableDataSource<BiddingReportDetail>([]),
    },
    propane: {
      key: 'propane',
      label: 'Propane Awards',
      dataSource: new MatTableDataSource<BiddingReportDetail>([]),
    },
  };

  readonly awardTableList: ProductTableConfig[] = [
    this.awardTables.butane,
    this.awardTables.propane,
  ];

  readonly awardsDisplayedColumns = [...this.awardsColumns.map((column) => column.key)];

  isLoading = true;
  hasError = false;

  private awardDetails: BiddingReportDetail[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: ReportBiddingDetailsDialogData,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly dialogRef: MatDialogRef<ReportBiddingDetailsDialogComponent>,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.dialogRef.addPanelClass('full-screen-dialog');
    this.dialogRef.updateSize('100vw', '100vh');
  }

  ngOnInit(): void {
    this.loadDetails();
  }

  get reportSummary(): BiddingReport {
    return this.data.reportSummary;
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

  trackDetail(_: number, detail: BiddingReportDetail): number {
    return detail.id;
  }

  private loadDetails(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.apiEndpoints
      .getBiddingReportDetails(this.data.reportId)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (details) => {
          this.awardDetails = details;
          this.populateTables();
        },
        error: (error) => {
          this.hasError = true;
          this.clearTables();
          // eslint-disable-next-line no-console
          console.error('Failed to load bidding report details for completed report', error);
        },
      });
  }

  private populateTables(): void {
    for (const table of this.awardTableList) {
      table.dataSource.data = this.filterByProduct(table.key);
    }
  }

  private clearTables(): void {
    for (const table of this.awardTableList) {
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

    if (normalized.includes('butane')) {
      return 'butane';
    }

    if (normalized.includes('propane')) {
      return 'propane';
    }

    return null;
  }
}
