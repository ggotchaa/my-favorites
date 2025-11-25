import { AuditLogColumn } from './audit-log.models';

export const AUDIT_LOG_COLUMNS: AuditLogColumn[] = [
  { key: 'tableName', label: 'Table', sortable: true, sortField: 'tableName', width: '20%' },
  { key: 'actionType', label: 'Action', sortable: true, sortField: 'actionType', width: '10%' },
  { key: 'changedBy', label: 'User', sortable: true, sortField: 'changedBy', width: '20%' },
  { key: 'changedAt', label: 'Date', sortable: true, sortField: 'changedAt', width: '15%' },
  { key: 'changeMethod', label: 'Change Method', sortable: true, sortField: 'changeMethod', width: '10%' },
  { key: 'changedFields', label: 'Changed Fields', sortable: false, width: '10%' },
];

export const DEFAULT_PAGE_SIZE = 25;
export const DEBOUNCE_TIME = 400;
