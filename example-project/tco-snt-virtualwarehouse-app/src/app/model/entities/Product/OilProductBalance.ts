import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { BalanceSimpleDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";

export class OilProductBalance extends BalanceSimpleDto {
    addOilProductFromBalance(products: UntypedFormArray): void {
        products.push(
          new UntypedFormGroup({
            gtinCode: new UntypedFormControl(this.gtinCode),
            truOriginCode: new UntypedFormControl(Number(this.originCode), [Validators.required]),
            codeTNVED: new UntypedFormControl(this.tnvedCode),
            pinCode: new UntypedFormControl(this.pinCode),
            productName: new UntypedFormControl(this.name),
            balanceId: new UntypedFormControl(this.id),
            quantity: new UntypedFormControl(this.quantity, [NumericValidators.positiveNumber, Validators.required]),
            netWeight: new UntypedFormControl(null, [FormControlElementsBase.productWeightRequired]),
            price: new UntypedFormControl(this.unitPrice, [NumericValidators.positiveNumber, Validators.required]),
            measureUnitId: new UntypedFormControl(this.measureUnitId),
            measureUnitName: new UntypedFormControl(this.measureUnitName),
            sum: new UntypedFormControl(+(this.quantity * this.unitPrice)),
            exciseRate: new UntypedFormControl(''),
            exciseSum: new UntypedFormControl(''),
            vadRate: new UntypedFormControl(''),
            vadSum: new UntypedFormControl(''),
            totalSumWithIndirectTaxes: new UntypedFormControl(+(this.quantity * this.unitPrice)),
            additionalInfo: new UntypedFormControl(''),
          })
        )
    }

    static fromJS(data: any): OilProductBalance {
        data = typeof data === 'object' ? data : {};
        let result = new OilProductBalance();
        result.init(data);
        return result;
    }
}
