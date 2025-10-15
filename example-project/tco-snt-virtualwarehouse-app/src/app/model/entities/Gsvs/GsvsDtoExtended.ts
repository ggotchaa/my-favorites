import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ProductDto } from "src/app/api/GCPClient";
import { NumericValidators } from "src/app/Extensions/validators/numeric.validators";
import { ProductAddBase } from "../Product/ProductAddBase";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";

export class GsvsDtoExtended extends ProductDto implements ProductAddBase {
    addProductFromGsvs(products: UntypedFormArray): void {
        products.push(new UntypedFormGroup({            
            truOriginCode: new UntypedFormControl('', [Validators.required]),
            codeTNVED: new UntypedFormControl(''),
            productName: new UntypedFormControl(this.name),            
            quantity: new UntypedFormControl('',[NumericValidators.positiveNumber, Validators.required]),
            netWeight: new UntypedFormControl(null, [FormControlElementsBase.productWeightRequired]),
            price: new UntypedFormControl('', [NumericValidators.positiveNumber, Validators.required]),
            measureUnitId: new UntypedFormControl('', Validators.required),
            gsvsId: new UntypedFormControl(this.id),
            vadRate: new UntypedFormControl(''),
            sum: new UntypedFormControl(''),
            vadSum: new UntypedFormControl(''),
            totalSumWithIndirectTaxes: new UntypedFormControl(''),  
        }))
    }
    addProductFromBalance(_products: UntypedFormArray): void {
        throw new Error("Method not implemented.");
    }
    static fromJS(data: any): GsvsDtoExtended {
        data = typeof data === 'object' ? data : {};
        let result = new GsvsDtoExtended();
        result.init(data);
        return result;
    }
    
}
