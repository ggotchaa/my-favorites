import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { finalize, forkJoin, take } from 'rxjs';

import { ApiEndpointService } from '../../../../core/services/api.service';
import {
  ApproversDto,
  ReportApproversDto,
  SetApproversDto,
} from '../../../../core/services/api.types';

interface ApproverEntry {
  userId: string;
  name: string;
  isEndorser: boolean;
  delegateUserId: string | null;
  delegateName: string | null;
}

type ApproverOption = ApproversDto & { objectId: string };

export interface ManageBiddersDialogData {
  reportId: number;
  approvers: ReportApproversDto[];
}

export interface ManageBiddersDialogResult {
  updated: boolean;
}

@Component({
  selector: 'app-manage-bidders-dialog',
  templateUrl: './manage-bidders-dialog.component.html',
  styleUrls: ['./manage-bidders-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ManageBiddersDialogComponent {
  entries: ApproverEntry[] = [];
  isSaving = false;

  isAddingApprovers = false;
  isLoadingOptions = false;
  loadOptionsError = false;
  availableApproverOptions: ApproverOption[] = [];
  availableDelegateOptions: ApproverOption[] = [];
  selectedApproverIds = new Set<string>();
  selectedDelegateIds = new Set<string | null>();

  constructor(
    private readonly dialogRef: MatDialogRef<
      ManageBiddersDialogComponent,
      ManageBiddersDialogResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) private readonly data: ManageBiddersDialogData,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.entries = (data.approvers ?? [])
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

    this.availableDelegateOptions = this.mergeDelegateOptions([]);
  }

  get hasEntries(): boolean {
    return this.entries.length > 0;
  }

  get disableSave(): boolean {
    return this.isSaving || !this.entries.length;
  }

  get canConfirmSelection(): boolean {
    return (
      this.selectedApproverIds.size > 0 &&
      !this.isLoadingOptions &&
      !this.loadOptionsError
    );
  }

  startAddApprovers(): void {
    if (this.isAddingApprovers) {
      return;
    }

    this.isAddingApprovers = true;
    this.selectedApproverIds = new Set();
    this.selectedDelegateIds = new Set();

    this.cdr.markForCheck();

    this.loadApproverOptions();
  }

  cancelAddApprovers(): void {
    this.isAddingApprovers = false;
    this.selectedApproverIds = new Set();
    this.selectedDelegateIds = new Set();
    this.cdr.markForCheck();
  }

  handleApproverSelection(event: MatSelectionListChange): void {
    const selectedOptions = event.source.selectedOptions.selected;
    this.selectedApproverIds = new Set(
      selectedOptions
        .map((option) => option.value)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    );

    this.cdr.markForCheck();
  }

  handleDelegateSelection(event: MatSelectionListChange): void {
    const selectedOptions = event.source.selectedOptions.selected;
    const hasNoDelegate = selectedOptions.some((option) => option.value === null);

    if (hasNoDelegate) {
      this.selectedDelegateIds = new Set([null]);
    } else {
      this.selectedDelegateIds = new Set(
        selectedOptions
          .map((option) => option.value)
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
      );
    }

    this.cdr.markForCheck();
  }

  confirmAddApprovers(): void {
    if (!this.canConfirmSelection) {
      return;
    }

    const delegateOptions = this.availableDelegateOptions.filter((option) =>
      this.selectedDelegateIds.has(option.objectId)
    );
    const useNoDelegate = this.selectedDelegateIds.has(null);

    const newEntries: ApproverEntry[] = this.availableApproverOptions
      .filter((option) => this.selectedApproverIds.has(option.objectId))
      .map((option, index) => {
        const delegate = !useNoDelegate && delegateOptions.length
          ? delegateOptions[Math.min(index, delegateOptions.length - 1)]
          : null;

        return {
          userId: option.objectId,
          name: option.displayName ?? option.objectId,
          isEndorser: true,
          delegateUserId: delegate?.objectId ?? null,
          delegateName: delegate?.displayName ?? null,
        };
      });

    this.entries = [...this.entries, ...newEntries];
    this.availableDelegateOptions = this.mergeDelegateOptions(this.availableDelegateOptions);
    this.cancelAddApprovers();
  }

  removeEntry(entry: ApproverEntry): void {
    this.entries = this.entries.filter((existing) => existing.userId !== entry.userId);
    this.cdr.markForCheck();
  }

  toggleEndorser(entry: ApproverEntry, checked: boolean): void {
    entry.isEndorser = checked;
    this.entries = [...this.entries];
    this.cdr.markForCheck();
  }

  updateDelegate(entry: ApproverEntry, delegateId: string | null): void {
    entry.delegateUserId = delegateId ?? null;

    if (delegateId) {
      const delegate = this.availableDelegateOptions.find((option) => option.objectId === delegateId);
      entry.delegateName = delegate?.displayName ?? null;
    } else {
      entry.delegateName = null;
    }

    this.entries = [...this.entries];
    this.cdr.markForCheck();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.disableSave) {
      return;
    }

    const payload: SetApproversDto[] = this.entries.map((entry) => ({
      userId: entry.userId,
      isEndorser: entry.isEndorser,
      delegateUserId: entry.delegateUserId,
    }));

    this.isSaving = true;

    this.apiEndpoints
      .setReportApprovers(this.data.reportId, payload)
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
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

  trackByUserId(_: number, entry: ApproverEntry): string {
    return entry.userId;
  }

  private loadApproverOptions(): void {
    this.isLoadingOptions = true;
    this.loadOptionsError = false;
    this.cdr.markForCheck();

    const excludeIds = new Set(this.entries.map((entry) => entry.userId));

    forkJoin({
      approvers: this.apiEndpoints.getApproverGroups().pipe(take(1)),
      delegates: this.apiEndpoints.getDelegateGroups().pipe(take(1)),
    })
      .pipe(
        finalize(() => {
          this.isLoadingOptions = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ approvers, delegates }) => {
          this.availableApproverOptions = (approvers ?? []).filter(
            (option): option is ApproverOption =>
              typeof option.objectId === 'string' &&
              option.objectId.length > 0 &&
              !excludeIds.has(option.objectId)
          );

          const delegateOptions = (delegates ?? []).filter(
            (option): option is ApproverOption =>
              typeof option.objectId === 'string' && option.objectId.length > 0
          );

          this.availableDelegateOptions = this.mergeDelegateOptions(delegateOptions);
          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load approver and delegate groups', error);
          this.availableApproverOptions = [];
          this.availableDelegateOptions = this.mergeDelegateOptions([]);
          this.loadOptionsError = true;
          this.cdr.markForCheck();
        },
      });
  }

  private mergeDelegateOptions(options: ApproverOption[]): ApproverOption[] {
    const delegates = new Map<string, ApproverOption>();

    options.forEach((option) => {
      if (typeof option.objectId === 'string') {
        delegates.set(option.objectId, option as ApproverOption);
      }
    });

    this.entries.forEach((entry) => {
      if (entry.delegateUserId && !delegates.has(entry.delegateUserId)) {
        delegates.set(entry.delegateUserId, {
          objectId: entry.delegateUserId,
          displayName: entry.delegateName ?? entry.delegateUserId,
        });
      }
    });

    return Array.from(delegates.values());
  }
}
