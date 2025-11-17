import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { GetBiddingDataCustomerDto } from '../../../../core/services/api.types';

interface HistoryCustomerColumn {
  key: keyof GetBiddingDataCustomerDto;
  label: string;
}

export interface HistoryCustomerDialogData {
  customerName: string;
  period: string;
  entries: GetBiddingDataCustomerDto[];
}

@Component({
  selector: 'app-history-customer-dialog',
  templateUrl: './history-customer-dialog.component.html',
  styleUrls: ['./history-customer-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HistoryCustomerDialogComponent {
  readonly columns: HistoryCustomerColumn[] = [
    { key: 'product', label: 'Product' },
    { key: 'status', label: 'Status' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'bidVolume', label: 'Bid Volume' },
    { key: 'bidPrice', label: 'Bid Price' },
    { key: 'finalAwardedVolume', label: 'Final Awarded Volume' },
    { key: 'takenVolume', label: 'Taken Volume' },
    { key: 'additionalVolume', label: 'Additional Volume' },
    { key: 'rollingLiftFactor', label: 'RLF' },
    { key: 'comments', label: 'Comments' },
  ];

  readonly displayedColumns = this.columns.map((column) => column.key);

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: HistoryCustomerDialogData) {}

  valueFor(entry: GetBiddingDataCustomerDto, key: HistoryCustomerColumn['key']): string {
    const value = entry[key];

    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  }
}
