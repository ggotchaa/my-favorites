import { ReconciliationStatus } from "src/app/api/GCPClient";
import { ArReconciliationStatusesEnum } from "src/app/model/enums/ArReconciliationStatusesEnum";
import { IAdapter } from "src/app/model/interfaces/IAdapter";

export class ArReconciliationStatusesAdapter implements IAdapter<ReconciliationStatus, ArReconciliationStatusesEnum> {
    adapt(item: ArReconciliationStatusesEnum): ReconciliationStatus {
        return ReconciliationStatus[item];
    }
}