// DOA available only if "endorser" is checked
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

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
  tempId: number;
  availableApproverOptions: ApproverOption[];
  availableDelegateOptions: ApproverOption[];
}

type ApproverOption = ApproversDto & { objectId: string };

export interface ManageApproversDialogData {
  reportId: number;
  approvers?: ReportApproversDto[] | null;
  isExceptionReport?: boolean;
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
export class ManageApproversDialogComponent implements OnInit {
  entries: ApproverEntry[] = [];
  isSaving = false;

  isLoadingOptions = false;
  loadOptionsError = false;
  allApproverOptions: ApproverOption[] = [];
  availableApproverOptions: ApproverOption[] = [];
  baseDelegateOptions: ApproverOption[] = [];
  private optionsLoaded = false;
  private tempIdCounter = 0;
  private readonly initialApprovers: ReportApproversDto[];

  constructor(
    private readonly dialogRef: MatDialogRef<
      ManageApproversDialogComponent,
      ManageApproversDialogResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) private readonly data: ManageApproversDialogData,
    private readonly apiEndpoints: ApiEndpointService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.initialApprovers = this.sanitizeInitialApprovers(data?.approvers);
  }

  ngOnInit(): void {
    this.entries = this.initialApprovers
      .filter((approver): approver is ReportApproversDto & { userId: string } =>
        !!approver &&
        typeof approver === 'object' &&
        typeof approver.userId === 'string' &&
        approver.userId.length > 0
      )
      .map((approver) => ({
        userId: approver.userId,
        name: approver.name ?? 'Unknown approver',
        isEndorser: approver.isEndorser ?? false,
        delegateUserId: approver.delegateUserId ?? null,
        delegateName: approver.delegateName ?? null,
        tempId: this.generateTempId(),
        availableApproverOptions: [],
        availableDelegateOptions: [],
      }));

    this.refreshApproverOptions();
    this.refreshDelegateOptions();
    this.loadApproverOptions();
    this.cdr.markForCheck();
  }

  get hasEntries(): boolean {
    return this.entries.length > 0;
  }

  get disableSave(): boolean {
    return (
      this.isSaving ||
      !this.entries.length ||
      this.entries.some((entry) => !entry.userId) ||
      this.isLoadingOptions
    );
  }

  removeEntry(entry: ApproverEntry): void {
    this.entries = this.entries.filter((existing) => existing !== entry);
    this.refreshApproverOptions();
    this.refreshDelegateOptions();
    this.cdr.markForCheck();
  }

  toggleEndorser(entry: ApproverEntry, checked: boolean): void {
    entry.isEndorser = checked;
    if (!checked) {
      entry.delegateUserId = null;
      entry.delegateName = null;
    }
    this.entries = [...this.entries];
    this.refreshDelegateOptions();
    this.cdr.markForCheck();
  }

  updateDelegate(entry: ApproverEntry, delegateId: string | null): void {
    entry.delegateUserId = delegateId ?? null;

    if (delegateId) {
      const delegate = this.findDelegateOption(delegateId, entry);
      entry.delegateName = delegate?.displayName ?? null;
    } else {
      entry.delegateName = null;
    }

    this.entries = [...this.entries];
    this.refreshDelegateOptions();
    this.cdr.markForCheck();
  }

  addSigner(): void {
    if (!this.optionsLoaded && !this.isLoadingOptions) {
      this.loadApproverOptions();
    }

    this.entries = [
      ...this.entries,
      {
        userId: '',
        name: '',
        isEndorser: false,
        delegateUserId: null,
        delegateName: null,
        tempId: this.generateTempId(),
        availableApproverOptions: [],
        availableDelegateOptions: [],
      },
    ];

    this.refreshApproverOptions();
    this.refreshDelegateOptions();
    this.cdr.markForCheck();
  }

  updateApprover(entry: ApproverEntry, approverId: string | null): void {
    entry.userId = approverId ?? '';

    if (approverId) {
      const approver = this.allApproverOptions.find((option) => option.objectId === approverId);
      entry.name = approver?.displayName ?? approverId;
    } else {
      entry.name = '';
    }

    this.entries = [...this.entries];
    this.refreshApproverOptions();
    this.refreshDelegateOptions();
    this.cdr.markForCheck();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.disableSave) {
      return;
    }

    const validEntries = this.entries.filter((entry) => entry.userId);

    const payload: SetApproversDto[] = validEntries.map((entry) => ({
      userId: entry.userId,
      isEndorser: entry.isEndorser,
      delegateUserId: entry.delegateUserId,
    }));

    this.isSaving = true;

    this.apiEndpoints
      .setReportApprovers(this.data.reportId, payload, {
        isExceptionReport: this.data.isExceptionReport,
      })
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

