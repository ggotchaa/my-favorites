import { ApReconciliationStatusesEnum } from "../../enums/ApReconciliationStatusesEnum";
import { SelectedView } from "../../interfaces/ISelectedView";

export const ApReconciliationStatuses: SelectedView[] = [
  { viewValue: "Все", value: ''},
  { viewValue: "No Match", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.NoMatch] },
  { viewValue: "Match Reconciled", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.MatchReconciled] },
  { viewValue: "AllMatch Reconciled", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.AllMatchReconciled] },
  { viewValue: "Match Diff Currency", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.MatchDiffCurrency] },
  { viewValue: "AllMatch Diff Currency", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.AllMatchDiffCurrency] },
  { viewValue: "Match Not Reconciled", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.MatchNotReconciled] },
  { viewValue: "AllMatch Not Reconciled", value: ApReconciliationStatusesEnum[ApReconciliationStatusesEnum.AllMatchNotReconciled] }
];
