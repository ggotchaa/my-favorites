import { SelectedView } from "../../interfaces/ISelectedView";
import { ApManualReconciliationCommentTypeEnum } from "../../enums/ApManualReconciliationCommentTypeEnum"

export const ApManualReconciliationCommentType: SelectedView[] = [
  { viewValue: "Under Review", value: ApManualReconciliationCommentTypeEnum[ApManualReconciliationCommentTypeEnum.UnderReview] },
  { viewValue: "Not Reconciled", value: ApManualReconciliationCommentTypeEnum[ApManualReconciliationCommentTypeEnum.NotReconciled] },
  { viewValue: "Reconciled", value: ApManualReconciliationCommentTypeEnum[ApManualReconciliationCommentTypeEnum.Reconciled] },
]