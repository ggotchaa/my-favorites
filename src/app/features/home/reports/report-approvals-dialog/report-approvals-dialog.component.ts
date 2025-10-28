import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ReportApprovalsDialogData {
  reportName: string;
  approvers: string[];
}

@Component({
  selector: 'app-report-approvals-dialog',
  templateUrl: './report-approvals-dialog.component.html',
  styleUrls: ['./report-approvals-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportApprovalsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ReportApprovalsDialogData) {}
}
