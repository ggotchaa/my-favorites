import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { BalanceSimpleDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { ProductAddBase } from "../Product/ProductAddBase";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";

export class ProductBalanceExtended extends BalanceSimpleDto implements ProductAddBase {
    addProductFromGsvs(_products: UntypedFormArray): void {
        throw new Error("Method not implemented.");
    }
    addProductFromBalance(products: UntypedFormArray): void {
        products.push(
            new UntypedFormGroup({
                gtinCode: new UntypedFormControl(this.gtinCode),
                truOriginCode: new UntypedFormControl(Number(this.originCode), [Validators.required]),
                codeTNVED: new UntypedFormControl(this.tnvedCode),
                productName: new UntypedFormControl(this.name, [Validators.required, Validators.maxLength(2500)]),
                balanceId: new UntypedFormControl(this.id),
                quantity: new UntypedFormControl(this.quantity, [NumericValidators.positiveNumber, Validators.required]),
                netWeight: new UntypedFormControl(null, [FormControlElementsBase.productWeightRequired]),
                price: new UntypedFormControl(this.unitPrice, [NumericValidators.positiveNumber, Validators.required]),
                vadRate: new UntypedFormControl(''),
                sum: new UntypedFormControl(+(this.quantity * this.unitPrice)),
                vadSum: new UntypedFormControl(''),
                totalSumWithIndirectTaxes: new UntypedFormControl(+(this.quantity * this.unitPrice)),  
                measureUnitId: new UntypedFormControl(this.measureUnitId),
                measureUnitName: new UntypedFormControl(this.measureUnitName)               
            })
        )
  }

    static fromJS(data: any): ProductBalanceExtended {
        data = typeof data === 'object' ? data : {};
        let result = new ProductBalanceExtended();
        result.init(data);
        return result;
    }
}
