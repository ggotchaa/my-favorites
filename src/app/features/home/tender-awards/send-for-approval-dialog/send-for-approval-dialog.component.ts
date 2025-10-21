import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

interface ApprovalRecipient {
  id: number;
  name: string;
  role: string;
  selected: boolean;
}

@Component({
  selector: 'app-send-for-approval-dialog',
  templateUrl: './send-for-approval-dialog.component.html',
  styleUrls: ['./send-for-approval-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SendForApprovalDialogComponent {
  readonly recipients: ApprovalRecipient[] = [
    { id: 1, name: 'Andrea Martinez', role: 'Senior Approver', selected: true },
    { id: 2, name: 'Michael Chen', role: 'Commercial Manager', selected: true },
    { id: 3, name: 'Priya Nair', role: 'Finance Lead', selected: false },
    { id: 4, name: 'Liam O’Connor', role: 'Operations Lead', selected: false },
    { id: 5, name: 'Sofia Rossi', role: 'Risk & Compliance', selected: false },
  ];

  constructor(private readonly dialogRef: MatDialogRef<SendForApprovalDialogComponent>) {}

  get allSelected(): boolean {
    return this.recipients.every((recipient) => recipient.selected);
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
    const selectedRecipients = this.recipients.filter((recipient) => recipient.selected);
    this.dialogRef.close({ selectedRecipients });
  }
}
