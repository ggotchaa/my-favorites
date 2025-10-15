import { UntypedFormControl } from "@angular/forms";
import { IFormProductBase } from "./IFormProductBase";

export interface IMovementFormProduct extends IFormProductBase{
  productIdentificator?: UntypedFormControl;
}
