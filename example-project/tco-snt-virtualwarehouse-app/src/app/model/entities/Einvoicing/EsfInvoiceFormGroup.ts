import { formatDate } from '@angular/common';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { InvoiceSectionGValidators } from "src/app/pages/einvoicing/components/shared/components/invoice-sections/invoice-section-g/invoice-section-g.validators";
import { InvoiceFullDto, InvoiceType } from "../../../api/GCPClient";
import { NumericValidators } from "../../../Extensions/validators/numeric.validators";
import { CustomerCategory } from "../../enums/CustomerCategory";
import { IInvoiceFormGroupSetable } from "./Interfaces/IInvoiceFormGroupSetable";
import { InvoiceProductFormService } from "src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService";

export class EsfInvoiceFormGroup implements IInvoiceFormGroupSetable<InvoiceFullDto> { 

  public get invoiceProductsArray(): UntypedFormArray {
    return this.invoiceForm.get('products') as UntypedFormArray
  }

  constructor(private invoiceProductFormService: InvoiceProductFormService, private invoiceForm?: UntypedFormGroup) {}

  public static getEmptyProductFormGroup() {
    return new UntypedFormGroup({
      truOriginCode: new UntypedFormControl('', [Validators.required]),
      description: new UntypedFormControl('', InvoiceSectionGValidators.descriptionRequired),
      unitCode: new UntypedFormControl(''),
      measureUnitId: new UntypedFormControl('', [InvoiceSectionGValidators.measurementUnitRequired]),
      measureUnitName: new UntypedFormControl(),
      quantity: new UntypedFormControl('', [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
      unitPrice: new UntypedFormControl(''),
      sum: new UntypedFormControl(0, [Validators.required]),
      salesAmount: new UntypedFormControl(''),
      vadRate: new UntypedFormControl(''),
      vadSum: new UntypedFormControl({ value: 0, disabled: false }, [NumericValidators.nonNegativeNumber]),
      sumWithIndirectTaxes: new UntypedFormControl({ value: '', disabled: false }),
      identificator: new UntypedFormControl({ value: '1', disabled: true }),
      additionalDetails: new UntypedFormControl('')
    },{
      validators: [InvoiceSectionGValidators.unitPriceRequired]
    });
  }

  public setFormValues(invoice: InvoiceFullDto) {
    const setStatusesArray = () => {
      let customerStatusesArray = this.invoiceForm.get('customer.statuses').value as string[];
  
      this.invoiceForm.get('customer.nonresidentCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.NONRESIDENT));
      this.invoiceForm.get('customer.publicOfficeCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.PUBLIC_OFFICE));
      this.invoiceForm.get('customer.commitentCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.COMMITTENT));
      this.invoiceForm.get('customer.brokerCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.BROKER));
      this.invoiceForm.get('customer.lesseeCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.LESSEE));
      this.invoiceForm.get('customer.sharingAgreementCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT));
      this.invoiceForm.get('customer.jointActivityCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.JOINT_ACTIVITY_PARTICIPANT));
      this.invoiceForm.get('customer.principalCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.PRINCIPAL));
      this.invoiceForm.get('customer.retailCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.RETAIL));
      this.invoiceForm.get('customer.individualCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.INDIVIDUAL));
      this.invoiceForm.get('customer.lawyerCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.LAWYER));
      this.invoiceForm.get('customer.bailiffCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.BAILIFF));
      this.invoiceForm.get('customer.mediatorCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.MEDIATOR));
      this.invoiceForm.get('customer.notaryCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.NOTARY));
  
      let sellerStatusesArray = this.invoiceForm.get('seller.statuses').value as string[];
  
      this.invoiceForm.get('seller.commitentCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.COMMITTENT));
      this.invoiceForm.get('seller.brokerCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.BROKER));
      this.invoiceForm.get('seller.forwarderCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.FORWARDER));
      this.invoiceForm.get('seller.lessorCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.LESSOR));
      this.invoiceForm.get('seller.sharingAgreementParticipantCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT));
      this.invoiceForm.get('seller.jointActivityParticipantCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.JOINT_ACTIVITY_PARTICIPANT));
      this.invoiceForm.get('seller.exporterCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.EXPORTER));
      this.invoiceForm.get('seller.transporterCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.TRANSPORTER));
      this.invoiceForm.get('seller.principalCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.PRINCIPAL));
    }

    const setInvoiceProducts = () => {

      invoice.products.forEach(product => {
        this.invoiceProductsArray.push(new UntypedFormGroup({
          truOriginCode: new UntypedFormControl(+product.truOriginCode, [Validators.required]),
          description: new UntypedFormControl(product.description, InvoiceSectionGValidators.descriptionRequired),
          tnvedName: new UntypedFormControl(product.tnvedName),
          unitCode: new UntypedFormControl(product.unitCode, InvoiceSectionGValidators.tnvedCodeRequired),
          measureUnitId: new UntypedFormControl(product.measureUnitId, [InvoiceSectionGValidators.measurementUnitRequired]),
          measureUnitName: new UntypedFormControl(),
          quantity: new UntypedFormControl(product.quantity, [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
          unitPrice: new UntypedFormControl(+(product.priceWithoutTax / product.quantity).toFixed(2), [NumericValidators.positiveNumber]),
          sum: new UntypedFormControl(product.priceWithoutTax, [Validators.required]),
          salesAmount: new UntypedFormControl(product.turnoverSize),
          vadRate: new UntypedFormControl(product.ndsRate?.toString()),
          vadSum: new UntypedFormControl({ value: product.ndsAmount, disabled: false }, [NumericValidators.nonNegativeNumber]),
          sumWithIndirectTaxes: new UntypedFormControl({ value: product.priceWithTax, disabled: false }),
          identificator: new UntypedFormControl(product.catalogTruId),
          additionalDetails: new UntypedFormControl(product.additional),
          productNumberInSnt: new UntypedFormControl(product.productNumberInSnt)
        }, {
          validators: [InvoiceSectionGValidators.unitPriceRequired]
        }));
      });
    }

    const setDate = () => {
      this.invoiceForm.get('date').setValue(invoice.date)
    }

    const setRegNum = () => {
      this.invoiceForm.get('regNum').setValue(invoice.registrationNumber)
    }

    const setDeliveryTerm = () => {
      this.invoiceForm.get('deliveryTerm.hasContract').setValue(invoice.deliveryTerm?.hasContract.toString())
      this.invoiceForm.get('deliveryTerm.contractNum').setValue(invoice.deliveryTerm?.contractNum)
      this.invoiceForm.get('deliveryTerm.contractDate').setValue(invoice.deliveryTerm?.contractDate)
      this.invoiceForm.get('deliveryTerm.accountNumber').setValue(invoice.deliveryTerm?.accountNumber)
      this.invoiceForm.get('deliveryTerm.deliveryConditionCode').setValue(invoice.deliveryTerm?.deliveryConditionCode)
      this.invoiceForm.get('deliveryTerm.destination').setValue(invoice.deliveryTerm?.destination)
      this.invoiceForm.get('deliveryTerm.term').setValue(invoice.deliveryTerm?.term)
      this.invoiceForm.get('deliveryTerm.warrant').setValue(invoice.deliveryTerm?.warrant)
      this.invoiceForm.get('deliveryTerm.warrantDate').setValue(invoice.deliveryTerm?.warrantDate)
    }

    const setShipmentData = () => {
      this.invoiceForm.get('requisites.deliveryDocNum').setValue(invoice.deliveryDocNum)
      this.invoiceForm.get('requisites.deliveryDocDate').setValue(invoice.deliveryDocDate)
    }

    const setRelatedInvoiceData = () => {
      if (invoice.relatedInvoice != null){
        let date = formatDate(invoice.relatedInvoice?.date, 'dd.MM.yyyy', 'en')
        this.invoiceForm.get('related.date').setValue(date)
        this.invoiceForm.get('related.num').setValue(invoice.relatedInvoice?.num)
        this.invoiceForm.get('related.regNum').setValue(invoice.relatedInvoice?.registrationNumber)
        
        if (invoice.invoiceType == InvoiceType.FIXED_INVOICE)        
          this.invoiceForm.get('related.fixedInvoiceCheckBox').setValue('true');
        else if(invoice.invoiceType == InvoiceType.ADDITIONAL_INVOICE)
          this.invoiceForm.get('related.additionalInvoiceCheckBox').setValue('true');
      }
      
    }

    const setBankDetails = () => {
      this.invoiceForm.get('seller.kbe').setValue(invoice.seller?.kbe)
      this.invoiceForm.get('seller.bik').setValue(invoice.seller?.bik)
      this.invoiceForm.get('seller.iik').setValue(invoice.seller?.iik)
      this.invoiceForm.get('seller.bank').setValue(invoice.seller?.bank)
    }

    this.invoiceForm.patchValue(invoice);
    setDate();
    setRegNum();
    setRelatedInvoiceData();
    setDeliveryTerm();
    setStatusesArray();
    setInvoiceProducts();
    setShipmentData();
    setBankDetails();
    this.invoiceForm.disable()
  }
}
