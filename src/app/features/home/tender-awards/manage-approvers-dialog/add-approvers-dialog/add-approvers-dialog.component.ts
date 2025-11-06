import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize, forkJoin, take } from 'rxjs';

import { ApiEndpointService } from '../../../../../core/services/api.service';
import { ApproversDto } from '../../../../../core/services/api.types';

export interface AddApproversDialogData {
  excludeApproverIds?: string[];
}

export interface AddApproversDialogResult {
  approvers: ApproversDto[];
  delegate: ApproversDto | null;
}

@Component({
  selector: 'app-add-approvers-dialog',
  templateUrl: './add-approvers-dialog.component.html',
  styleUrls: ['./add-approvers-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AddApproversDialogComponent implements OnInit {
  approverOptions: ApproversDto[] = [];
  delegateOptions: ApproversDto[] = [];
  selectedApproverIds = new Set<string>();
  selectedDelegateId: string | null = null;
  isLoading = false;
  loadError = false;

  private readonly excludedIds: Set<string>;

  constructor(
    private readonly dialogRef: MatDialogRef<AddApproversDialogComponent, AddApproversDialogResult | undefined>,
    @Inject(MAT_DIALOG_DATA) data: AddApproversDialogData,
    private readonly apiEndpoints: ApiEndpointService
  ) {
    this.excludedIds = new Set((data.excludeApproverIds ?? []).filter((id): id is string => typeof id === 'string'));
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = false;

    forkJoin({
      approvers: this.apiEndpoints.getApproverGroups().pipe(take(1)),
      delegates: this.apiEndpoints.getDelegateGroups().pipe(take(1)),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: ({ approvers, delegates }) => {
          this.approverOptions = (approvers ?? []).filter(
            (option): option is ApproversDto & { objectId: string } =>
              typeof option.objectId === 'string' && option.objectId.length > 0 && !this.excludedIds.has(option.objectId)
          );

          this.delegateOptions = (delegates ?? []).filter(
            (option): option is ApproversDto & { objectId: string } =>
              typeof option.objectId === 'string' && option.objectId.length > 0
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load approver groups', error);
          this.approverOptions = [];
          this.delegateOptions = [];
          this.loadError = true;
        },
      });
  }

  get hasSelection(): boolean {
    return this.selectedApproverIds.size > 0;
  }

  toggleApprover(option: ApproversDto & { objectId: string }, checked: boolean): void {
    if (checked) {
      this.selectedApproverIds.add(option.objectId);
    } else {
      this.selectedApproverIds.delete(option.objectId);
    }
  }

  selectDelegate(delegateId: string | null): void {
    this.selectedDelegateId = delegateId;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (!this.hasSelection) {
      this.dialogRef.close();
      return;
    }

    const selectedApprovers = this.approverOptions.filter((option) =>
      this.selectedApproverIds.has(option.objectId)
    );

    const delegate = this.delegateOptions.find((option) => option.objectId === this.selectedDelegateId) ?? null;

    this.dialogRef.close({ approvers: selectedApprovers, delegate: delegate ?? null });
  }
}
