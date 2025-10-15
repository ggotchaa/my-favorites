import { Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { InvoiceFullDto, JdeArInvoiceDto, MeasureUnitDto } from "src/app/api/GCPClient";
import { InvoiceProductFormService } from "src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService";
import { ArDraftInvoiceFormGroupCreator } from "./ArDraftInvoiceFormGroupFactory"
import { EsfInvoiceFormGroupCreator } from "./EsfInvoiceFormGroupFactory";
import { ArJdeInvoiceFormGroupCreator } from "./ArJdeInvoiceFormGroupFactory";
import { JdeInvoiceFormGroupCreatorBase } from "./JdeInvoiceFormGroupFactoryBase";
import { EsfInvoiceFormGroupCreatorBase } from "./EsfInvoiceFormGroupFactoryBase";

@Injectable()
export class AbstractInvoiceFormGroupFactory {

    constructor(
      private invoiceProductFormService: InvoiceProductFormService,
    ) {
    }
    private factoryInstance: JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto>
    private factoryInstanceEsf: EsfInvoiceFormGroupCreatorBase<InvoiceFullDto>

    public createInvoiceForm(invoice: JdeArInvoiceDto, measureUnits: MeasureUnitDto[], invoiceForm: UntypedFormGroup): JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto> {
        if (invoice.esfInvoiceFullDto && !invoice.esfInvoiceFullDto.registrationNumber) {
          const instance = <ArDraftInvoiceFormGroupCreator> new ArDraftInvoiceFormGroupCreator(this.invoiceProductFormService);
          instance.measureUnits = measureUnits;
          instance.formGroup = invoiceForm
          this.factoryInstance = instance;
          return instance;
        }
        else {
          const instance = <ArJdeInvoiceFormGroupCreator> new ArJdeInvoiceFormGroupCreator(this.invoiceProductFormService);
          instance.formGroup = invoiceForm
          instance.measureUnits = measureUnits;
          this.factoryInstance = instance;
          return instance;
        } 
        
    }

    public createInvoiceFormEsf(invoiceForm: UntypedFormGroup): EsfInvoiceFormGroupCreatorBase<InvoiceFullDto> {
        const instance = new EsfInvoiceFormGroupCreator(this.invoiceProductFormService);
        instance.formGroup = invoiceForm
        this.factoryInstanceEsf = instance;
        return instance;
      
  }

    public arJdeInvoiceFormGroupFactory( measureUnits: MeasureUnitDto[], invoiceForm: UntypedFormGroup){
      var instance = this.getInstance() as ArJdeInvoiceFormGroupCreator;
      if(instance == null) {
        instance =  new ArJdeInvoiceFormGroupCreator(this.invoiceProductFormService)
        instance.formGroup = invoiceForm
        instance.measureUnits = measureUnits;
        this.factoryInstance = instance;

      }
     
      return instance;
    }

    public arDraftInvoiceFormGroupFactory( measureUnits: MeasureUnitDto[], invoiceForm: UntypedFormGroup){
      var instance = this.getInstance() as ArDraftInvoiceFormGroupCreator;
      if(instance == null) {
        instance = new ArDraftInvoiceFormGroupCreator(this.invoiceProductFormService)
        instance.formGroup = invoiceForm
        instance.measureUnits = measureUnits;
        this.factoryInstance = instance;
      }
     
      return instance;
    }

    public getInstance(): JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto> | EsfInvoiceFormGroupCreatorBase<InvoiceFullDto> | null {
      if(this.factoryInstance) {
        return this.factoryInstance;
      }
      return null;
    }
}