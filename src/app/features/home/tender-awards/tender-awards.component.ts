import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { HomeFiltersService } from '../services/home-filters.service';
import {
  TenderStatusDialogComponent,
  TenderStatusDialogData,
  TenderStatusDialogResult
} from './status-change-dialog/tender-status-dialog.component';
import { ManageBiddersDialogComponent } from './manage-bidders-dialog/manage-bidders-dialog.component';
import { SendForApprovalDialogComponent } from './send-for-approval-dialog/send-for-approval-dialog.component';

type TenderTab = 'Initiate' | 'History' | 'Active';
type TenderTableKey = 'history' | 'awards';

interface DataColumn {
  key: string;
  label: string;
}

interface DataRow {
  status?: string;
  [key: string]: string | number | Date | undefined;
}

@Component({
  selector: 'app-tender-awards',
  templateUrl: './tender-awards.component.html',
  styleUrls: ['./tender-awards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TenderAwardsComponent implements AfterViewInit, OnDestroy {
  activeTab: TenderTab = 'Active';

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
    { key: 'region', label: 'Region' },
    { key: 'status', label: 'Status' },
    { key: 'month', label: 'Month' },
    { key: 'bidVolume', label: 'Bid Volume' },
    { key: 'proposedPrice', label: 'Proposed Price' },
    { key: 'rankPerPrice', label: 'Rank Per Price' },
    { key: 'twelveMonthRlf', label: '12 Month RLF' },
    { key: 'awardVolume', label: 'Award Volume' },
    { key: 'finalAwardVolume', label: 'Final Award Volume' },
    { key: 'comments', label: 'Comments' }
  ];

  readonly awardsData: DataRow[] = [
    {
      product: 'Propane',
      bidder: 'Atlas Energy',
      region: 'North America',
      status: 'Active',
      month: 'March',
      bidVolume: 1200,
      proposedPrice: 205,
      rankPerPrice: 1,
      twelveMonthRlf: 198,
      awardVolume: 1100,
      finalAwardVolume: 0,
      comments: ''
    },
    {
      product: 'Butane',
      bidder: 'Summit Holdings',
      region: 'Asia Pacific',
      status: 'Pending',
      month: 'March',
      bidVolume: 950,
      proposedPrice: 198,
      rankPerPrice: 2,
      twelveMonthRlf: 190,
      awardVolume: 900,
      finalAwardVolume: 0,
      comments: ''
    },
    {
      product: 'LPG Mix',
      bidder: 'Orion Logistics',
      region: 'Middle East',
      status: 'Active',
      month: 'March',
      bidVolume: 860,
      proposedPrice: 212,
      rankPerPrice: 3,
      twelveMonthRlf: 202,
      awardVolume: 780,
      finalAwardVolume: 0,
      comments: ''
    }
  ];

  readonly statusOptions: string[] = ['Pending', 'Active', 'Completed'];

  readonly historyDataSource = this.buildDataSource(this.historyTableData);
  readonly awardsDataSource = this.buildDataSource(this.awardsData);

  selectedMonth = '';
  selectedYear!: number | 'All';

  @ViewChild('historySort') historySort?: MatSort;
  @ViewChild('awardsSort') awardsSort?: MatSort;
  private readonly subscription = new Subscription();

  constructor(
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog
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

  ngAfterViewInit(): void {
    if (this.historySort) {
      this.historyDataSource.sort = this.historySort;
    }

    if (this.awardsSort) {
      this.awardsDataSource.sort = this.awardsSort;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setTab(tab: TenderTab): void {
    this.activeTab = tab;
  }

  valueFor(row: DataRow, key: string): string | number | Date | undefined {
    return row[key];
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

  openStatusDialog(row: DataRow, tableKey: TenderTableKey): void {
    const data: TenderStatusDialogData = {
      currentStatus: (row.status as string) ?? 'Pending',
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

      this.applyStatusChange(row, tableKey, result.newStatus);
    });
  }

  private applyStatusChange(row: DataRow, tableKey: TenderTableKey, newStatus: string): void {
    row.status = newStatus;
    const dataSource = this.getDataSource(tableKey);
    dataSource.data = [...dataSource.data];
  }

  private getDataSource(tableKey: TenderTableKey): MatTableDataSource<DataRow> {
    switch (tableKey) {
      case 'history':
        return this.historyDataSource;
      case 'awards':
        return this.awardsDataSource;
      default:
        return this.historyDataSource;
    }
  }

  onFinalAwardVolumeChange(row: DataRow, rawValue: string | number | null | undefined): void {
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      row['finalAwardVolume'] = undefined;
      this.refreshAwardsData();
      return;
    }

    const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    row['finalAwardVolume'] = Number.isFinite(numericValue)
      ? numericValue
      : row['finalAwardVolume'];
    this.refreshAwardsData();
  }

  onCommentsChange(row: DataRow, comments: string): void {
    row['comments'] = comments;
    this.refreshAwardsData();
  }

  openSendForApprovalDialog(): void {
    this.dialog.open(SendForApprovalDialogComponent, {
      width: '460px',
    });
  }

  openManageBiddersDialog(): void {
    this.dialog.open(ManageBiddersDialogComponent, {
      width: '680px',
      maxHeight: '80vh',
    });
  }

  private refreshAwardsData(): void {
    this.awardsDataSource.data = [...this.awardsDataSource.data];
  }

  private buildDataSource(rows: DataRow[]): MatTableDataSource<DataRow> {
    const dataSource = new MatTableDataSource(rows);
    dataSource.sortingDataAccessor = (item, property) => this.sortingDataAccessor(item, property);
    return dataSource;
  }

  private sortingDataAccessor(item: DataRow, property: string): string | number {
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
}


