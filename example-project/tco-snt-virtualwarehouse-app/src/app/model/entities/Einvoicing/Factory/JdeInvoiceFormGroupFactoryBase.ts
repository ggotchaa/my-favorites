import { FormArray, FormGroup } from "@angular/forms";
import { AwpWorksPerformedDto, GetSntProductBySntIdResponseDto, JdeArInvoiceDto } from "src/app/api/GCPClient";
import { IAwpWorksPerformedMapable } from "../Interfaces/IAwpWorkToInvoiceProductMapable";
import { ICurrencyRateSetable } from "../Interfaces/ICurrenyRateSetable";
import { IInvoiceFormGroupSetable } from "../Interfaces/IInvoiceFormGroupSetable";
import { ISntProductSetToInvoiceProductMapable } from "../Interfaces/ISntProductsSetToInvoiceProductMapable";

export abstract class JdeInvoiceFormGroupCreatorBase<T> {

    public isHasIniated: boolean = false;

    
    public abstract createAwpToInvoiceProductMap(): IAwpWorksPerformedMapable;
    public abstract createJdeInvoiceFormGroup():  IInvoiceFormGroupSetable<T>

    public abstract createSntProductsToInvoiceProduct(): ISntProductSetToInvoiceProductMapable

    public abstract getCurrencyRateSetable(): ICurrencyRateSetable

    public getInstanceIfExisted() {
        if(this.isHasIniated) {
            return this;
        }
        throw new Error("Instance is not initiated");
    }

    public setAwpWorksPerformed(awpWorksPerformed: AwpWorksPerformedDto) {

        const mapping = this.createAwpToInvoiceProductMap();

        mapping.mapAwpWorkSetToProductsSet(awpWorksPerformed);

        mapping.mapAwpWorkToInvoiceProduct(awpWorksPerformed.awpWorks)
        
    }

    public setSntProductsSet(sntProductsSet: GetSntProductBySntIdResponseDto) {
        const mapping = this.createSntProductsToInvoiceProduct();
        mapping.mapSntData(sntProductsSet);
        if(sntProductsSet.products) mapping.mapSntProductsToInvoiceProducts(sntProductsSet.products);
        if(sntProductsSet.oilProducts) mapping.mapSntOilProductToInvoiceProducts(sntProductsSet.oilProducts);
    }

    
}