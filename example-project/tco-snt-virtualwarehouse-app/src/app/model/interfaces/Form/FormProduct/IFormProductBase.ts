import { AbstractControl, UntypedFormGroup } from "@angular/forms";
import { UFormProductDto } from "src/app/api/GCPClient";

export interface IFormProductBase{
  id: AbstractControl;
  name: AbstractControl;
  compositeGsvsCode?: AbstractControl;
  unitOfMeasurement: AbstractControl;
  quantity: AbstractControl;
  price: AbstractControl;
  sum: AbstractControl;
  codeTNVED: AbstractControl;

  generateForm(): UntypedFormGroup

  setValues(product: UFormProductDto): void;
}
