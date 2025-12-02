import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SendForApprovalDialogResult {
  comment: string | null;
}

export interface SendForApprovalDialogData {
  title?: string;
  description?: string;
  confirmLabel?: string;
  requireComment?: boolean;
}

@Component({
  selector: 'app-send-for-approval-dialog',
  templateUrl: './send-for-approval-dialog.component.html',
  styleUrls: ['./send-for-approval-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SendForApprovalDialogComponent {
  comment = '';
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly requireComment: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: SendForApprovalDialogData | null,
    private readonly dialogRef: MatDialogRef<SendForApprovalDialogComponent, SendForApprovalDialogResult | undefined>
  ) {
    this.title = data?.title ?? 'Send for Approval';
    this.description =
      data?.description ??
      'Provide a comment for the approvers before sending this report into the approval flow.';
    this.confirmLabel = data?.confirmLabel ?? 'Send for Approval';
    this.requireComment = data?.requireComment ?? true;
  }

  get isSubmitDisabled(): boolean {
    return this.requireComment && !this.comment.trim();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const normalizedComment = this.comment.trim();
    if (this.requireComment && !normalizedComment.length) {
      return;
    }
    this.dialogRef.close({ comment: normalizedComment.length ? normalizedComment : null });
  }
}
