import { ApReconciliationStatus } from "src/app/api/GCPClient";
import { ApReconciliationStatusesEnum } from "src/app/model/enums/ApReconciliationStatusesEnum";
import { IAdapter } from "src/app/model/interfaces/IAdapter";

export class ApReconciliationStatusesAdapter implements IAdapter<ApReconciliationStatus, ApReconciliationStatusesEnum> {
    adapt(item: ApReconciliationStatusesEnum): ApReconciliationStatus {
        return ApReconciliationStatus[item];
    }
}