import { UntypedFormArray} from "@angular/forms";

export abstract class ProductAddBase {
    abstract addProductFromGsvs(products: UntypedFormArray): void
   
    abstract addProductFromBalance(products: UntypedFormArray): void 
}
