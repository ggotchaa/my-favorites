import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AribaProposalDto } from '../../../../core/services/api.types';

export interface ViewProposalsDialogData {
  period: string;
  proposals: AribaProposalDto[];
}

interface ProposalColumn {
  key: keyof AribaProposalDto | 'index';
  label: string;
}

@Component({
  selector: 'app-view-proposals-dialog',
  templateUrl: './view-proposals-dialog.component.html',
  styleUrls: ['./view-proposals-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ViewProposalsDialogComponent {
  readonly columns: ProposalColumn[] = [
    { key: 'index', label: '#' },
    { key: 'name', label: 'Bidder' },
    { key: 'product', label: 'Product' },
    { key: 'propaneVolumeTonnes', label: 'Propane Volume (T)' },
    { key: 'propaneTenderPrice', label: 'Propane Tender Price' },
    { key: 'butaneVolumeTonnes', label: 'Butane Volume (T)' },
    { key: 'butaneTenderPrice', label: 'Butane Tender Price' },
    { key: 'minEntryPrice', label: 'Min Entry Price' },
    { key: 'ansiButaneQuotation', label: 'ANSI Butane Quotation' },
  ];

  readonly displayedColumnKeys: ProposalColumn['key'][] = this.columns.map((column) => column.key);

  additionalInformation = '';

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: ViewProposalsDialogData) {}

  valueFor(proposal: AribaProposalDto, key: ProposalColumn['key'], index: number): string {
    if (key === 'index') {
      return String(index + 1);
    }

    const value = proposal[key];

    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  }
}
