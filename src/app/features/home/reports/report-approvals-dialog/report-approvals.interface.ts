export const APPROVAL_ACTIONS = {
  SENT_FOR_APPROVAL: 'Sent For Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ROLLED_BACK: 'Rolled Back',
  WAITING: 'Waiting',
  UNKNOWN: 'Unknown',
} as const;

export type ApprovalAction = typeof APPROVAL_ACTIONS[keyof typeof APPROVAL_ACTIONS];

export interface ApprovalRecord {
  approverName: string;
  action: ApprovalAction;
  comment: string;
  attempt: number;
  date: string | null;
}

export interface ApprovalAttempt {
  attempt: number;
  approvals: ApprovalRecord[];
  isExpanded: boolean;
}
