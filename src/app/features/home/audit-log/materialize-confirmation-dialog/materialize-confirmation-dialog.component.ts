import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-materialize-confirmation-dialog',
  templateUrl: './materialize-confirmation-dialog.component.html',
  styleUrls: ['./materialize-confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MaterializeConfirmationDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<MaterializeConfirmationDialogComponent, boolean>
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
