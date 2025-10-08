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

type TenderTab = 'Initiate' | 'History' | 'Active';
type TenderTableKey = 'history' | 'awards' | 'secondary';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenderAwardsComponent implements AfterViewInit, OnDestroy {
  activeTab: TenderTab = 'Initiate';

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
    { key: 'reference', label: 'Reference' },
    { key: 'bidder', label: 'Bidder' },
    { key: 'score', label: 'Score' },
    { key: 'status', label: 'Status' }
  ];

  readonly awardsData: DataRow[] = [
    { reference: 'TA-1045', bidder: 'Atlas Energy', score: '86%', status: 'Active' },
    { reference: 'TA-1046', bidder: 'Orion Logistics', score: '78%', status: 'Pending' }
  ];

  readonly secondTableData: DataRow[] = [
    { reference: 'TA-0934', bidder: 'Northwind Corp', score: '92%', status: 'Completed' },
    { reference: 'TA-0931', bidder: 'Summit Holdings', score: '88%', status: 'Completed' }
  ];

  readonly secondaryColumns: DataColumn[] = this.awardsColumns;

  readonly statusOptions: string[] = ['Pending', 'Active', 'Completed'];

  readonly historyDataSource = this.buildDataSource(this.historyTableData);
  readonly awardsDataSource = this.buildDataSource(this.awardsData);
  readonly secondaryDataSource = this.buildDataSource(this.secondTableData);

  selectedMonth = '';
  selectedYear!: number;

  @ViewChild('historySort') historySort?: MatSort;
  @ViewChild('awardsSort') awardsSort?: MatSort;
  @ViewChild('secondarySort') secondarySort?: MatSort;

  private readonly subscription = new Subscription();

  constructor(
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog
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

  get historyDisplayedColumns(): string[] {
    return [...this.historyColumns.map((column) => column.key), 'actions'];
  }

  get awardsDisplayedColumns(): string[] {
    return [...this.awardsColumns.map((column) => column.key), 'actions'];
  }

  get secondaryDisplayedColumns(): string[] {
    return [...this.secondaryColumns.map((column) => column.key), 'actions'];
  }

  ngAfterViewInit(): void {
    if (this.historySort) {
      this.historyDataSource.sort = this.historySort;
    }

    if (this.awardsSort) {
      this.awardsDataSource.sort = this.awardsSort;
    }

    if (this.secondarySort) {
      this.secondaryDataSource.sort = this.secondarySort;
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
      case 'secondary':
        return this.secondaryDataSource;
      default:
        return this.historyDataSource;
    }
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


