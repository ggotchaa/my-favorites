import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { SntOilProductDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { VadRates } from "../../lists/Einvoicing/VadRates";
import { ExciseRates } from "../../lists/ExciseRates";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";

export class SntOilProductDtoExtended extends SntOilProductDto {
    getProductFromBalance(products: UntypedFormArray): void {
        products.push(new UntypedFormGroup({            
            truOriginCode: new UntypedFormControl(this.truOriginCode, Validators.required),      
            pinCode: new UntypedFormControl(this.pinCode),
            codeTNVED: new UntypedFormControl(this.tnvedCode),
            balanceId: new UntypedFormControl(this.balanceId),
            productName: new UntypedFormControl(this.productName),
            quantity: new UntypedFormControl(this.quantity, [NumericValidators.positiveNumber, Validators.required]),
            price: new UntypedFormControl(this.price, [NumericValidators.positiveNumber, Validators.required]),            
            measureUnitId: new UntypedFormControl(this.measureUnitId, Validators.required),
            measureUnitName: new UntypedFormControl(this.measureUnitName),
            exciseRate: new UntypedFormControl(this.exciseRate ?? ExciseRates[0].value),
            vadRate: new UntypedFormControl(String(this.ndsRate ?? VadRates[0].value)),
            sum: new UntypedFormControl(this.priceWithoutTax, [NumericValidators.positiveNumber, Validators.required]),
            vadSum: new UntypedFormControl(this.ndsAmount),
            totalSumWithIndirectTaxes: new UntypedFormControl(this.priceWithTax, [NumericValidators.positiveNumber, Validators.required]),  
            exciseSum: new UntypedFormControl(),
            additionalInfo: new UntypedFormControl(this.additionalInfo),
            netWeight: new UntypedFormControl(this.netWeight, [FormControlElementsBase.productWeightRequired])
        }))
    }    
    
    static fromJS(data: any): SntOilProductDtoExtended{
        data = typeof data === 'object' ? data : {};
        let result = new SntOilProductDtoExtended();
        result.init(data);
        return result;
    }
}
