export const enum FilterOperatorValue {
  Equals = 0,
  Contains = 1,
  In = 6,
  Between = 8,
}

export const enum SortDirectionValue {
  Asc = 0,
  Desc = 1,
}

export interface PaginationState {
  pageNumber: number;
  pageSize: number;
}

export interface SortState {
  field: string | null;
  direction: SortDirectionValue | null;
}
