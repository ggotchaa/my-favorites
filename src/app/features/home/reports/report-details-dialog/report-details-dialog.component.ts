import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BiddingReport } from '../bidding-report.interface';

@Component({
  selector: 'app-report-details-dialog',
  templateUrl: './report-details-dialog.component.html',
  styleUrls: ['./report-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportDetailsDialogComponent {
  private static readonly MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ] as const;

  constructor(@Inject(MAT_DIALOG_DATA) public readonly report: BiddingReport) {}

  get formattedReportDate(): string {
    return this.report.reportDate ? new Date(this.report.reportDate).toLocaleDateString() : '';
  }

  get monthLabel(): string {
    const monthNumber = Number(this.report.reportMonth);
    if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return this.report.reportMonth;
    }

    return ReportDetailsDialogComponent.MONTH_NAMES[monthNumber - 1] ?? this.report.reportMonth;
  }
}
