import { GetSuppliersResultDto, InvoiceStatus, ManualReconciliationCommentType } from "src/app/api/GCPClient";
import { ApInvoiceTypesEnum } from "src/app/model/enums/ApInvoiceTypesEnum";
export interface FilterModel<T> {
    dateFrom: Date;
    dateTo: Date;
    number: string;
    registerNumber: string;
    reconciliationStatus: T;
    invoiceType: ApInvoiceTypesEnum
    tin:string;
    invoiceStatus: InvoiceStatus[];
    manualReconciliationCommentType: ManualReconciliationCommentType[];
    ownInvoices: boolean,
    isDrafts: boolean
  }

  export interface ReportFilterModel<T> extends FilterModel<T> {
    orgautocomplete: GetSuppliersResultDto
  }  