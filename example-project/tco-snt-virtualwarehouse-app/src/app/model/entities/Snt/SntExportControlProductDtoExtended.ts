import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { SntExportControlProductlDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { VadRates } from "../../lists/Einvoicing/VadRates";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";

export class SntExportControlProductDtoExtended extends SntExportControlProductlDto {
    getProductFromBalance(products: UntypedFormArray): void {
        products.push(new UntypedFormGroup({            
            truOriginCode: new UntypedFormControl(this.truOriginCode, Validators.required),
            codeTNVED: new UntypedFormControl(this.tnvedCode),
            balanceId: new UntypedFormControl(this.balanceId),
            productName: new UntypedFormControl(this.productName),
            quantity: new UntypedFormControl(this.quantity, [NumericValidators.positiveNumber, Validators.required]),
            price: new UntypedFormControl(this.price, [NumericValidators.positiveNumber, Validators.required]),            
            measureUnitId: new UntypedFormControl(this.measureUnitId, Validators.required),
            measureUnitName: new UntypedFormControl(this.measureUnitName),
            vadRate: new UntypedFormControl(String(this.ndsRate ?? VadRates[0].value)),
            sum: new UntypedFormControl(this.priceWithoutTax, [NumericValidators.positiveNumber, Validators.required]),
            vadSum: new UntypedFormControl(this.ndsAmount),
            totalSumWithIndirectTaxes: new UntypedFormControl(this.priceWithTax, [NumericValidators.positiveNumber, Validators.required]),  
            productId: new UntypedFormControl(this.productId),
            netWeight: new UntypedFormControl(this.netWeight, [FormControlElementsBase.productWeightRequired])
        }))
    }    
  
    static fromJS(data: any): SntExportControlProductDtoExtended{
        data = typeof data === 'object' ? data : {};
        let result = new SntExportControlProductDtoExtended();
        result.init(data);
        return result;
    }
}
