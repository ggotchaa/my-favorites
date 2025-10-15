import { UntypedFormControl, Validators } from "@angular/forms";
import { UFormProductDto } from "src/app/api/GCPClient";
import { IBalanceFormProduct } from "../../interfaces/Form/FormProduct/IBalanceFormProduct";
import { FormProductBase } from "./FormProductBase";

export class BalanceFormProduct extends FormProductBase implements IBalanceFormProduct  {
  truOriginCode: UntypedFormControl;
  dutyType: UntypedFormControl;
  manufactureOrImportCountry: UntypedFormControl;
  manufactureOrImportDocNumber: UntypedFormControl;
  productNameInImportDoc: UntypedFormControl;
  productNumberInImportDoc: UntypedFormControl;
  pinCode: UntypedFormControl;

  constructor(){
    super();
    this.truOriginCode = new UntypedFormControl('', Validators.required);
    this.dutyType = new UntypedFormControl('',Validators.required);
    this.manufactureOrImportCountry = new UntypedFormControl('', Validators.required);
    this.manufactureOrImportDocNumber = new UntypedFormControl('');
    this.productNameInImportDoc = new UntypedFormControl('');
    this.productNumberInImportDoc = new UntypedFormControl('');
    this.pinCode = new UntypedFormControl('', [Validators.minLength(11), Validators.maxLength(12)]);
  }

  setValues(product: UFormProductDto): void {
    super.setValues(product);
    this.truOriginCode.setValue(+product.originCode);
    this.dutyType.setValue(product.dutyTypeCode);
    this.manufactureOrImportCountry.setValue(product.manufactureOrImportCountry);
    this.manufactureOrImportDocNumber.setValue(product.manufactureOrImportDocNumber);
    this.productNameInImportDoc.setValue(product.productNameInImportDoc);
    this.productNumberInImportDoc.setValue(product.productNumberInImportDoc);
    this.pinCode.setValue(product.pinCode);
  }
}
