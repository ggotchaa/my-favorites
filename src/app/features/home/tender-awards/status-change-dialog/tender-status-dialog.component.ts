import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface TenderStatusDialogData {
  currentStatus: string;
  statusOptions: string[];
}

export interface TenderStatusDialogResult {
  newStatus: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

@Component({
  selector: 'app-tender-status-dialog',
  templateUrl: './tender-status-dialog.component.html',
  styleUrls: ['./tender-status-dialog.component.scss'],
  standalone: false,
})
export class TenderStatusDialogComponent {
  newStatus: string;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<TenderStatusDialogComponent, TenderStatusDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: TenderStatusDialogData
  ) {
    const normalizedCurrent = data.currentStatus?.toLowerCase() ?? '';
    const matchingStatus = data.statusOptions.find(
      (status) => status.toLowerCase() === normalizedCurrent
    );

    this.newStatus = matchingStatus ?? data.statusOptions[0] ?? '';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close({
      newStatus: this.newStatus,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    });
  }
}