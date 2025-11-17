import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BiddingReportSummaryDto } from '../../../../core/services/api.types';

export interface TenderCommentsDialogData {
  reportName: string;
  summaries: BiddingReportSummaryDto[];
}

@Component({
  selector: 'app-tender-comments-dialog',
  templateUrl: './tender-comments-dialog.component.html',
  styleUrls: ['./tender-comments-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TenderCommentsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: TenderCommentsDialogData) {}

  trackSummary(index: number, summary: BiddingReportSummaryDto): string {
    const caption = summary.caption ?? 'summary';
    const value = summary.value ?? '';
    return `${caption}-${value}-${index}`;
  }
}
