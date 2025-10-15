import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { SntProductFullDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { ProductGetBase } from "../Product/ProductGetBase";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";
import { VadRates } from "../../lists/Einvoicing/VadRates";

export class SntProductFullDtoExtended extends SntProductFullDto implements ProductGetBase {
    getProductFromBalance(products: UntypedFormArray): void {
        products.push(new UntypedFormGroup({
            gtinCode: new UntypedFormControl(this.gtinCode),
            truOriginCode: new UntypedFormControl(this.truOriginCode, Validators.required),
            codeTNVED: new UntypedFormControl(this.tnvedCode),
            balanceId: new UntypedFormControl(this.balanceId),
            productName: new UntypedFormControl(this.productName),
            quantity: new UntypedFormControl(this.quantity, [NumericValidators.positiveNumber, Validators.required]),
            price: new UntypedFormControl(this.price, [NumericValidators.positiveNumber, Validators.required]),
            measureUnitName: new UntypedFormControl(this.measureUnitName),
            measureUnitId: new UntypedFormControl(this.measureUnitId, Validators.required),
            netWeight: new UntypedFormControl(this.netWeight, [FormControlElementsBase.productWeightRequired]),
            vadRate: new UntypedFormControl(String(this.ndsRate ?? VadRates[0].value)),
            sum: new UntypedFormControl(this.priceWithoutTax, [NumericValidators.positiveNumber, Validators.required]),
            vadSum: new UntypedFormControl(this.ndsAmount),
            totalSumWithIndirectTaxes: new UntypedFormControl(this.priceWithTax,[NumericValidators.positiveNumber, Validators.required]),
        }))
    }

    getProductFromGsvs(products: UntypedFormArray): void {
        products.push(new UntypedFormGroup({            
            
            gtinCode: new UntypedFormControl(this.gtinCode),
            truOriginCode: new UntypedFormControl(this.truOriginCode),
            codeTNVED: new UntypedFormControl(this.tnvedCode),
            productName: new UntypedFormControl(this.productName),
            quantity: new UntypedFormControl(this.quantity),
            price: new UntypedFormControl(this.price, [NumericValidators.positiveNumber, Validators.required]),
            measureUnitName: new UntypedFormControl(this.measureUnitName),
            measureUnitId: new UntypedFormControl(this.measureUnitId),
            gsvsId: new UntypedFormControl(this.gsvsId),
            netWeight: new UntypedFormControl(this.netWeight, [FormControlElementsBase.productWeightRequired]),
            vadRate: new UntypedFormControl(this.ndsRate ?? VadRates[0].value),
            sum: new UntypedFormControl(this.priceWithoutTax, [NumericValidators.positiveNumber, Validators.required]),
            vadSum: new UntypedFormControl(this.ndsAmount), //, [NumericValidators.positiveNumber, Validators.required]
            totalSumWithIndirectTaxes: new UntypedFormControl(this.priceWithTax, [NumericValidators.positiveNumber, Validators.required]),
        }))
    }
    static fromJS(data: any): SntProductFullDtoExtended{
        data = typeof data === 'object' ? data : {};
        let result = new SntProductFullDtoExtended();
        result.init(data);
        return result;
    }

}
