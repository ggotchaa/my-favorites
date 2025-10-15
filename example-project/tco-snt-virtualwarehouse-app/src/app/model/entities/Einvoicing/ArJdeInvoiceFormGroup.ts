import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { InvoiceSectionGValidators } from "src/app/pages/einvoicing/components/shared/components/invoice-sections/invoice-section-g/invoice-section-g.validators";
import { InvoiceProductFormService } from "src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService";
import { AwpWorkDto, AwpWorksPerformedDto, GetSntProductBySntIdResponseDto, JdeArInvoiceDetail, JdeArInvoiceDto, MeasureUnitDto, SntOilProductDto, SntProductFullDto } from "../../../api/GCPClient";
import { NumericValidators } from "../../../Extensions/validators/numeric.validators";
import { CustomerCategory } from "../../enums/CustomerCategory";
import { KzCountry, KztCurrencyCode, KZVAT0, NOVAT, USD, BankDetails, AccountNumberInputsForGA } from "../../GlobalConst";
import { JdeTnvedCodeMappings } from "../../lists/Einvoicing/JdeTnvedCodeMappings";
import { IAwpWorksPerformedMapable } from "./Interfaces/IAwpWorkToInvoiceProductMapable";
import { ICurrencyRateSetable } from "./Interfaces/ICurrenyRateSetable";
import { IInvoiceFormGroupSetable } from "./Interfaces/IInvoiceFormGroupSetable";
import { ISntProductSetToInvoiceProductMapable } from "./Interfaces/ISntProductsSetToInvoiceProductMapable";
import { Utilities } from '../../../shared/helpers/Utils';

export class ArJdeInvoiceFormGroup implements ICurrencyRateSetable, IAwpWorksPerformedMapable, IInvoiceFormGroupSetable<JdeArInvoiceDto>, ISntProductSetToInvoiceProductMapable {   

  private readonly dryGas = ['Сухой газ', 'Природный газ']
  

  private _measureUnits: MeasureUnitDto[];

  public set measureUnits(measureUnits : MeasureUnitDto[]) {
    this._measureUnits = measureUnits;
  }
  
  public get invoiceProductsArray(): UntypedFormArray {
    return this.invoiceForm.get('products') as UntypedFormArray
  }

  private productsFromJde: any;
  constructor(private invoiceProductFormService:InvoiceProductFormService, private invoiceForm?: UntypedFormGroup,) {
  }
  mapSntCurrencytoInvoiceCurrency(currencyCode: string, currencyRate?: number): void {
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
        quantity: new UntypedFormControl(+this.productsFromJde.quantity, [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
        unitPrice: new UntypedFormControl(+this.productsFromJde.unitPrice, [NumericValidators.positiveNumber]),
        sum: new UntypedFormControl(+this.productsFromJde.sum, [Validators.required]),
        salesAmount: new UntypedFormControl(+this.productsFromJde.salesAmount),
        vadRate: new UntypedFormControl(+this.productsFromJde.vadRate.toString()),
        vadSum: new UntypedFormControl({ value: +this.productsFromJde.vadSum.toFixed(2), disabled: false }, [NumericValidators.nonNegativeNumber]),
        sumWithIndirectTaxes: new UntypedFormControl({ value: +this.productsFromJde.sumWithIndirectTaxes.toFixed(2), disabled: false }), 
        identificator: new UntypedFormControl(sntProduct.productId),
        additionalDetails: new UntypedFormControl(this.productsFromJde.additionalDetails),
        productNumberInSnt: new UntypedFormControl('1/1')
      })

      this.invoiceProductsArray.push(product);
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

  mapAwpWorkSetToProductsSet(awpWorksPerformedDto: AwpWorksPerformedDto): void {
    const productsSet = this.invoiceForm.get('productsSet') as UntypedFormGroup;

    productsSet.get('totalSumWithoutTax').setValue(awpWorksPerformedDto.totalSumWithoutTax);
    productsSet.get('totalTurnoverSize').setValue(awpWorksPerformedDto.totalTurnoverSize)
    productsSet.get('totalNdsSum').setValue(awpWorksPerformedDto.totalNdsAmount);
    productsSet.get('totalSumWithTax').setValue(awpWorksPerformedDto.totalSumWithTax);

    this.invoiceForm.get('currencyCode').setValue(awpWorksPerformedDto.currencyCode);
    this.invoiceForm.get('currencyRate').setValue(awpWorksPerformedDto.rate);

  }

  mapAwpWorkToInvoiceProduct(awpWorkDtos: AwpWorkDto[]) {
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
        vadRate: new UntypedFormControl(awpWorkDto.ndsRate.toString()),
        vadSum: new UntypedFormControl({ value: awpWorkDto.ndsAmount, disabled: false }, [NumericValidators.nonNegativeNumber]),
        sumWithIndirectTaxes: new UntypedFormControl({ value: awpWorkDto.sumWithTax, disabled: false }),
        identificator: new UntypedFormControl({ value: '1', disabled: true }),
        additionalDetails: new UntypedFormControl(awpWorkDto.additionalInfo)
      })
  
