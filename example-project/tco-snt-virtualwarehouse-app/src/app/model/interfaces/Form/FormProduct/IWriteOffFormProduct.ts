import { UntypedFormControl } from "@angular/forms";
import { IFormProductBase } from "./IFormProductBase";

export interface IWriteOffFormProduct extends IFormProductBase{
  productIdentificator?: UntypedFormControl;
}
