import { SelectedView } from "../../interfaces/ISelectedView";
import { ApInvoiceTypesEnum } from "../../enums/ApInvoiceTypesEnum";

export const ApInvoiceTypes: SelectedView[] = [
  { viewValue: "Все", value: ''},
  { viewValue: "Основные", value: ApInvoiceTypesEnum[ApInvoiceTypesEnum.ORDINARY_INVOICE]},
  { viewValue: "Исправленные", value: ApInvoiceTypesEnum[ApInvoiceTypesEnum.FIXED_INVOICE]},
  { viewValue: "Дополнительные", value: ApInvoiceTypesEnum[ApInvoiceTypesEnum.ADDITIONAL_INVOICE]}  
];


