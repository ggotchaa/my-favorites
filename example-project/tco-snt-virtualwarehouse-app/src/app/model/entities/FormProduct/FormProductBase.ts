import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { UFormProductDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { IFormProductBase } from "../../interfaces/Form/FormProduct/IFormProductBase";

export class FormProductBase implements IFormProductBase{
  id: AbstractControl;
  name: AbstractControl;
  compositeGsvsCode?: AbstractControl;
  unitOfMeasurement: AbstractControl;
  quantity: AbstractControl;
  price: AbstractControl;
  sum: AbstractControl;
  codeTNVED: AbstractControl;

  constructor(){
    this.id = new UntypedFormControl('', Validators.required);
    this.name = new UntypedFormControl({ value: '', disabled: false }, Validators.required);
    this.compositeGsvsCode = new UntypedFormControl({ value: '', disabled: true }, Validators.required);
    this.unitOfMeasurement = new UntypedFormControl('', Validators.required);
    this.quantity = new UntypedFormControl('', [Validators.required, NumericValidators.positiveNumber]);
    this.price = new UntypedFormControl('', [Validators.required, NumericValidators.positiveNumber]);
    this.sum = new UntypedFormControl({ value: '', disabled: true }, [Validators.required, NumericValidators.positiveNumber]);
    this.codeTNVED = new UntypedFormControl({ value: '', disabled: true });
  }
  setValues(product: UFormProductDto): void {
    this.id.setValue(product.productId ?? product.balanceId);
    this.name.setValue(product.name);
    this.compositeGsvsCode.setValue(product.gsvsCode);
    this.unitOfMeasurement.setValue(product.measureUnitId);
    this.quantity.setValue(product.quantity);
    this.price.setValue(product.price);
    this.sum.setValue(product.sum);
    this.codeTNVED.setValue(product.tnvedCode);
  }
  generateForm(): UntypedFormGroup {
    const formGroup = {};
    for (let property in this) {
      formGroup[<string>property] = (<any>this)[property];
    }
    return new UntypedFormGroup(formGroup);
  }
}
