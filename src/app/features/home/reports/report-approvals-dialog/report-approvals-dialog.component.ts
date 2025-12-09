import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApprovalRecord, ApprovalAttempt, APPROVAL_ACTIONS, ApprovalAction } from './report-approvals.interface';

export interface ReportApprovalsDialogData {
  reportName: string;
  approvers: ApprovalRecord[];
}

@Component({
  selector: 'app-report-approvals-dialog',
  templateUrl: './report-approvals-dialog.component.html',
  styleUrls: ['./report-approvals-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportApprovalsDialogComponent {
  readonly data = inject<ReportApprovalsDialogData>(MAT_DIALOG_DATA);
  groupedApprovals: ApprovalAttempt[] = [];

  constructor() {
    this.groupApprovalsByAttempt();
  }

  private groupApprovalsByAttempt(): void {
    if (!this.data.approvers || this.data.approvers.length === 0) {
      return;
    }

    const grouped = this.data.approvers.reduce((acc, approval) => {
      if (!acc[approval.attempt]) {
        acc[approval.attempt] = [];
      }
      acc[approval.attempt].push(approval);
      return acc;
    }, {} as Record<number, ApprovalRecord[]>);

    this.groupedApprovals = Object.entries(grouped)
      .map(([attempt, approvals]) => ({
        attempt: Number(attempt),
        approvals,
        isExpanded: false,
      }))
      .sort((a, b) => b.attempt - a.attempt);

    if (this.groupedApprovals.length > 0) {
      this.groupedApprovals[0].isExpanded = true;
    }
  }

  getApproverCount(approvals: ApprovalRecord[]): number {
    return approvals.filter(approval => this.isCountableApproval(approval)).length;
  }

  private isCountableApproval(approval: ApprovalRecord): boolean {
    const excludedActions: ApprovalAction[] = [APPROVAL_ACTIONS.SENT_FOR_APPROVAL, APPROVAL_ACTIONS.ROLLED_BACK];
    return !excludedActions.includes(approval.action);
  }

  getActionClass(action: string): string {
    switch (action) {
      case APPROVAL_ACTIONS.APPROVED:
        return 'action-approved';
      case APPROVAL_ACTIONS.REJECTED:
        return 'action-rejected';
      case APPROVAL_ACTIONS.WAITING:
        return 'action-waiting';
      case APPROVAL_ACTIONS.SENT_FOR_APPROVAL:
        return 'action-sent';
      case APPROVAL_ACTIONS.ROLLED_BACK:
        return 'action-rolled-back';
      default:
        return 'action-unknown';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case APPROVAL_ACTIONS.APPROVED:
        return 'check_circle';
      case APPROVAL_ACTIONS.REJECTED:
        return 'cancel';
      case APPROVAL_ACTIONS.WAITING:
        return 'schedule';
      case APPROVAL_ACTIONS.SENT_FOR_APPROVAL:
        return 'send';
      case APPROVAL_ACTIONS.ROLLED_BACK:
        return 'undo';
      default:
        return 'help_outline';
    }
  }

  formatDate(date: string | null): string {
    if (!date) {
      return 'Pending';
    }
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
