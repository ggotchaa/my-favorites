import { Component, Inject, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ProductSelectGsvsComponent } from '../../../shared/components/product-select-gsvs/product-select-gsvs.component';
import { SelectedView } from 'src/app/model/interfaces/ISelectedView';
import {
  BalanceSimpleDto,
  CountryDto,
  MeasureUnitDto,
  ProductDto,
  UFormDetailingType,
  UFormType,
} from 'src/app/api/GCPClient';
import { NumericValidators } from 'src/app/Extensions/validators/numeric.validators';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, Subject } from 'rxjs';
import { FormProductBase } from 'src/app/model/entities/FormProduct/FormProductBase';
import { IFormProduct } from 'src/app/model/interfaces/IFormProduct';
import { ProductSelectBalanceComponent } from '../../../shared/components/product-select-balance/product-select-balance.component';
import { CommonDataService } from '../../../shared/services/common-data.service';
import { MeasureUnitFillableToken } from 'src/app/shared/tokens/measure-unit-search.token';
import { MeasureUnitFillableService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable.service';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { DutyType } from 'src/app/model/enums/DutyType';
import { COUNTRIES } from 'src/app/model/lists/Countries';
import { DUTYTYPES } from 'src/app/model/lists/DytyTypes';
import { TruOriginCodes } from 'src/app/model/lists/TruOriginCodes';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';

@Component({
    selector: 'app-product-add',
    templateUrl: './product-add.component.html',
    styleUrls: ['./product-add.component.scss'],
    providers: [
        {
            provide: MeasureUnitFillableToken,
            useClass: MeasureUnitFillableService,
        },
        {
            provide: CountryFillableToken,
            useClass: CountryFilliableService
        }
    ],
    standalone: false
})
export class ProductAddComponent implements OnInit, OnDestroy {
  addProductForm: UntypedFormGroup;
  warehouseId: number;
  dutyType = DutyType;
  countries = COUNTRIES;
  dutyTypes = DUTYTYPES;
  truOriginCodes = TruOriginCodes;
  private unsubscribe$: Subject<void> = new Subject<void>();

  product: FormProductBase;
  private formType: UFormType;
  private quantityInStorehouse: number;

  constructor(
    public dialogRef: MatDialogRef<ProductAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private commonDataService: CommonDataService,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto,number>,
    @Self() @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string>,
  ) {
    this.formType = data.formType;
    this.warehouseId = data.warehouseId;
    this.product = data.formProductType
  }

  ngOnInit(): void {
    if (!this.data.form) {
      this.addProductForm = this.product.generateForm();
    } else {
      this.addProductForm = this.data.form;
      if (this.data.detailingTypeE2 === UFormDetailingType.EDITING) {
        this.disableFormControls([
          'quantity',
          'price',
          'unitOfMeasurement'
          ]);
      }
      if(this.data.detailingTypeE2 !== UFormDetailingType.PACKING &&
        this.data.detailingTypeE2 !== UFormDetailingType.UNPACKING) {
        this.disableFormControls([
          'manufactureOrImportCountry',
          'dutyType',
          'truOriginCode',
          'manufactureOrImportDocNumber',
          'productNumberInImportDoc',
          'productNameInImportDoc'
        ]);
      }
    }
    
    if(this.product.hasOwnProperty('truOriginCode')){
      this.addProductForm.get('truOriginCode').valueChanges.subscribe(element =>{
        const isDetailingAndFormType = this.data.detailingTypeE2 === UFormDetailingType.PACKING ||
          this.data.detailingTypeE2 === UFormDetailingType.UNPACKING || this.data.formType === UFormType.BALANCE;
        if(isDetailingAndFormType && element === 1) {
            this.addProductForm.controls['manufactureOrImportDocNumber'].setValidators([Validators.required]);
            this.addProductForm.controls['productNumberInImportDoc'].setValidators([Validators.required]);
        } else {
          this.addProductForm.controls['manufactureOrImportDocNumber'].setValidators([]);
          this.addProductForm.controls['productNumberInImportDoc'].setValidators([]);
        }
  
        this.addProductForm.controls['manufactureOrImportDocNumber'].updateValueAndValidity();
        this.addProductForm.controls['productNumberInImportDoc'].updateValueAndValidity();
      })
    }
    
    const measureUnits$ = this.commonDataService.getMeasureUnits();
    const favouriteMeasureUnits$ = this.commonDataService.getFavouriteMeasureUnits();

    forkJoin([measureUnits$, favouriteMeasureUnits$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([measureUnits, favouriteMeasureUnits]) => {
        this.measureUnitFillable.fillOut([favouriteMeasureUnits, measureUnits])
        if(this.formType === UFormType.BALANCE || this.formType === UFormType.DETAILING)
          this.countryFillable.fillOut([this.data.countryGroup[0], this.data.countryGroup[1]])
      })

    this.handleFormChanges();
  }
  private disableFormControls(controlNames) {
    for (const controlName of controlNames) {
      this.addProductForm.controls[controlName].disable();
    }
  }
  onProductAdd() {  
    this.addProductForm.markAllAsTouched();

    if (this.addProductForm.valid) {
      this.dialogRef.close({
        product: <IFormProduct>this.addProductForm.getRawValue(),
        quantityInStorehouse: this.quantityInStorehouse
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  handleFormChanges(): void {
    this.addProductForm.get('quantity').valueChanges.subscribe((vol) => {
      const uPrice = this.addProductForm.get('price').value;
      this.addProductForm.get('sum').setValue((vol * uPrice).toFixed(2));
    });

    this.addProductForm.get('price').valueChanges.subscribe((uPrice) => {
      const vol = this.addProductForm.get('quantity').value;
      this.addProductForm.get('sum').setValue((vol * uPrice).toFixed(2));
    });
  }

  selectProduct(): void {
    let dialogRef: MatDialogRef<any>;
    var isUformAndDetailingTypeValid = this.formType === UFormType.BALANCE || this.formType === UFormType.MANUFACTURE || this.data.detailingTypeE2 === UFormDetailingType.PACKING || this.data.detailingTypeE2 === UFormDetailingType.UNPACKING
    if (isUformAndDetailingTypeValid)
      dialogRef = this.dialog.open(ProductSelectGsvsComponent, {
        width: '1500px',
        maxHeight: '90vh', 
        maxWidth: 'none',
        data: { title: 'Товары' },
      });
    else
      dialogRef = this.dialog.open(ProductSelectBalanceComponent, {
        width: '1500px',                
        maxHeight: '90vh', 
        maxWidth: 'none',
        data: { title: 'Товары', warehouseId: this.warehouseId },
      });

    dialogRef
      .afterClosed()
      .subscribe((product: ProductDto | BalanceSimpleDto) => {        
        if (product) {
          this.setProduct(product);
        }
      });
  }

  setProduct(product: ProductDto | BalanceSimpleDto) {
    if (product instanceof ProductDto) {
      this.addProductForm.patchValue({
        id: product.id,
        name: product.name,
        compositeGsvsCode: this.getCompositeGsvsCode(product),
        codeTNVED: product.code
      });
    } else {
      const disabledFields = ['dutyType', 'manufactureOrImportCountry', 'manufactureOrImportDocNumber', 'productNumberInImportDoc', 'productNameInImportDoc', 'unitOfMeasurement', 'price']
      this.addProductForm.patchValue({
        id: product.id,
        name: product.name,
        compositeGsvsCode: this.getCompositeGsvsCode(product),
        codeTNVED: product.tnvedCode,
        dutyType: product.dutyType,
        price: product.unitPrice,
        productIdentificator: product.id,
        manufactureOrImportDocNumber: product.manufactureOrImportDocNumber,
        manufactureOrImportCountry: product.countryCode,
        productNumberInImportDoc: product.productNumberInImportDoc,
        productNameInImportDoc: product.productNameInImportDoc,
        unitOfMeasurement: product.measureUnitId,
        truOriginCode: Number(product.originCode)
      });      
      disabledFields.forEach(field => {
        this.addProductForm.controls[field].disable();

      })
      if (product.quantity) {
        this.quantityInStorehouse = product.quantity;
        this.addProductForm
          .get('quantity')
          .setValidators([
            Validators.required,
            NumericValidators.positiveNumber,
            Validators.max(product.quantity),
          ]);
        this.addProductForm.get('quantity').updateValueAndValidity();
      }
    }
  }

  get id() {
    return this.addProductForm.get('id');
  }

  getCompositeGsvsCode(product: ProductDto | BalanceSimpleDto): string {
    if (product instanceof ProductDto) {
      return product.code;
    } else {
      if (product.gtinCode && product.kpvedCode && product.tnvedCode)
        return `${product.kpvedCode}-${product.tnvedCode}/${product.gtinCode}`;
      if (product.kpvedCode && product.tnvedCode)
        return `${product.kpvedCode}-${product.tnvedCode}`;
    }
    return '';
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
