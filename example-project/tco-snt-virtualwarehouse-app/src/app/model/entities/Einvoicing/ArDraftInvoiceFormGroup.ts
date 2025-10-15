import { formatDate } from "@angular/common";
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { InvoiceProductFormService } from "src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService";
import { InvoiceSectionGValidators } from "src/app/pages/einvoicing/components/shared/components/invoice-sections/invoice-section-g/invoice-section-g.validators";
import { FormControlElementsBase } from "src/app/pages/snt/snt-sections/FormControlElementsBase";
import { AwpWorkDto, AwpWorksPerformedDto, GetSntProductBySntIdResponseDto, JdeArInvoiceDto, MeasureUnitDto, SntOilProductDto, SntProductFullDto } from "../../../api/GCPClient";
import { NumericValidators } from "../../../Extensions/validators/numeric.validators";
import { CustomerCategory } from "../../enums/CustomerCategory";
import { IAwpWorksPerformedMapable } from "./Interfaces/IAwpWorkToInvoiceProductMapable";
import { ICurrencyRateSetable } from "./Interfaces/ICurrenyRateSetable";
import { IInvoiceFormGroupSetable } from "./Interfaces/IInvoiceFormGroupSetable";
import { ISntProductSetToInvoiceProductMapable } from "./Interfaces/ISntProductsSetToInvoiceProductMapable";
import { BankDetails } from "../../GlobalConst";

export class ArDraftInvoiceFormGroup implements ICurrencyRateSetable, IAwpWorksPerformedMapable, IInvoiceFormGroupSetable<JdeArInvoiceDto>, ISntProductSetToInvoiceProductMapable { 

  private _measureUnits: MeasureUnitDto[];

  public set measureUnits(measureUnits : MeasureUnitDto[]) {
    this._measureUnits = measureUnits;
  }

  public get invoiceProductsArray(): UntypedFormArray {
    return this.invoiceForm.get('products') as UntypedFormArray
  }
  private productsFromDraft: any;
  constructor(private invoiceProductFormService: InvoiceProductFormService, private invoiceForm?: UntypedFormGroup) {}
  mapSntCurrencytoInvoiceCurrency(currencyCode: string, currencyRate?: number): void {
    if(currencyCode !== FormControlElementsBase.currencyCode) {
      this.invoiceForm.get('seller.exporterCheckBox').setValue(true)
      this.invoiceForm.get('customer.nonresidentCheckBox').setValue(true)
      this.invoiceForm.get('customer.statuses').setValue([CustomerCategory.NONRESIDENT])
      this.invoiceForm.get('seller.statuses').setValue([CustomerCategory.EXPORTER])
    }
    this.invoiceForm.get('currencyCode').setValue(currencyCode);
    this.invoiceForm.get('currencyRate').setValue(currencyRate);
  }