      this.invoiceProductsArray.push(product);
    })
  }
  

  public setFormValues(invoice: JdeArInvoiceDto) {
    const setSellerAndCustomerStatuses = () => {
      if (invoice.jdeAddressBookCountry !== KzCountry) {
        (this.invoiceForm.get('seller.statuses').value as string[]).push(CustomerCategory.EXPORTER);
        (this.invoiceForm.get('customer.statuses').value as string[]).push(CustomerCategory.NONRESIDENT);
      }
      if  (invoice.jdeArF03B11CurrencyCodeFrom === USD && invoice.jdeAddressBookCountry === KzCountry) {
        (this.invoiceForm.get('seller.statuses').value as string[]).push(CustomerCategory.SHARING_AGREEMENT_PARTICIPANT);
        this.invoiceForm.get('seller.sharingAgreementParticipantCheckBox').setValue(true);
      }
    }

    const setBankDetails = () => {
      let accountNumberInputsExists = invoice.jdeArInvoceDetails.map(x=> AccountNumberInputsForGA.includes(x.jdeGeneralLedgerAccountNumberInput));
      if (accountNumberInputsExists.includes(true)){
        this.invoiceForm.get('seller.kbe').setValue(BankDetails.kbe)
        this.invoiceForm.get('seller.bik').setValue(BankDetails.bik)
        this.invoiceForm.get('seller.iik').setValue(BankDetails.iik)
        this.invoiceForm.get('seller.bank').setValue(BankDetails.bank)
      }
    }

    const getMeasureUnit = (item: JdeArInvoiceDetail) : { id: number, name: string }  => {
      if (!item.jdeGetUOMUserReservedReference) return null;
      var unit = this._measureUnits.find(m => m.code === item.jdeGetUOMUserReservedReference.padStart(3, '0'));
      return { id: unit?.id, name: unit?.name }    
    }


    const getTnvedCode = (item: JdeArInvoiceDetail) =>  {
      return JdeTnvedCodeMappings.find(t => t.viewValue === item.jdeGeneralLedgerAccountDescription)?.value;
    }
  
    const sumWithIndirectTaxes = (item: JdeArInvoiceDetail) => {
      return invoice.jdeArF03B11CurrencyCodeFrom == USD ? item.jdeArF03B11GrossAmount : item.jdeArF03B11CurrencyAmount;
    }
  
    const quantity = (item: JdeArInvoiceDetail) => {
      return item.jdeGeneralLedgerJdeLocalization === '6' //Услуги
        ? null
        : +item.jdeArF03B11Units.toFixed(2);
    }
  
    const unitPrice = (item: JdeArInvoiceDetail) => {    
      return +(calculateSum(item) / item.jdeArF03B11Units).toFixed(2);
    }  
  
    const vadSum = (item: JdeArInvoiceDetail) => {
      return invoice.jdeArF03B11CurrencyCodeFrom == USD ? item.jdeArF03B11TaxAmount : item.jdeArF03B11ForeignTaxAmount;
    }

    const setInvoiceProducts = () => {
      invoice.jdeArInvoceDetails.forEach(item => {
        if (this.dryGas.includes(item.jdeGeneralLedgerAccountDescription)) {
          item.jdeArF03B11Units /= 1000;
        }
       
        this.invoiceProductsArray.push(new UntypedFormGroup({
          truOriginCode: new UntypedFormControl(+item.jdeGeneralLedgerJdeLocalization, [Validators.required]),
          description: new UntypedFormControl(item.jdeGeneralLedgerAccountDescription, InvoiceSectionGValidators.descriptionRequired),
          tnvedName: new UntypedFormControl(),
          unitCode: new UntypedFormControl(getTnvedCode(item), InvoiceSectionGValidators.tnvedCodeRequired),
          measureUnitId: new UntypedFormControl(getMeasureUnit(item)?.id, [InvoiceSectionGValidators.measurementUnitRequired]),
          measureUnitName: new UntypedFormControl(getMeasureUnit(item)?.name),
          quantity: new UntypedFormControl(quantity(item), [InvoiceSectionGValidators.quantityRequired, NumericValidators.optionalPositiveNumber]),
          unitPrice: new UntypedFormControl(unitPrice(item), [NumericValidators.positiveNumber]),
          sum: new UntypedFormControl(calculateSum(item), [Validators.required]),
          salesAmount: new UntypedFormControl(calculateSum(item)),
          vadRate: new UntypedFormControl(selectNdsRate(item)),
          vadSum: new UntypedFormControl({ value: vadSum(item), disabled: false }, [NumericValidators.nonNegativeNumber]),
          sumWithIndirectTaxes: new UntypedFormControl({ value: sumWithIndirectTaxes(item), disabled: false }),
          identificator: new UntypedFormControl({ value: '1', disabled: true }),
          additionalDetails: new UntypedFormControl(getAdditionalDetails(invoice.jdeArF03B11Reference))
        }, {
          validators: [InvoiceSectionGValidators.unitPriceRequired]
        }));
      });
    } 
    
    const getAdditionalDetails = (item: string) => {
      const isInt = /^[0-9]+$/;
      return isInt.test(item) ? item : '';
    }
  
    const calculateSum = (item: JdeArInvoiceDetail) => {
      if (invoice.jdeArF03B11CurrencyCodeFrom === USD && item.jdeArF03B11TaxArea != NOVAT) return item.jdeArF03B11AmountTaxable;
      if (invoice.jdeArF03B11CurrencyCodeFrom === USD && item.jdeArF03B11TaxArea == NOVAT) return item.jdeArF03B11NonTaxableAmount;
      if (invoice.jdeArF03B11CurrencyCodeFrom === KztCurrencyCode && item.jdeArF03B11TaxArea != NOVAT) return item.jdeArF03B11ForeignTaxableAmount;
      if (invoice.jdeArF03B11CurrencyCodeFrom === KztCurrencyCode && item.jdeArF03B11TaxArea == NOVAT) return item.jdeArF03B11ForeignNonTaxableAmount;
      if (invoice.jdeArF03B11CurrencyCodeFrom !== KztCurrencyCode && invoice.jdeAddressBookCountry == KzCountry) return invoice.jdeArF03B11CurrencyConversionRate * invoice.jdeArF03B11AmountTaxable;
    }
    
    const selectNdsRate = (item: JdeArInvoiceDetail)=> {
      if (item.jdeArF03B11TaxArea === KZVAT0 || Utilities.isEmptyValue(item.jdeArF03B11TaxArea) || item.jdeArF03B11TaxArea === NOVAT)
        return '0';
      else 
        return invoice.jdeAddressTaxRate1.toString();
    }

    setSellerAndCustomerStatuses();    

    this.invoiceForm.patchValue({
      num: invoice.jdeArF03B11DocumentNumber,
      date: invoice.jdeArF03B11InvoiceDate,
      turnoverDate: invoice.jdeArF03B11UserReservedDate ?? invoice.jdeSalesOrderDetailsTurnoverDate,
      seller: {
        exporterCheckBox: invoice.jdeAddressBookCountry !== KzCountry,
        trailer: invoice.jdeGeneralLedgerBatchNumber.toString()
      },
      customer: {
        tin: invoice.jdeAddressBookCountry === KzCountry ? invoice.jdeAddressBookTaxId : '',
        name: invoice.jdeAddressBookNameAlpha,
        address: invoice.jdeAddressBookAddressLine1 + invoice.jdeAddressBookAddressLine2 + invoice.jdeAddressBookAddressLine3 + invoice.jdeAddressBookAddressLine4,
        countryCode: invoice.jdeAddressBookCountry,
        nonresidentCheckBox: invoice.jdeAddressBookCountry !== KzCountry
      },
      consignee: {
        tin: invoice.jdeAddressBookCountry === KzCountry ? invoice.jdeAddressBookTaxId : '',
        name: invoice.jdeAddressBookNameAlpha,
        address: invoice.jdeAddressBookAddressLine1 + invoice.jdeAddressBookAddressLine2 + invoice.jdeAddressBookAddressLine3 + invoice.jdeAddressBookAddressLine4,
        countryCode: invoice.jdeAddressBookCountry
      },
      deliveryTerm: {
        contractNum: Utilities.isEmptyValue(invoice.jdeArF03B11UserReservedReference) ? invoice.jdeItemCrossReferenceContractNumber : invoice.jdeArF03B11UserReservedReference,
        contractDate: invoice.jdeArF03B11StatementDate ?? invoice.jdeItemCrossReferencesContractDate,
        accountNumber: '',
        destination: Utilities.isNumber(invoice.jdeArF03B11Reference) ? invoice.jdeAddressBookDestination : invoice.jdeArF03B11Reference,
        hasContract: this.hasContract(invoice),
        deliveryConditionCode: invoice.jdeArF03B11DeliveryCondition ? invoice.jdeArF03B11DeliveryCondition : invoice.jdeAddressBookDeliveryCondition,
        term: invoice.jdeTermsOfPayment
      },
      requisites: {
        deliveryDocNum: invoice.jdeShipmentDataWaybillNumber === '0' ? null : invoice.jdeShipmentDataWaybillNumber,
        deliveryDocDate: invoice.jdeShipmentDataDeliveryWaybillDate,
      },
      currencyCode: invoice.jdeArF03B11CurrencyCodeFrom,
      currencyRate: '',
      calculationDirection: '1',
      calculationWay: '1'
    });

    setInvoiceProducts();     
    setBankDetails();
    
    this.productsFromJde = {
      quantity: quantity(invoice.jdeArInvoceDetails[0]),
      unitPrice: unitPrice(invoice.jdeArInvoceDetails[0]),
      sum: calculateSum(invoice.jdeArInvoceDetails[0]), 
      salesAmount: calculateSum(invoice.jdeArInvoceDetails[0]), 
      vadRate: selectNdsRate(invoice.jdeArInvoceDetails[0]), 
      vadSum: vadSum(invoice.jdeArInvoceDetails[0]), 
      sumWithIndirectTaxes: sumWithIndirectTaxes(invoice.jdeArInvoceDetails[0]),
      additionalDetails: getAdditionalDetails(invoice.jdeArF03B11Reference) 
     }
  }

  private getMeasureUnitByCode(measureUnitCode: string): {id: number, name: string} {
    var unit = this._measureUnits.find(m => m.code === measureUnitCode);

    return { id: unit?.id, name: unit?.name }
  }

  public setCurrencyRate = (rate: number): void => this.invoiceForm.get('currencyRate').setValue(rate)

  private hasContract = (invoice: JdeArInvoiceDto): string => Utilities.isEmptyValue(invoice.jdeArF03B11UserReservedReference) && (Utilities.isEmptyValue(invoice.jdeItemCrossReferenceContractNumber) || invoice.jdeItemCrossReferenceContractNumber === '0') ? "false" : "true"
}
