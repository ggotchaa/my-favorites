export interface SendForApprovalDialogResult {
  comment: string | null;
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

  constructor(
    private readonly dialogRef: MatDialogRef<SendForApprovalDialogComponent, SendForApprovalDialogResult | undefined>
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const normalizedComment = this.comment.trim();
    this.dialogRef.close({ comment: normalizedComment.length ? normalizedComment : null });
  }
}
