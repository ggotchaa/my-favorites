import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize, take } from 'rxjs';

import { ApiEndpointService } from '../../../../core/services/api.service';
import {
  ApproversDto,
  ReportApproversDto,
  SetApproversDto,
} from '../../../../core/services/api.types';
import {
  AddApproversDialogComponent,
  AddApproversDialogData,
  AddApproversDialogResult,
} from './add-approvers-dialog/add-approvers-dialog.component';

interface ApproverEntry {
  userId: string;
  name: string;
  isEndorser: boolean;
  delegateUserId: string | null;
  delegateName: string | null;
}

export interface ManageApproversDialogData {
  reportId: number;
  approvers: ReportApproversDto[];
}

export interface ManageApproversDialogResult {
  updated: boolean;
}

@Component({
  selector: 'app-manage-approvers-dialog',
  templateUrl: './manage-approvers-dialog.component.html',
  styleUrls: ['./manage-approvers-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ManageApproversDialogComponent {
  approvers: ApproverEntry[] = [];
  delegateOptions: ApproversDto[] = [];
  isSaving = false;
  isLoadingDelegates = false;

  constructor(
    private readonly dialogRef: MatDialogRef<
      ManageApproversDialogComponent,
      ManageApproversDialogResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) private readonly data: ManageApproversDialogData,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly dialog: MatDialog
  ) {
    this.approvers = (data.approvers ?? [])
      .filter((approver): approver is ReportApproversDto & { userId: string } =>
        typeof approver.userId === 'string' && approver.userId.length > 0
      )
      .map((approver) => ({
        userId: approver.userId,
        name: approver.name ?? 'Unknown approver',
        isEndorser: approver.isEndorser ?? false,
        delegateUserId: approver.delegateUserId ?? null,
        delegateName: approver.delegateName ?? null,
      }));

    this.loadDelegateOptions();
  }

  get hasApprovers(): boolean {
    return this.approvers.length > 0;
  }

  get disableSave(): boolean {
    return this.isSaving || !this.approvers.length;
  }

  private loadDelegateOptions(): void {
    this.isLoadingDelegates = true;

    this.apiEndpoints
      .getDelegateGroups()
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadingDelegates = false;
        })
      )
      .subscribe({
        next: (delegates) => {
          this.delegateOptions = (delegates ?? []).filter(
            (delegate): delegate is ApproversDto & { objectId: string } =>
              typeof delegate.objectId === 'string' && delegate.objectId.length > 0
          );
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load delegate groups', error);
          this.delegateOptions = [];
        },
      });
  }

  addApprovers(): void {
    const excludeIds = new Set(this.approvers.map((approver) => approver.userId));

    const dialogRef = this.dialog.open<
      AddApproversDialogComponent,
      AddApproversDialogData,
      AddApproversDialogResult
    >(AddApproversDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: {
        excludeApproverIds: Array.from(excludeIds),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || !Array.isArray(result.approvers) || result.approvers.length === 0) {
        return;
      }

      const delegateId = result.delegate?.objectId ?? null;
      const delegateName = result.delegate?.displayName ?? null;

      const newEntries: ApproverEntry[] = result.approvers
        .filter(
          (approver): approver is ApproversDto & { objectId: string } =>
            typeof approver.objectId === 'string' && approver.objectId.length > 0 && !excludeIds.has(approver.objectId)
        )
        .map((approver) => ({
          userId: approver.objectId!,
          name: approver.displayName ?? 'Unknown approver',
          isEndorser: true,
          delegateUserId: delegateId,
          delegateName,
        }));

      if (delegateId && !this.delegateOptions.some((option) => option.objectId === delegateId)) {
        this.delegateOptions = [
          ...this.delegateOptions,
          { objectId: delegateId, displayName: delegateName },
        ];
      }

      this.approvers = [...this.approvers, ...newEntries];
    });
  }

  removeApprover(entry: ApproverEntry): void {
    this.approvers = this.approvers.filter((approver) => approver.userId !== entry.userId);
  }

  toggleEndorser(entry: ApproverEntry, checked: boolean): void {
    entry.isEndorser = checked;
    this.approvers = [...this.approvers];
  }

  updateDelegate(entry: ApproverEntry, delegateId: string | null): void {
    entry.delegateUserId = delegateId ?? null;

    if (delegateId) {
      const delegate = this.delegateOptions.find((option) => option.objectId === delegateId);
      entry.delegateName = delegate?.displayName ?? null;
    } else {
      entry.delegateName = null;
    }

    this.approvers = [...this.approvers];
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.disableSave) {
      return;
    }

    const payload: SetApproversDto[] = this.approvers
      .filter((approver) => typeof approver.userId === 'string' && approver.userId.length > 0)
      .map((approver) => ({
        userId: approver.userId,
        isEndorser: approver.isEndorser,
        delegateUserId: approver.delegateUserId ?? null,
      }));

    this.isSaving = true;

    this.apiEndpoints
      .setReportApprovers(this.data.reportId, payload)
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => {
          this.dialogRef.close({ updated: true });
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to save approvers', error);
        },
      });
  }

  trackByUserId(_: number, approver: ApproverEntry): string {
    return approver.userId;
  }
}
