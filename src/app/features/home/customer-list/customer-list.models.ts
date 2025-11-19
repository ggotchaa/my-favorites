export interface CustomerListFilters {
  multipleCustomers: string[];
  status: string[];
  month: string[];
  year: (string | number)[];
  rangeFrom: string;
  rangeTo: string;
  bidderSearch: string;
}

export type ProductSegment = 'all' | 'propane' | 'butane';

export interface CustomerListRow {
  bidder: string;
  product: string;
  status: string;
  month: string;
  year: number | null;
  bidVolume: number | null;
  bidPrice: number | null;
  finalAwardedVolume: number | null;
  volumeTaken: number | null;
  additionalVolume: number | null;
  rollingLiftFactor: number | null;
  comments: string;
}

export interface CustomerListColumn {
  key: keyof CustomerListRow;
  label: string;
  sortable?: boolean;
  sortField?: string;
  width?: string;
}
