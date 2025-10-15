import { Injectable, SkipSelf } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { JdeArInvoiceDto, MeasureUnitDto } from "src/app/api/GCPClient";
import { InvoiceProductFormService } from "src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService";
import { ArDraftInvoiceFormGroup } from "../ArDraftInvoiceFormGroup";
import { IAwpWorksPerformedMapable } from "../Interfaces/IAwpWorkToInvoiceProductMapable";
import { ICurrencyRateSetable } from "../Interfaces/ICurrenyRateSetable";
import { IInvoiceFormGroupSetable } from "../Interfaces/IInvoiceFormGroupSetable";
import { ISntProductSetToInvoiceProductMapable } from "../Interfaces/ISntProductsSetToInvoiceProductMapable";
import { JdeInvoiceFormGroupCreatorBase } from "./JdeInvoiceFormGroupFactoryBase";

@Injectable()
export class ArDraftInvoiceFormGroupCreator extends JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto> {
    
    private instance: ArDraftInvoiceFormGroup;

    private _formGroup: UntypedFormGroup;

    public set formGroup(v : UntypedFormGroup) {
        this._formGroup = v;
    }

    private _measureUnits: MeasureUnitDto[];

    public set measureUnits(v : MeasureUnitDto[]) {
        this._measureUnits = v;
    }
    
    constructor(private invoiceProductFormService: InvoiceProductFormService) {
        super();
    }

    public getCurrencyRateSetable(): ICurrencyRateSetable {
        if(this.isHasIniated) {
            return this.instance;
        }

        throw new Error("ArJdeInvoiceFormGroup instance is not initiated");
    }

    public createJdeInvoiceFormGroup(): IInvoiceFormGroupSetable<JdeArInvoiceDto> {
        this.isHasIniated = true;
        this.instance = new ArDraftInvoiceFormGroup(this.invoiceProductFormService, this._formGroup);
        this.instance.measureUnits = this._measureUnits;
        return this.instance
    }

    public createAwpToInvoiceProductMap(): IAwpWorksPerformedMapable {

        if(this.isHasIniated) {
            this.instance.measureUnits = this._measureUnits
            return this.instance 
        }

        this.isHasIniated = true;
        this.instance = new ArDraftInvoiceFormGroup(this.invoiceProductFormService, this._formGroup);
        this.instance.measureUnits = this._measureUnits
        return this.instance
    }

    public createSntProductsToInvoiceProduct(): ISntProductSetToInvoiceProductMapable {
        if(this.isHasIniated) {
            return this.instance 
        }

        this.isHasIniated = true;
        this.instance = new ArDraftInvoiceFormGroup(this.invoiceProductFormService, this._formGroup);

        return this.instance;
    }
    
}