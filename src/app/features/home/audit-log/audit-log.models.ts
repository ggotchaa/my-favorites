import { AuditLogDto, AuditLogChangeDto } from '../../../core/services/api.types';

export interface AuditLogFilters {
  searchValue: string;
  logDateFrom: Date | null;
  logDateTo: Date | null;
}

export interface AuditLogRow extends AuditLogDto {
  isExpanded?: boolean;
}

export interface AuditLogColumn {
  key: keyof AuditLogRow | 'changedFields';
  label: string;
  sortable?: boolean;
  sortField?: string;
  width?: string;
}

export type { AuditLogChangeDto };
