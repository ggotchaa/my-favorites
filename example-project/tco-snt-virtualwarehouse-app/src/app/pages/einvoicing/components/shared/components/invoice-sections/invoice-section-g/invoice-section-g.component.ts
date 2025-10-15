import { AfterContentInit, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaxpayerStoreSimpleDto, MeasureUnitDto, CurrencyDto, GetRateResponseDto } from 'src/app/api/GCPClient';
import { ArDraftInvoiceFormGroup } from 'src/app/model/entities/Einvoicing/ArDraftInvoiceFormGroup';
import { CustomerCategory } from 'src/app/model/enums/CustomerCategory';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { InvoiceCalculationDirections } from 'src/app/model/lists/Einvoicing/InvoiceCalculationDirections';
import { InvoiceCalculationWays } from 'src/app/model/lists/Einvoicing/InvoiceCalculationWays';
import { TnvedCodes } from 'src/app/model/lists/Einvoicing/TnvedCodes';
import { VadRates } from 'src/app/model/lists/Einvoicing/VadRates';
import { TruOriginCodes } from 'src/app/model/lists/TruOriginCodes';
import { Utilities } from 'src/app/shared/helpers/Utils';
import { CurrencyFillableService } from 'src/app/shared/services/auto-complete-searches/currency-search/currency-fillable.service';
import { MeasureUnitFillableService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable.service';
import { SiblingComponentsDataSharing } from 'src/app/shared/services/sibling-components-data-sharing.service';
import { CurrencyFillableToken } from 'src/app/shared/tokens/currency-search.token';
import { MeasureUnitFillableToken } from 'src/app/shared/tokens/measure-unit-search.token';
import { InvoiceProductFormService } from '../../../../invoice/services/InvoiceProductFormService';
import { InvoiceFacade } from '../../../invoice.facade';
import { KztCurrencyCode } from 'src/app/model/GlobalConst';

@Component({
    selector: 'app-invoice-section-g',
    templateUrl: './invoice-section-g.component.html',
    styleUrls: ['./invoice-section-g.component.scss'],
    providers: [
        {
            provide: CurrencyFillableToken,
            useFactory: () => {
                return new CurrencyFillableService();
            }
        },
        {
            provide: MeasureUnitFillableToken,
            useFactory: () => {
                return new MeasureUnitFillableService();
            }
        }
    ],
    standalone: false
})

export class InvoiceSectionGComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input() invoiceForm: UntypedFormGroup
  @Input() warehouses: TaxpayerStoreSimpleDto[];

  @Input() measureUnits: MeasureUnitDto[];
  @Input() favouriteMeasureUnits: MeasureUnitDto[];

  @Input() currencies: CurrencyDto[]
  @Input() favouriteCurrencies: CurrencyDto[]

  invoiceCalculationWays = InvoiceCalculationWays;
  invoiceCalculationDirections = InvoiceCalculationDirections;
  trueOriginCodes = TruOriginCodes;
  vadRates = VadRates;
  tnvedCodes = TnvedCodes;

  isLoadingCurrencyRate: boolean = false;
  
  isLoading$: Observable<boolean>;

  dataSource: MatTableDataSource<any>;
  productDisplayColumns = ['number', 'productNumberInSnt', 'truOriginCode', 'description', 'tnvedName', 'unitCode', 'measureUnitName','quantity', 'unitPrice', 'sum', 'salesAmount', 'vadRate', 'vadSum', 'sumWithIndirectTaxes', 'identificator', 'additionalDetails', 'actions'];  
  formValuesObj;
  isConverted = false;
  private unsubscribe$: Subject<void> = new Subject<void>();

  private get statusSellerFormControl(): UntypedFormControl {
    return this.invoiceForm.get('seller.statuses') as UntypedFormControl;
  }

  private get currencyCodeFormControl(): UntypedFormControl {
    return this.invoiceForm.get('currencyCode') as UntypedFormControl;
  }

  private get turnOverDateFormControl(): UntypedFormControl {
    return this.invoiceForm.get('turnoverDate') as UntypedFormControl;
  }

  private get currencyRateFormControl(): UntypedFormControl {
    return this.invoiceForm.get('currencyRate') as UntypedFormControl;
  }
  
  get productsFormArray() {
    return this.invoiceForm.get('products') as UntypedFormArray;
  }
  get numberHeaderRowDefs() {
    let columnCount = this.productDisplayColumns.length;
    let columnNumbers = Array.from({ length: columnCount }, (_, i) => i + 1);
    return columnNumbers.map(n => 'hn-' + n);
  }  

  public calculateTotal(formControlName:string) : number|string {
    return this.invoiceProductFormService.calculateTotal(formControlName, this.productsFormArray)
  }
  

  constructor(
    private facade: InvoiceFacade,

    private invoiceProductFormService: InvoiceProductFormService,

    private siblingComponentsDataSharing: SiblingComponentsDataSharing,

    @Inject(CurrencyFillableToken) private currencyFillable: IFilliable<CurrencyDto, string> | IFilliableNonOption<CurrencyDto, string>,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto, number> | IFilliableNonOption<MeasureUnitDto, number>) { }

  ngOnInit(): void {    
    (this.currencyFillable as IFilliable<CurrencyDto, string>).fillOut([this.favouriteCurrencies, this.currencies]);
    (this.measureUnitFillable as IFilliable<MeasureUnitDto, number>).fillOut([this.favouriteMeasureUnits, this.measureUnits])

    this.dataSource = new MatTableDataSource(this.productsFormArray.controls);

    this.isLoading$ = this.siblingComponentsDataSharing.getLoaderStatus();
    
    if(this.invoiceForm.get('turnoverDate').value && !this.invoiceForm.disabled)
      this.isLoadingCurrencyRate = true;
  }

  ngAfterContentInit(): void {
    if(!this.isLoadingCurrencyRate && this.isCanGetRate() && !this.invoiceForm.disabled){
      this.isLoadingCurrencyRate = true;
    }
    this.formValuesObj = JSON.parse(JSON.stringify(this.productsFormArray.value))
  }
  
  private isCanGetRate():  boolean {
    const isHasNecessaryStatusesForRate = (this.statusSellerFormControl.value as string[]).some(s =>
      s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT ||
      s === CustomerCategory.EXPORTER ||
      s === CustomerCategory.TRANSPORTER)
    const isNotKztInvoice = this.currencyCodeFormControl.value as string !== KztCurrencyCode;
    return isHasNecessaryStatusesForRate && isNotKztInvoice && !Utilities.isEmptyValue(this.currencyCodeFormControl.value as string) && !Utilities.isEmptyValue(this.turnOverDateFormControl.value as Date);
  }

  addProduct(): void {
    this.productsFormArray.push(ArDraftInvoiceFormGroup.getEmptyProductFormGroup());
    this.dataSource.data = [...this.productsFormArray.controls];
    this.invoiceForm.get('products').markAllAsTouched();
  }

  removeProduct(index: number): void {
    this.productsFormArray.removeAt(index)
    this.dataSource.data.splice(index, 1)
    this.dataSource.data = [...this.dataSource.data]
  }  

  getSum(element) {
    const unitPrice = element.get('unitPrice').value as number;
    const quantity = element.get('quantity').value as number;

    return this.invoiceProductFormService.getSum(unitPrice, quantity);
  }

  getVadSum(element) {
    const unitPrice = element.get('unitPrice').value as number;
    const quantity = element.get('quantity').value as number;
    const vadRate = +element.get('vadRate').value 
    const sum = element.get('sum').value as number;
    
    return isFinite(unitPrice) ? 
      this.invoiceProductFormService.getVadSum(unitPrice, quantity, vadRate) : 
      this.invoiceProductFormService.getVadSumWithoutUnit(vadRate, sum);
  }

  getSumWithIndirectTaxes(element) {
    const unitPrice = element.get('unitPrice').value as number;
    const quantity = element.get('quantity').value as number;
    const vadRate = +element.get('vadRate').value 
    const sum = element.get('sum').value as number;
    
    return isFinite(unitPrice) ? 
      this.invoiceProductFormService.getSumWithIndirectTaxes(unitPrice, quantity, vadRate) :
      this.invoiceProductFormService.getSumWithIndirectTaxesWithoutUnit(vadRate, sum);
  }

  convertSum(){
    let valuesForConvert = ['unitPrice', 'sum', 'salesAmount', 'vadSum', 'sumWithIndirectTaxes'];
    this.dataSource.data.map(v => {
      valuesForConvert.forEach(key => {
        if(isFinite(v.value[key]) && v.value[key] !== null){
          v.get(key).setValue(this.multiplyItem(v.value[key]));
        }
      })
    });
    this.isConverted = true;
  }

  private multiplyItem(item){
    let currencyRate = this.currencyRateFormControl.value;
    return +(item * currencyRate).toFixed(2);
  }
  resetConvert(){
    this.toAddAbsenseProduct();
    this.toRestoreOriginalData();
    this.isConverted = false;
  }

  private toAddAbsenseProduct(){
    if(this.dataSource.data.length !== this.formValuesObj.length){
      let deltaSize = this.formValuesObj.length - this.dataSource.data.length; 
      for(let i = 0; i < deltaSize; i++){
        this.addProduct();
      }
    }
  }

  private toRestoreOriginalData(){
    this.checkUnitPrice();
    this.dataSource.data.map((v, i) => {
      Object.keys(this.formValuesObj[i]).forEach(key => { 
          v.get(key).setValue(this.formValuesObj[i][key]);  
        }
      )
    });
  }

  private checkUnitPrice(){
    this.formValuesObj.map(u=> {
      if(u.unitPrice === null){
        u.unitPrice = Infinity;
      }
    });
  }
  saveConvert() {
    this.currencyCodeFormControl.setValue(KztCurrencyCode);
    this.currencyRateFormControl.setValue(null);
  }

  updateSum(element) {
    element.get('sum').setValue(this.getSum(element).toFixed(2));
    element.get('salesAmount').setValue(this.getSum(element).toFixed(2));
    element.get('sumWithIndirectTaxes').setValue(this.getSumWithIndirectTaxes(element));
  }

  onTruOriginCodeChange(element) {    
    element.get('measureUnitId').updateValueAndValidity();
    element.get('quantity').updateValueAndValidity();
    element.get('unitCode').updateValueAndValidity();
    element.get('description').updateValueAndValidity();
  }
  
  onSelectedCurrencyCode(currency: CurrencyDto): void {
    if(currency.code === KztCurrencyCode){
      this.invoiceForm.get('currencyRate').setValue(null);
    } 
    if(this.isCanGetRate()){
      this.isLoadingCurrencyRate = true;
      this.updateCurrencyRate(currency.code)
      .pipe(
        takeUntil(this.unsubscribe$),
      )
      .subscribe(
        res => {
          if(res.isFound){
            this.currencyRateFormControl.setValue(res.rate);
          }else{
            this.facade.displayWarning('Не удалось получить курс валюты.')
            this.currencyRateFormControl.setValue(null);
          }
          this.isLoadingCurrencyRate = false;
        },
        err => {
          this.facade.displayErrors(err)
          this.currencyRateFormControl.setValue(null);
          this.isLoadingCurrencyRate = false
        }
      )
    }
  }
  onVadRateChange(element) {
    if (!element.get('vadRate').value) {
      element.get('vadSum').setValue(0);
    }
    else {
      element.get('vadSum').setValue(+this.getVadSum(element).toFixed(2));
    };
    element.get('sumWithIndirectTaxes').setValue(+this.getSumWithIndirectTaxes(element).toFixed(2));
  }

  private updateCurrencyRate(currencyCode: string): Observable<GetRateResponseDto> {
    return this.facade.dictionaryClient.getRateByCurrencyAndDate(currencyCode, this.turnOverDateFormControl.value, new Date().getTimezoneOffset() * -1);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
