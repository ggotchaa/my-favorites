import { ArReconciliationStatusesEnum } from "../../enums/ArReconciliationStatusesEnum";
import { SelectedView } from "../../interfaces/ISelectedView";

export const ArReconciliationStatuses: SelectedView[] = [
  { viewValue: "Все", value: ''},
  { viewValue: "No match", value: ArReconciliationStatusesEnum[ArReconciliationStatusesEnum.NoMatch] },
  { viewValue: "Not reconciled", value: ArReconciliationStatusesEnum[ArReconciliationStatusesEnum.NotReconciled] },
  { viewValue: "Reconciled", value: ArReconciliationStatusesEnum[ArReconciliationStatusesEnum.Reconciled] }
];
