import { UntypedFormControl } from "@angular/forms";
import { IFormProductBase } from "./IFormProductBase";

export interface IDetailingFormProduct extends IFormProductBase{
  productIdentificator?: UntypedFormControl;
}