  mapSntData(snt: GetSntProductBySntIdResponseDto): void {
    this.invoiceForm.get('seller.kbe').setValue(BankDetails.kbe)
    this.invoiceForm.get('seller.bik').setValue(BankDetails.bik)
    this.invoiceForm.get('seller.iik').setValue(BankDetails.iik)
    this.invoiceForm.get('seller.bank').setValue(BankDetails.bank)
    this.invoiceForm.get('customer.tin').setValue(snt.customerTin || '');
    this.invoiceForm.get('customer.countryCode').setValue(snt.customerCountryCode);
    this.invoiceForm.get('consignee.tin').setValue(snt.consigneeTin || '');
    this.invoiceForm.get('consignee.countryCode').setValue(snt.consigneeCountryCode);
    this.invoiceForm.get('deliveryTerm.hasContract').setValue(snt.isContract.toString());
    this.invoiceForm.get('deliveryTerm.term').setValue(snt.termOfContractPayment || '');
    this.invoiceForm.get('deliveryTerm.transportTypeCode').setValue(snt.transportType);
    this.invoiceForm.get('deliveryTerm.warrant').setValue(snt.powerOfAttorneyNumber || '');
    this.invoiceForm.get('deliveryTerm.warrantDate').setValue(snt.powerOfAttorneyDate || '');
    this.invoiceForm.get('deliveryTerm.deliveryConditionCode').setValue(snt.contractDeliveryCondition || '');
    if (snt.isContract){
      this.invoiceForm.get('deliveryTerm.contractNum').setValue(snt.contractNumber);
      this.invoiceForm.get('deliveryTerm.contractDate').setValue(snt.contractDate);
    }

    this.invoiceForm.get('customer.nonresidentCheckBox').setValue(snt.customerNonResident);
    this.invoiceForm.get('seller.exporterCheckBox').setValue(snt.exportType);
    
    let sellerStatusesArray = snt.sellerStatuses as string[];
    let customerStatusesArray = snt.customerStatuses as string[];
    
      this.invoiceForm.get('customer.commitentCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.COMMITTENT));
      this.invoiceForm.get('customer.brokerCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.BROKER));
      this.invoiceForm.get('customer.lesseeCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.LESSEE));
      this.invoiceForm.get('customer.publicOfficeCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.PUBLIC_OFFICE));
      this.invoiceForm.get('customer.sharingAgreementCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT));
      this.invoiceForm.get('customer.jointActivityCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.JOINT_ACTIVITY_PARTICIPANT));
      this.invoiceForm.get('customer.principalCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.PRINCIPAL));
      this.invoiceForm.get('customer.retailCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.RETAIL));
      this.invoiceForm.get('customer.individualCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.INDIVIDUAL));
      this.invoiceForm.get('customer.lawyerCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.LAWYER));
      this.invoiceForm.get('customer.bailiffCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.BAILIFF));
      this.invoiceForm.get('customer.mediatorCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.MEDIATOR));
      this.invoiceForm.get('customer.notaryCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.NOTARY));

      this.invoiceForm.get('seller.commitentCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.COMMITTENT));
      this.invoiceForm.get('seller.brokerCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.BROKER));
      this.invoiceForm.get('seller.lessorCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.LESSOR));
      this.invoiceForm.get('seller.sharingAgreementParticipantCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT));
      this.invoiceForm.get('seller.jointActivityParticipantCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.JOINT_ACTIVITY_PARTICIPANT));
      this.invoiceForm.get('seller.principalCheckBox').setValue(sellerStatusesArray.some(s => s === CustomerCategory.PRINCIPAL));
    
  }
  
  mapSntProductsToInvoiceProducts(sntProducts: SntProductFullDto[]): void {
    sntProducts.forEach(sntProduct => {
      const product = new UntypedFormGroup({
        truOriginCode: new UntypedFormControl(sntProduct.truOriginCode, [Validators.required]),
        description: new UntypedFormControl(sntProduct.productName, InvoiceSectionGValidators.descriptionRequired),
        unitCode: new UntypedFormControl(sntProduct.tnvedCode, InvoiceSectionGValidators.tnvedCodeRequired),
        measureUnitId: new UntypedFormControl(sntProduct.measureUnitId, [InvoiceSectionGValidators.measurementUnitRequired]),
        measureUnitName: new UntypedFormControl(sntProduct.measureUnitName),
        quantity: new UntypedFormControl(this.productsFromDraft.quantity, [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
        unitPrice: new UntypedFormControl(this.productsFromDraft.unitPrice, [NumericValidators.positiveNumber]),
        sum: new UntypedFormControl(+this.productsFromDraft.sum, [Validators.required]),
        salesAmount: new UntypedFormControl(+this.productsFromDraft.salesAmount),
        vadRate: new UntypedFormControl(this.productsFromDraft.vadRate?.toString()),
        vadSum: new UntypedFormControl({ value: +this.productsFromDraft.vadSum.toFixed(2), disabled: false }, [NumericValidators.nonNegativeNumber]),
        sumWithIndirectTaxes: new UntypedFormControl({ value: +this.productsFromDraft.sumWithIndirectTaxes.toFixed(2), disabled: false }), 
        identificator: new UntypedFormControl(sntProduct.productId),
        additionalDetails: new UntypedFormControl(this.productsFromDraft.additionalDetails),
        productNumberInSnt: new UntypedFormControl('1/1')
      })

      this.invoiceProductsArray.push(product);
      product.updateValueAndValidity();
    })
  }
  mapSntOilProductToInvoiceProducts(sntOilProducts: SntOilProductDto[]): void {
    sntOilProducts.forEach(sntOilProduct => {
      const product = new UntypedFormGroup({
        truOriginCode: new UntypedFormControl(sntOilProduct.truOriginCode, [Validators.required]),
        description: new UntypedFormControl(sntOilProduct.productName, InvoiceSectionGValidators.descriptionRequired),
        unitCode: new UntypedFormControl(sntOilProduct.tnvedCode, InvoiceSectionGValidators.tnvedCodeRequired),
        measureUnitId: new UntypedFormControl(sntOilProduct.measureUnitId, [InvoiceSectionGValidators.measurementUnitRequired]),
        measureUnitName: new UntypedFormControl(sntOilProduct.measureUnitName),
        quantity: new UntypedFormControl(sntOilProduct.quantity, [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
        unitPrice: new UntypedFormControl(sntOilProduct.price, [NumericValidators.positiveNumber]),
        sum: new UntypedFormControl(+this.invoiceProductFormService.getSum(sntOilProduct.price, sntOilProduct.quantity).toFixed(2), [Validators.required]),
        salesAmount: new UntypedFormControl(+this.invoiceProductFormService.getSum(sntOilProduct.price, sntOilProduct.quantity).toFixed(2)),
        vadRate: new UntypedFormControl(sntOilProduct.ndsRate?.toString()),
        vadSum: new UntypedFormControl({ value: +this.invoiceProductFormService.getVadSum(sntOilProduct.price, sntOilProduct.quantity, sntOilProduct.ndsRate).toFixed(2), disabled: false }, [NumericValidators.nonNegativeNumber]),
        sumWithIndirectTaxes: new UntypedFormControl({ value: +this.invoiceProductFormService.getSumWithIndirectTaxes(sntOilProduct.price, sntOilProduct.quantity, sntOilProduct.ndsRate).toFixed(2), disabled: false }),
        identificator: new UntypedFormControl({ value: '1', disabled: true }),
        additionalDetails: new UntypedFormControl(sntOilProduct.additionalInfo)
      })

      this.invoiceProductsArray.push(product);
    })
  }

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

  public setFormValues(invoice: JdeArInvoiceDto) {
    const setStatusesArray = () => {
      let customerStatusesArray = this.invoiceForm.get('customer.statuses').value as string[];
  
      this.invoiceForm.get('customer.nonresidentCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.NONRESIDENT));
      this.invoiceForm.get('customer.publicOfficeCheckBox').setValue(customerStatusesArray.some(s => s === CustomerCategory.PUBLIC_OFFICE));
  
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
      invoice.esfInvoiceFullDto.products.forEach(product => {
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
      this.invoiceForm.get('date').setValue(invoice.esfInvoiceFullDto.date)
    }

    const setDeliveryTerm = () => {
      this.invoiceForm.get('deliveryTerm.hasContract').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.hasContract.toString())
      this.invoiceForm.get('deliveryTerm.contractNum').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.contractNum)
      this.invoiceForm.get('deliveryTerm.contractDate').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.contractDate)
      this.invoiceForm.get('deliveryTerm.accountNumber').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.accountNumber)
      this.invoiceForm.get('deliveryTerm.deliveryConditionCode').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.deliveryConditionCode)
      this.invoiceForm.get('deliveryTerm.destination').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.destination)
      this.invoiceForm.get('deliveryTerm.term').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.term)
      this.invoiceForm.get('deliveryTerm.warrant').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.warrant)
      this.invoiceForm.get('deliveryTerm.warrantDate').setValue(invoice.esfInvoiceFullDto?.deliveryTerm?.warrantDate)
    }

    const setShipmentData = () => {
      this.invoiceForm.get('requisites.deliveryDocNum').setValue(invoice.esfInvoiceFullDto?.deliveryDocNum)
      this.invoiceForm.get('requisites.deliveryDocDate').setValue(invoice.esfInvoiceFullDto?.deliveryDocDate)
    }
    
    const setBankDetails = () => {
      this.invoiceForm.get('seller.kbe').setValue(invoice.esfInvoiceFullDto?.seller?.kbe)
      this.invoiceForm.get('seller.bik').setValue(invoice.esfInvoiceFullDto?.seller?.bik)
      this.invoiceForm.get('seller.iik').setValue(invoice.esfInvoiceFullDto?.seller?.iik)
      this.invoiceForm.get('seller.bank').setValue(invoice.esfInvoiceFullDto?.seller?.bank)
    }

    this.invoiceForm.patchValue(invoice.esfInvoiceFullDto);
    setDate();
    setDeliveryTerm();
    setStatusesArray();
    setInvoiceProducts();
    setShipmentData();
    setBankDetails();

    this.productsFromDraft = {
      quantity: invoice.esfInvoiceFullDto.products[0].quantity,
      unitPrice: invoice.esfInvoiceFullDto.products[0].unitPrice,
      sum: invoice.esfInvoiceFullDto.products[0].priceWithoutTax, 
      salesAmount: invoice.esfInvoiceFullDto.products[0].turnoverSize, 
      vadRate: invoice.esfInvoiceFullDto.products[0].ndsRate, 
      vadSum: invoice.esfInvoiceFullDto.products[0].ndsAmount, 
      sumWithIndirectTaxes: invoice.esfInvoiceFullDto.products[0].priceWithTax,
      additionalDetails: invoice.esfInvoiceFullDto.products[0].additional 
     }
  }

  

  mapAwpWorkSetToProductsSet(awpWorksPerformedDto: AwpWorksPerformedDto) {
    const productsSet = this.invoiceForm.get('productsSet') as UntypedFormGroup;

    productsSet.get('totalSumWithoutTax').setValue(awpWorksPerformedDto.totalSumWithoutTax);
    productsSet.get('totalTurnoverSize').setValue(awpWorksPerformedDto.totalTurnoverSize)
    productsSet.get('totalNdsSum').setValue(awpWorksPerformedDto.totalNdsAmount);
    productsSet.get('totalSumWithTax').setValue(awpWorksPerformedDto.totalSumWithTax);

    this.invoiceForm.get('currencyCode').setValue(awpWorksPerformedDto.currencyCode);
    this.invoiceForm.get('currencyRate').setValue(awpWorksPerformedDto.rate);

  }
  public mapAwpWorkToInvoiceProduct(awpWorkDtos: AwpWorkDto[]){

    awpWorkDtos.forEach(awpWorkDto => {
      const product =  new UntypedFormGroup({
        truOriginCode: new UntypedFormControl(6, [Validators.required]),
        description: new UntypedFormControl(awpWorkDto.name, InvoiceSectionGValidators.descriptionRequired),
        tnvedName: new UntypedFormControl(awpWorkDto.systemName),
        unitCode: new UntypedFormControl('', InvoiceSectionGValidators.tnvedCodeRequired),
        measureUnitId: new UntypedFormControl(this.getMeasureUnitByCode(awpWorkDto.measureUnitCode)?.id, [InvoiceSectionGValidators.measurementUnitRequired]),
        measureUnitName: new UntypedFormControl(this.getMeasureUnitByCode(awpWorkDto.measureUnitCode)?.name),
        quantity: new UntypedFormControl(awpWorkDto.quantity, [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
        unitPrice: new UntypedFormControl(awpWorkDto.unitPriceWithoutTax, [NumericValidators.positiveNumber]),
        sum: new UntypedFormControl(awpWorkDto.sumWithoutTax, [Validators.required]),
        salesAmount: new UntypedFormControl(awpWorkDto.turnoverSize),
        vadRate: new UntypedFormControl(awpWorkDto.ndsRate?.toString()),
        vadSum: new UntypedFormControl({ value: awpWorkDto.ndsAmount, disabled: false }, [NumericValidators.nonNegativeNumber]),
        sumWithIndirectTaxes: new UntypedFormControl({ value: awpWorkDto.sumWithTax, disabled: false }),
        identificator: new UntypedFormControl({ value: '1', disabled: true }),
        additionalDetails: new UntypedFormControl(awpWorkDto.additionalInfo)
      })

      this.invoiceProductsArray.push(product);
    })
    
  }
  getMeasureUnitByCode(measureUnitCode: string): {id: number, name: string} {
    var unit = this._measureUnits.find(m => m.code === measureUnitCode);

    return { id: unit?.id, name: unit?.name }
  }
 
  public setCurrencyRate = (rate: number): void => this.invoiceForm.get('currencyRate').setValue(rate)

}
