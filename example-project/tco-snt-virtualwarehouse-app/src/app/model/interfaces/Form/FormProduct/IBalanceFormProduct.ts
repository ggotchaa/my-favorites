import { UntypedFormControl } from "@angular/forms";
import { IFormProductBase } from "./IFormProductBase";

export interface IBalanceFormProduct extends IFormProductBase{
    truOriginCode: UntypedFormControl;
    dutyType: UntypedFormControl;
    manufactureOrImportCountry: UntypedFormControl;
    manufactureOrImportDocNumber: UntypedFormControl;
    productNameInImportDoc: UntypedFormControl;
    productNumberInImportDoc: UntypedFormControl;
    pinCode: UntypedFormControl;
}
