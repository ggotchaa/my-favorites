import { FormProductBase } from "./FormProductBase";
import { IDetailingFormProduct } from "../../interfaces/Form/FormProduct/IDetailingFormProduct";
import { UntypedFormControl, Validators } from "@angular/forms";
import { UFormProductDto } from "src/app/api/GCPClient";

export class DetailingFormProduct extends FormProductBase implements IDetailingFormProduct {
  truOriginCode: UntypedFormControl;
  dutyType: UntypedFormControl;
  manufactureOrImportCountry: UntypedFormControl;
  manufactureOrImportDocNumber: UntypedFormControl;
  productNameInImportDoc: UntypedFormControl;
  productNumberInImportDoc: UntypedFormControl;
  sectionType: UntypedFormControl;

  constructor(){
    super();
    this.truOriginCode = new UntypedFormControl('', Validators.required);
    this.dutyType = new UntypedFormControl('',Validators.required);
    this.manufactureOrImportCountry = new UntypedFormControl('', Validators.required);
    this.manufactureOrImportDocNumber = new UntypedFormControl('');
    this.productNameInImportDoc = new UntypedFormControl('');
    this.productNumberInImportDoc = new UntypedFormControl('');
    this.sectionType = new UntypedFormControl('');
  }
  setValues(product: UFormProductDto): void {
    super.setValues(product);
    this.truOriginCode.setValue(+product.originCode);
    this.dutyType.setValue(product.dutyTypeCode);
    this.manufactureOrImportCountry.setValue(product.manufactureOrImportCountry);
    this.manufactureOrImportDocNumber.setValue(product.manufactureOrImportDocNumber);
    this.productNameInImportDoc.setValue(product.productNameInImportDoc);
    this.productNumberInImportDoc.setValue(product.productNumberInImportDoc);
    this.sectionType.setValue(product.sectionType)
  }
}
