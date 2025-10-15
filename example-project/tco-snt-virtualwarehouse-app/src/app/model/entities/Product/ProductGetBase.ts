import { UntypedFormArray} from "@angular/forms";

export abstract class ProductGetBase {
    abstract getProductFromGsvs(products: UntypedFormArray): void
    abstract getProductFromBalance(products: UntypedFormArray): void
}