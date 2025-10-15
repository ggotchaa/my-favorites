import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { BalanceSimpleDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";

export class ExportControlProductBalance extends BalanceSimpleDto {
    addExportControlProductFromBalance(products: UntypedFormArray): void {
        products.push(
            new UntypedFormGroup({
              truOriginCode: new UntypedFormControl(Number(this.originCode), [Validators.required]),
              codeTNVED: new UntypedFormControl(this.tnvedCode),
              balanceId: new UntypedFormControl(this.id),
              productName: new UntypedFormControl(this.name),
              quantity: new UntypedFormControl(this.quantity, [NumericValidators.positiveNumber, Validators.required]),
              netWeight: new UntypedFormControl(null, [FormControlElementsBase.productWeightRequired]),
              price: new UntypedFormControl(this.unitPrice, [NumericValidators.positiveNumber, Validators.required]),            
              measureUnitId: new UntypedFormControl(this.measureUnitId, Validators.required),
              measureUnitName: new UntypedFormControl(this.measureUnitName),
              vadRate: new UntypedFormControl(''),
              sum: new UntypedFormControl(+(this.quantity * this.unitPrice)),
              vadSum: new UntypedFormControl(''),
              totalSumWithIndirectTaxes: new UntypedFormControl(+(this.quantity * this.unitPrice)),  
              productId: new UntypedFormControl(this.kpvedCode + '-' + this.tnvedCode + '<' + this.productId + '>'),
              manufactureOrImportDocNumber: new UntypedFormControl(''),
              productNumberInImportDoc:  new UntypedFormControl(''),
            })
          )
    }

    static fromJS(data: any): ExportControlProductBalance {
        data = typeof data === 'object' ? data : {};
        let result = new ExportControlProductBalance();
        result.init(data);
        return result;
    }
}
