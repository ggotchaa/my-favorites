import { IInvoiceFormGroupSetable } from "../Interfaces/IInvoiceFormGroupSetable";

export abstract class EsfInvoiceFormGroupCreatorBase<T> {

    public isHasIniated: boolean = false;

    public abstract createEsfInvoiceFormGroup():  IInvoiceFormGroupSetable<T>

    public getInstanceIfExisted() {
        if(this.isHasIniated) {
            return this;
        }
        throw new Error("Instance is not initiated");
    }
    
}