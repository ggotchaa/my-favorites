import { CustomerListRow, CustomerListColumn, ProductSegment } from './customer-list.models';
import { SortState } from '../../../shared/utils/query-models';
import { SortDirectionValue } from '../../../shared/utils/query-models';

export class CustomerListUtils {
  static getCellTooltip(row: CustomerListRow, key: keyof CustomerListRow): string {
    const value = row[key];
    if (key === 'comments' && typeof value === 'string' && value.length > 50) {
      return value;
    }
    return '';
  }

  static getSortIcon(column: CustomerListColumn, currentSort: SortState): string {
    if (!column.sortable || !column.sortField || currentSort.field !== column.sortField) {
      return 'unfold_more';
    }
    return 'keyboard_arrow_up';
  }

  static getSortClass(column: CustomerListColumn, currentSort: SortState): string {
    if (!column.sortable || !column.sortField || currentSort.field !== column.sortField) {
      return '';
    }
    if (currentSort.direction === SortDirectionValue.Asc) return 'sort-active sort-asc';
    if (currentSort.direction === SortDirectionValue.Desc) return 'sort-active sort-desc';
    return '';
  }

  static getAriaSort(column: CustomerListColumn, currentSort: SortState): 'none' | 'ascending' | 'descending' {
    if (!column.sortable || !column.sortField || currentSort.field !== column.sortField) {
      return 'none';
    }
    if (currentSort.direction === SortDirectionValue.Asc) return 'ascending';
    if (currentSort.direction === SortDirectionValue.Desc) return 'descending';
    return 'none';
  }

  static getProductSegmentFilterValue(segment: ProductSegment): string {
    if (segment === 'propane') return 'Propane';
    if (segment === 'butane') return 'Butane';
    return '';
  }

  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = globalThis.document.createElement('a');
    link.href = url;
    link.download = filename;
    globalThis.document.body.appendChild(link);
    link.click();
    globalThis.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static generateExportFilename(): string {
    return `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
  }
}
