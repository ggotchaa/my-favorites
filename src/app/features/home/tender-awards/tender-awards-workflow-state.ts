export type TenderAwardsInitiateStage = 'collection-complete' | 'processing-complete';

export interface TenderAwardsWorkflowState {
  reportId: number;
  stage: TenderAwardsInitiateStage;
}

export const TENDER_AWARDS_WORKFLOW_STORAGE_KEY = 'tender-awards-initiate-state';
