import { AfterContentChecked, EventEmitter, Injector, Optional, Output, SkipSelf } from '@angular/core';
import { AfterViewInit, Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormActionMode } from 'src/app/model/enums/UForms/FormActionMode';
import { IFormProductBase } from 'src/app/model/interfaces/Form/FormProduct/IFormProductBase';
import { ProductAddComponent } from 'src/app/pages/forms/product-add/product-add.component';

import { FORMACTIONMODE, FORMTYPE } from 'src/app/shared/tokens/form-action-mode.token';
import { MeasureUnitFillableToken, MeasureUnitSearchToken } from 'src/app/shared/tokens/measure-unit-search.token';
import { CountryDto, MeasureUnitDto, UFormSectionType, UFormDetailingType, UFormType } from '../../../../api/GCPClient';
import { DUTYTYPES } from '../../../../model/lists/DytyTypes';
import { TruOriginCodes } from '../../../../model/lists/TruOriginCodes';
import { FormsFacade } from '../../forms.facade';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { MeasureUnitFillableService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable.service';
import { MeasureUnitFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable-non-options.service';
import { CountryFillableToken, CountrySearchToken } from 'src/app/shared/tokens/country-search.token';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountryFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/country-search/country-fillable-non-options.service';
import { merge } from 'rxjs';
import { NumericValidators } from 'src/app/Extensions/validators/numeric.validators';

@Component({
    selector: 'app-form-section-e',
    templateUrl: './form-section-e.component.html',
    styleUrls: ['./form-section-e.component.scss'],
    providers: [
        {
            provide: MeasureUnitFillableToken,
            useFactory: (mode: FormActionMode) => {
                return mode === 2 ? new MeasureUnitFillableNonOptionsService() : new MeasureUnitFillableService();
            },
            deps: [FORMACTIONMODE]
        },
        {
            provide: CountryFillableToken,
            useFactory: (mode: FormActionMode) => {
                return mode === 2 ? new CountryFillableNonOptionsService() : new CountryFilliableService();
            },
            deps: [FORMACTIONMODE]
        }
    ],
    standalone: false
})
export class FormSectionEComponent implements OnInit{
  @Output() getSectionE2Elements = new EventEmitter()
  @Input() private measureUnits: MeasureUnitDto[];
  @Input() private favouriteMeasureUnits: MeasureUnitDto[];
  @Input() countries: CountryDto[];
  @Input() favouriteCountries: CountryDto[];


  @Input() form: UntypedFormGroup;
  dataSourceSectionE1: MatTableDataSource<any>;
  dataSourceSectionE2: MatTableDataSource<any>;
  formActionMode = FormActionMode;
  truOriginCodes = TruOriginCodes;
  dutyTypes = DUTYTYPES;
  isShowSectionE2Table: boolean = false;
  private quantityInStorehouse: number;
  
  constructor(
    public dialog: MatDialog,
    public formFacade: FormsFacade,
    @Inject(FORMACTIONMODE) public mode: FormActionMode,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto,number> | IFilliableNonOption<MeasureUnitDto, number>,
    @Inject(CountryFillableToken) private coutnryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
    ) { 
    }

  get numberHeaderRowDefs(): string[] {
    let columnCount = this.displayedColumns.length;
    let columnNumbers = Array.from({ length: columnCount }, (_, i) => i + 1);
    return columnNumbers.map(n => 'hn-' + n);
  }
  ngOnInit(): void {
    this.dataSourceSectionE1 = new MatTableDataSource(this.productsFormArraySectionE1.controls);

    this.clearProductsOnFormTypeChange();
    if(this.mode !== FormActionMode.Show){
      (this.measureUnitFillable as IFilliable<MeasureUnitDto, number>).fillOut([this.favouriteMeasureUnits, this.measureUnits]);
      (this.coutnryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries])
    }else{
      (this.measureUnitFillable as IFilliableNonOption<MeasureUnitDto, number>).fillOut(this.measureUnits);
      (this.coutnryFillable as IFilliableNonOption<CountryDto, string>).fillOut(this.countries)
    }
  }

  clearProductsOnFormTypeChange() {
    merge(
      this.form.get('typeForm').valueChanges,
      this.form.get('detailingType').valueChanges
    ).subscribe(_ => {
        this.isShowSectionE2Table = false;
        this.productsFormArraySectionE1.clear();
        this.dataSourceSectionE1.data = [...this.productsFormArraySectionE1.controls];  
        this.getSectionE2Elements.emit({
          isShowSectionE2Table: this.isShowSectionE2Table
        })
        this.productsFormArraySectionE2.clear();
        this.dataSourceSectionE2.data = [...this.productsFormArraySectionE2.controls];  
      })
  }

  get productsFormArraySectionE1() {
    return this.form.get('products') as UntypedFormArray;
  }

  get productsFormArraySectionE2() {
    return this.form.get('sectionE2Products') as UntypedFormArray;
  }

  get formProductType(): IFormProductBase {
    return this.formFacade.getFormProductType(this.form.get('typeForm').value);
  }

  get displayedColumns(): string[] {
    let columns = Object.getOwnPropertyNames(this.formProductType);
    const standardColumns = ['number', ...columns];
    const columnsToHide = ['pinCode', 'productNameInImportDoc', 'productNumberInImportDoc', 'manufactureOrImportDocNumber', 'manufactureOrImportCountry', 'dutyType', 'truOriginCode', 'sectionType'];
    
    if (this.mode === FormActionMode.Show) {
      return this.formType.value === UFormType.DETAILING ? [...standardColumns.filter(column => !columnsToHide.includes(column))] : standardColumns;
    } else {
      return this.formType.value === UFormType.DETAILING ? [...standardColumns.filter(column => !columnsToHide.includes(column)), 'add'] : [...standardColumns, 'add'];
    }
  };  
  
  isAddProductButtonDisabled(): boolean{
    var isButtonDisabledForUnpacking = this.detailingType.value === UFormDetailingType.UNPACKING && this.productsFormArraySectionE1.value.length > 0;
    return this.formType.errors?.required
    || (this.isWarehouseNeededForProductAdd() && this.form.get('warehouse.warehouseSelector').errors?.required) || isButtonDisabledForUnpacking;
  }

  isWarehouseNeededForProductAdd(): boolean{
    return this.formType.value == UFormType.WRITE_OFF || this.formType.value == UFormType.MOVEMENT;
  }
  get formType() {
    return this.form.get('typeForm');
  }

  get detailingType() {
    return this.form.get('detailingType');
  }

  addProduct(): void{
    const dialogRef = this.dialog.open(ProductAddComponent,{width: '1000px', maxHeight: '90vh', maxWidth: 'none',
      data: {
        formType: this.form.get('typeForm').value,
        detailingTypeE1: this.detailingType.value,
        countryGroup: [this.favouriteCountries, this.countries],
        formProductType: this.formProductType,
        warehouseId: this.form.get('warehouse.warehouseSelector').value}
      });

    dialogRef.afterClosed().subscribe((data: any) => {
        if (data.product) {
          this.addProductForSectionE1(data);
          if(this.formType.value === UFormType.DETAILING)
          {
            this.addProductForSectionE2(data);
          }          
        }
    });
  }

  addProductForSectionE1(data) {
    const productFormGroupSectionE1 = this.formProductType.generateForm();
    data.product.sectionType = UFormSectionType.SectionE1; 
    productFormGroupSectionE1.patchValue(data.product);  
    if(this.formType.value === UFormType.DETAILING){
      productFormGroupSectionE1.get('quantity')
          .setValidators([
            NumericValidators.positiveNumber,
            Validators.max(data.quantityInStorehouse),
          ]);
      productFormGroupSectionE1.get('quantity').updateValueAndValidity();
      productFormGroupSectionE1.controls['price'].disable();
      productFormGroupSectionE1.controls['unitOfMeasurement'].disable();
    } 
    this.productsFormArraySectionE1.push(productFormGroupSectionE1);
    this.dataSourceSectionE1.data = [...this.productsFormArraySectionE1.controls];
  }

  addProductForSectionE2(data){
    if (this.detailingType.value !== UFormDetailingType.PACKING && 
        this.detailingType.value !== UFormDetailingType.UNPACKING) {
      const productFormGroupSectionE2 = this.formProductType.generateForm();
      data.product.sectionType = UFormSectionType.SectionE2;
      productFormGroupSectionE2.patchValue(data.product);
      productFormGroupSectionE2.get('quantity')
      .setValidators([
        NumericValidators.positiveNumber
      ]);
      productFormGroupSectionE2.get('quantity').updateValueAndValidity();
      switch (this.formType.value) {
        case UFormType.DETAILING:
          if (this.detailingType.value === UFormDetailingType.EDITING) {
            productFormGroupSectionE2.controls['quantity'].disable();
            productFormGroupSectionE2.controls['price'].disable();
            productFormGroupSectionE2.controls['unitOfMeasurement'].disable();
          }
          else if (this.detailingType.value === UFormDetailingType.CONVERSION) {
            productFormGroupSectionE2.controls['name'].disable();
          }
          break;
        default:
          break;
      }
      this.productsFormArraySectionE2.push(productFormGroupSectionE2);
    }
    this.isShowSectionE2Table = this.formType.value == UFormType.DETAILING ? true : false;
    this.getSectionE2Elements.emit({
      isShowSectionE2Table: this.isShowSectionE2Table
    })
  }

  removeProduct(index: number): void{
    this.productsFormArraySectionE1.removeAt(index);
    this.dataSourceSectionE1.data = [...this.productsFormArraySectionE1.controls];
  }
}
