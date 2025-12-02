import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BiddingReportSummaryDto } from '../../../../core/services/api.types';

export interface TenderCommentsDialogData {
  reportName: string;
  summaries: BiddingReportSummaryDto[];
}

export interface TenderCommentsDialogResult {
  additionalInformation?: string;
}

@Component({
  selector: 'app-tender-comments-dialog',
  templateUrl: './tender-comments-dialog.component.html',
  styleUrls: ['./tender-comments-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TenderCommentsDialogComponent {
  additionalInformation = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: TenderCommentsDialogData,
    private readonly dialogRef: MatDialogRef<
      TenderCommentsDialogComponent,
      TenderCommentsDialogResult | null
    >
  ) {}

  trackSummary(index: number, summary: BiddingReportSummaryDto): string {
    const caption = summary.caption ?? 'summary';
    const value = summary.value ?? '';
    return `${caption}-${value}-${index}`;
  }

  submitAdditionalInformation(): void {
    const trimmed = this.additionalInformation.trim();

    if (!trimmed) {
      this.dialogRef.close(null);
      return;
    }

    this.dialogRef.close({ additionalInformation: trimmed });
  }
}
