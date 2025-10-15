import { Injectable} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { InvoiceFullDto } from "src/app/api/GCPClient";
import { EsfInvoiceFormGroup } from "../EsfInvoiceFormGroup";
import { IInvoiceFormGroupSetable } from "../Interfaces/IInvoiceFormGroupSetable";
import { EsfInvoiceFormGroupCreatorBase } from "./EsfInvoiceFormGroupFactoryBase";
import { InvoiceProductFormService } from "src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService";

@Injectable()
export class EsfInvoiceFormGroupCreator extends EsfInvoiceFormGroupCreatorBase<InvoiceFullDto> {
    
    private instance: EsfInvoiceFormGroup;

    private _formGroup: UntypedFormGroup;

    public set formGroup(v : UntypedFormGroup) {
        this._formGroup = v;
    }

    constructor(private invoiceProductFormService: InvoiceProductFormService) {
        super();
    }

    public createEsfInvoiceFormGroup(): IInvoiceFormGroupSetable<InvoiceFullDto> {
        this.isHasIniated = true;
        this.instance = new EsfInvoiceFormGroup(this.invoiceProductFormService, this._formGroup);
        return this.instance
    }
}