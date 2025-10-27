import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ReportApproversDto, SetApproversDto } from '../../../../core/services/api.types';

interface ApprovalRecipient {
  userId: string;
  name: string;
  isEndorser: boolean;
  delegateName: string | null;
  delegateUserId: string | null;
  selected: boolean;
}

export interface SendForApprovalDialogData {
  approvers: ReportApproversDto[];
}

export interface SendForApprovalDialogResult {
  approvers: SetApproversDto[];
}

@Component({
  selector: 'app-send-for-approval-dialog',
  templateUrl: './send-for-approval-dialog.component.html',
  styleUrls: ['./send-for-approval-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SendForApprovalDialogComponent {
  readonly recipients: ApprovalRecipient[];

  constructor(
    private readonly dialogRef: MatDialogRef<SendForApprovalDialogComponent, SendForApprovalDialogResult | undefined>,
    @Inject(MAT_DIALOG_DATA) data: SendForApprovalDialogData
  ) {
    this.recipients = (data.approvers ?? [])
      .filter((approver): approver is ReportApproversDto & { userId: string } =>
        typeof approver.userId === 'string' && approver.userId.length > 0
      )
      .map((approver) => ({
        userId: approver.userId,
        name: approver.name ?? 'Unknown approver',
        isEndorser: approver.isEndorser ?? false,
        delegateName: approver.delegateName ?? null,
        delegateUserId: approver.delegateUserId ?? null,
        selected: true,
      }));
  }

  get allSelected(): boolean {
    return this.recipients.every((recipient) => recipient.selected);
  }

  get hasSelection(): boolean {
    return this.recipients.some((recipient) => recipient.selected);
  }

  toggleAll(checked: boolean): void {
    this.recipients.forEach((recipient) => (recipient.selected = checked));
  }

  toggleRecipient(recipient: ApprovalRecipient, checked: boolean): void {
    recipient.selected = checked;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  send(): void {
    if (!this.hasSelection) {
      this.dialogRef.close();
      return;
    }

    const approvers: SetApproversDto[] = this.recipients
      .filter((recipient) => recipient.selected)
      .map((recipient) => ({
        userId: recipient.userId,
        isEndorser: recipient.isEndorser,
        delegateUserId: recipient.delegateUserId ?? null,
      }));

    this.dialogRef.close({ approvers });
  }
}