  trackByUserId(index: number, entry: ApproverEntry): string | number {
    return entry.userId || entry.tempId || index;
  }

  private loadApproverOptions(): void {
    if (this.isLoadingOptions) {
      return;
    }

    this.isLoadingOptions = true;
    this.loadOptionsError = false;
    this.cdr.markForCheck();

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
          const approverOptions = (approvers ?? []).filter(
            (option): option is ApproverOption =>
              typeof option.objectId === 'string' && option.objectId.length > 0
          );

          const delegateOptions = (delegates ?? []).filter(
            (option): option is ApproverOption =>
              typeof option.objectId === 'string' && option.objectId.length > 0
          );

          this.allApproverOptions = this.mergeApproverOptions(approverOptions);
          this.baseDelegateOptions = delegateOptions;
          this.optionsLoaded = true;
          this.refreshApproverOptions();
          this.refreshDelegateOptions();
          this.cdr.markForCheck();
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load approver and delegate groups', error);
          this.allApproverOptions = [];
          this.baseDelegateOptions = [];
          this.loadOptionsError = true;
          this.refreshApproverOptions();
          this.refreshDelegateOptions();
          this.cdr.markForCheck();
        },
      });
  }

  private findDelegateOption(
    delegateId: string,
    entry: ApproverEntry
  ): ApproverOption | undefined {
    const candidatePools = [entry.availableDelegateOptions, this.baseDelegateOptions];

    for (const pool of candidatePools) {
      const match = pool.find((option) => option.objectId === delegateId);
      if (match) {
        return match;
      }
    }

    return undefined;
  }

  private mergeApproverOptions(options: ApproverOption[]): ApproverOption[] {
    const approvers = new Map<string, ApproverOption>();

    options.forEach((option) => {
      if (typeof option.objectId === 'string') {
        approvers.set(option.objectId, option as ApproverOption);
      }
    });

    this.entries.forEach((entry) => {
      if (entry.userId && !approvers.has(entry.userId)) {
        approvers.set(entry.userId, {
          objectId: entry.userId,
          displayName: entry.name || entry.userId,
        } as ApproverOption);
      }
    });

    return Array.from(approvers.values());
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

  private generateTempId(): number {
    this.tempIdCounter += 1;
    return this.tempIdCounter;
  }

  private sanitizeInitialApprovers(
    rawApprovers: ManageApproversDialogData['approvers']
  ): ReportApproversDto[] {
    if (!Array.isArray(rawApprovers)) {
      return [];
    }

    return rawApprovers
      .filter(
        (approver): approver is ReportApproversDto =>
          !!approver && typeof approver === 'object' && !Array.isArray(approver)
      )
      .map((approver) => ({ ...approver }));
  }

  private refreshApproverOptions(): void {
    const entries = this.entries;

    const selectionCounts = new Map<string, number>();
    entries.forEach((entry) => {
      if (entry.userId) {
        selectionCounts.set(
          entry.userId,
          (selectionCounts.get(entry.userId) ?? 0) + 1
        );
      }
    });

    const updatedEntries = entries.map((entry) => {
      const options = this.allApproverOptions.filter((option) => {
        if (option.objectId === entry.userId) {
          return true;
        }

        return (selectionCounts.get(option.objectId) ?? 0) === 0;
      });

      if (
        entry.userId &&
        !options.some((option) => option.objectId === entry.userId)
      ) {
        options.push({
          objectId: entry.userId,
          displayName: entry.name || entry.userId,
        } as ApproverOption);
      }

      return {
        ...entry,
        availableApproverOptions: options,
      };
    });

    this.availableApproverOptions = this.allApproverOptions.filter(
      (option) => (selectionCounts.get(option.objectId) ?? 0) === 0
    );

    this.entries = updatedEntries;
  }

  private refreshDelegateOptions(): void {
    const selectionCounts = new Map<string, number>();

    this.entries.forEach((entry) => {
      if (entry.delegateUserId) {
        selectionCounts.set(
          entry.delegateUserId,
          (selectionCounts.get(entry.delegateUserId) ?? 0) + 1
        );
      }
    });

    const mergedOptions = this.mergeDelegateOptions(this.baseDelegateOptions);

    this.entries = this.entries.map((entry) => {
      const options = mergedOptions.filter((option) => {
        if (option.objectId === entry.delegateUserId) {
          return true;
        }

        return (selectionCounts.get(option.objectId) ?? 0) === 0;
      });

      if (
        entry.delegateUserId &&
        !options.some((option) => option.objectId === entry.delegateUserId)
      ) {
        options.push({
          objectId: entry.delegateUserId,
          displayName: entry.delegateName ?? entry.delegateUserId,
        });
      }

      return {
        ...entry,
        availableDelegateOptions: options,
      };
    });
  }
}
