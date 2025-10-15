import { IAdapter } from "src/app/model/interfaces/IAdapter";
import { ApInvoiceTypesEnum } from "src/app/model/enums/ApInvoiceTypesEnum";
import { InvoiceType } from "src/app/api/GCPClient";

export class ApInvoiceTypesAdapter implements IAdapter<InvoiceType, ApInvoiceTypesEnum> {
    adapt(item: ApInvoiceTypesEnum): InvoiceType {
        return InvoiceType[item];
    }
}