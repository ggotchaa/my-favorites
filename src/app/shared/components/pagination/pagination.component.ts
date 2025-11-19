import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalCount: number | null;
  totalPages?: number | null;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface PaginationEvent {
  pageNumber: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PaginationComponent {
  @Input() paginationInfo: PaginationInfo | null = null;
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<PaginationEvent>();

  readonly pageSizeOptions = [10, 25, 50, 100];

  get currentPage(): number {
    return this.paginationInfo?.pageNumber ?? 1;
  }

  get currentPageSize(): number {
    return this.paginationInfo?.pageSize ?? 25;
  }

  get totalItems(): number {
    return this.paginationInfo?.totalCount ?? 0;
  }

  get totalPages(): number {
    if (this.paginationInfo?.totalPages) {
      return this.paginationInfo.totalPages;
    }

    if (this.paginationInfo?.totalCount && this.paginationInfo?.pageSize) {
      return Math.ceil(
        this.paginationInfo.totalCount / this.paginationInfo.pageSize
      );
    }

    return 1;
  }

  get canGoPrevious(): boolean {
    return (
      !this.disabled &&
      (this.paginationInfo?.hasPrevious ?? this.currentPage > 1)
    );
  }

  get canGoNext(): boolean {
    return (
      !this.disabled &&
      (this.paginationInfo?.hasNext ?? this.currentPage < this.totalPages)
    );
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.currentPageSize + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.currentPageSize;
    return Math.min(end, this.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const rangeStart = Math.max(1, current - delta);
    const rangeEnd = Math.min(total, current + delta);

    const pages: number[] = [];

    if (rangeStart > 1) {
      pages.push(1);
      if (rangeStart > 2) {
        pages.push(-1);
      }
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < total) {
      if (rangeEnd < total - 1) {
        pages.push(-1);
      }
      pages.push(total);
    }

    return pages;
  }

  goToFirstPage(): void {
    if (this.canGoPrevious && this.currentPage !== 1) {
      this.changePage(1);
    }
  }

  goToPreviousPage(): void {
    if (this.canGoPrevious) {
      this.changePage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.canGoNext) {
      this.changePage(this.currentPage + 1);
    }
  }

  goToLastPage(): void {
    if (this.canGoNext && this.currentPage !== this.totalPages) {
      this.changePage(this.totalPages);
    }
  }

  goToPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.totalPages &&
      page !== this.currentPage &&
      !this.disabled
    ) {
      this.changePage(page);
    }
  }

  changePageSize(pageSize: number): void {
    if (pageSize !== this.currentPageSize && !this.disabled) {
      this.pageChange.emit({ pageNumber: 1, pageSize });
    }
  }

  private changePage(pageNumber: number): void {
    this.pageChange.emit({ pageNumber, pageSize: this.currentPageSize });
  }
}
