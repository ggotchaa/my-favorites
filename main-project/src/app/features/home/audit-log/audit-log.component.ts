import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface AuditLogEntry {
  timestamp: Date;
  user: string;
  action: string;
  page: string;
}

interface AuditLogFilters {
  name: string;
  page: string;
  date: string;
}

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuditLogComponent implements AfterViewInit {
  @ViewChild(MatSort) sort?: MatSort;

  readonly displayedColumns: string[] = ['timestamp', 'user', 'action', 'page'];

  readonly filters: AuditLogFilters = {
    name: '',
    page: '',
    date: '',
  };

  private readonly allEntries: AuditLogEntry[] = [
    this.createEntry(1, 9, 'Andrea Martinez', 'Submitted tender for approval', 'Tender Awards'),
    this.createEntry(2, 11, 'Michael Chen', 'Updated bidder endorsement', 'Tender Awards'),
    this.createEntry(3, 15, 'Priya Nair', 'Adjusted award volume', 'Tender Awards'),
    this.createEntry(4, 10, 'Liam O’Connor', 'Uploaded supporting document', 'Bidding Reports'),
    this.createEntry(5, 14, 'Sofia Rossi', 'Reviewed compliance checklist', 'Tender Awards'),
    this.createEntry(6, 13, 'Andrea Martinez', 'Generated monthly summary', 'Bidding Reports'),
    this.createEntry(8, 16, 'George Anderson', 'Archived closed opportunity', 'Customer List'),
  ];

  readonly dataSource = new MatTableDataSource<AuditLogEntry>(this.logsWithinLastWeek());

  constructor() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'timestamp') {
        return item.timestamp.getTime();
      }

      return (item as Record<string, unknown>)[property] ?? '';
    };
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  onFiltersChanged(): void {
    const normalizedName = this.filters.name.trim().toLowerCase();
    const normalizedPage = this.filters.page.trim().toLowerCase();
    const normalizedDate = this.filters.date;

    const filtered = this.logsWithinLastWeek().filter((entry) => {
      const matchesName = !normalizedName || entry.user.toLowerCase().includes(normalizedName);
      const matchesPage = !normalizedPage || entry.page.toLowerCase().includes(normalizedPage);
      const matchesDate =
        !normalizedDate || this.toDateInputValue(entry.timestamp) === normalizedDate;

      return matchesName && matchesPage && matchesDate;
    });

    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.filters.name = '';
    this.filters.page = '';
    this.filters.date = '';
    this.dataSource.data = this.logsWithinLastWeek();
  }

  toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private logsWithinLastWeek(): AuditLogEntry[] {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    return this.allEntries.filter((entry) => now - entry.timestamp.getTime() <= sevenDaysMs);
  }

  private createEntry(daysAgo: number, hour: number, user: string, action: string, page: string): AuditLogEntry {
    const timestamp = new Date();
    timestamp.setHours(0, 0, 0, 0);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(hour, 12, 0, 0);

    return { timestamp, user, action, page };
  }
}
