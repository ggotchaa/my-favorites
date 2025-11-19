import { CustomerListColumn } from './customer-list.models';

export const CUSTOMER_LIST_COLUMNS: CustomerListColumn[] = [
  {
    key: 'bidder',
    label: 'Bidder',
    sortable: true,
    sortField: 'Bidder',
    width: 'clamp(150px, 15vw, 280px)',
  },
  {
    key: 'product',
    label: 'Product',
    sortable: true,
    sortField: 'Product',
    width: 'clamp(120px, 6vw, 160px)',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    sortField: 'Status',
    width: 'clamp(120px, 6vw, 160px)',
  },
  {
    key: 'month',
    label: 'Month',
    sortable: true,
    sortField: 'Month',
    width: 'clamp(120px, 6vw, 160px)',
  },
  {
    key: 'year',
    label: 'Year',
    sortable: true,
    sortField: 'Year',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'bidVolume',
    label: 'Bid Volume',
    sortable: true,
    sortField: 'BidVolume',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'bidPrice',
    label: 'Bid Price',
    sortable: true,
    sortField: 'BidPrice',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'finalAwardedVolume',
    label: 'Final Awarded Volume',
    sortable: true,
    sortField: 'FinalAwardedVolume',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'volumeTaken',
    label: 'Volume Taken',
    sortable: true,
    sortField: 'TakenVolume',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'additionalVolume',
    label: 'Add. Volume',
    sortable: true,
    sortField: 'AdditionalVolume',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'rollingLiftFactor',
    label: 'Rolling Lift Factor',
    sortable: true,
    sortField: 'RollingLiftFactor',
    width: 'clamp(100px, 6vw, 140px)',
  },
  {
    key: 'comments',
    label: 'Comments',
    sortable: false,
    width: 'clamp(150px, 15vw, 280px)',
  },
];

export const DEFAULT_PAGE_SIZE = 25;
