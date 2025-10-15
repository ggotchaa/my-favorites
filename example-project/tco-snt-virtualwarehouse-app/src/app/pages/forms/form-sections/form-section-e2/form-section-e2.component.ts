import { Component, OnChanges, Input, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FormActionMode } from 'src/app/model/enums/UForms/FormActionMode';
import { IFormProductBase } from 'src/app/model/interfaces/Form/FormProduct/IFormProductBase';
import { FormsFacade } from '../../forms.facade';
import { FORMACTIONMODE } from 'src/app/shared/tokens/form-action-mode.token';
import { ProductAddComponent } from '../../product-add/product-add.component';
import { MatDialog } from '@angular/material/dialog';
import { CountryDto, MeasureUnitDto, UFormSectionType, UFormDetailingType, UFormType } from 'src/app/api/GCPClient';
import { DUTYTYPES } from 'src/app/model/lists/DytyTypes';
import { TruOriginCodes } from 'src/app/model/lists/TruOriginCodes';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';
import { CountryFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/country-search/country-fillable-non-options.service';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { MeasureUnitFillableToken } from 'src/app/shared/tokens/measure-unit-search.token';
import { MeasureUnitFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable-non-options.service';
import { MeasureUnitFillableService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable.service';

@Component({
    selector: 'app-form-section-e2',
    templateUrl: './form-section-e2.component.html',
    styleUrls: ['./form-section-e2.component.scss'],
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

export class FormSectionE2Component implements OnInit {
  @Input() formSectionE: UntypedFormGroup;
  @Input() showDuplicatedTable: boolean;
  @Input() dataSourceSectionE2: MatTableDataSource<any>;
  
  @Input() private countries: CountryDto[];
  @Input() private favouriteCountries: CountryDto[];
  @Input() private measureUnits: MeasureUnitDto[];
  @Input() private favouriteMeasureUnits: MeasureUnitDto[];
  formActionMode = FormActionMode;
  dutyTypes = DUTYTYPES;
  truOriginCodes = TruOriginCodes;
  isDisabled: boolean = false;

  constructor(
    public dialog: MatDialog,
    public formFacade: FormsFacade,
    @Inject(FORMACTIONMODE) public mode: FormActionMode,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto,number> | IFilliableNonOption<MeasureUnitDto, number>,
    @Inject(CountryFillableToken) private coutnryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
  ) { }
  
  get formProductType(): IFormProductBase {
    return this.formFacade.getFormProductType(this.formSectionE.get('typeForm').value);
  }
  get productsFormArraySectionE1() {
    return this.formSectionE.get('products') as UntypedFormArray;
  }
  get productsFormArraySectionE2() {
    return this.formSectionE.get('sectionE2Products') as UntypedFormArray;
  }

  get detailingType() {
    return this.formSectionE.get('detailingType');
  }

  get numberHeaderRowDefs(): string[] {
    let columnCount = this.displayedColumns.length;
    let columnNumbers = Array.from({ length: columnCount }, (_, i) => i + 1);
    return columnNumbers.map(n => 'hn-' + n);
  }

  ngOnInit(): void{
    this.formSectionE.valueChanges.subscribe(x => {
      this.fillDataSource();
      switch(this.detailingType.value) {
        case UFormDetailingType.PACKING: 
          this.isDisabled = this.productsFormArraySectionE1.value.length < 2 || this.productsFormArraySectionE2.value.length > 0 ? true : false;
          break;
        default:
          break;
      }
    })
    if(this.mode !== FormActionMode.Show){
      this.fillDataSource();
      (this.measureUnitFillable as IFilliable<MeasureUnitDto, number>).fillOut([this.favouriteMeasureUnits, this.measureUnits]);
      (this.coutnryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries])
    }else{
      this.fillDataSource();
      (this.measureUnitFillable as IFilliableNonOption<MeasureUnitDto, number>).fillOut(this.measureUnits);
      (this.coutnryFillable as IFilliableNonOption<CountryDto, string>).fillOut(this.countries)
    }
  }

  private fillDataSource() {
    this.dataSourceSectionE2 = new MatTableDataSource(this.productsFormArraySectionE2.controls);
    this.dataSourceSectionE2.data = [...this.productsFormArraySectionE2.controls]
  }
  isAddButtonDisabled (): boolean {
    var isButtonDisabledForPacking = (this.productsFormArraySectionE1.value.length < 2 || this.productsFormArraySectionE2.value.length > 0 ) && this.detailingType.value === UFormDetailingType.PACKING;
    return isButtonDisabledForPacking;
  }
  get displayedColumns(): string[] {
    let columns = Object.getOwnPropertyNames(this.formProductType);
    const standardColumns = ['number', ...columns];
    const columnsToHide = ['pinCode', 'productNameInImportDoc', 'productNumberInImportDoc', 'manufactureOrImportDocNumber', 'manufactureOrImportCountry', 'dutyType', 'truOriginCode', 'sectionType'];
    if (this.mode === FormActionMode.Show) {
      return [...standardColumns.filter(column => !columnsToHide.includes(column))]
    } else {
      return [...standardColumns.filter(column => !columnsToHide.includes(column)), 'add'];
    }
  }; 

  addProduct(): void{
    const dialogRef = this.dialog.open(ProductAddComponent,{width: '1000px', maxHeight: 'none', maxWidth: 'none',
      data: {
        formType: this.formSectionE.get('typeForm').value,
        detailingTypeE2: this.detailingType.value,
        countryGroup: [this.favouriteCountries, this.countries],
        formProductType: this.formProductType,
        warehouseId: this.formSectionE.get('warehouse.warehouseSelector').value}
      });

    dialogRef.afterClosed().subscribe((data: any) => {
        if (data.product) {
          const productFormGroupSectionE2 = this.formProductType.generateForm();
          data.product.sectionType = UFormSectionType.SectionE2;
          data.product.sectionType = UFormSectionType.SectionE2;
          productFormGroupSectionE2.patchValue(data.product);
          this.productsFormArraySectionE2.push(productFormGroupSectionE2);          
          if (this.detailingType.value === UFormDetailingType.EDITING) {
            productFormGroupSectionE2.controls['quantity'].disable();
            productFormGroupSectionE2.controls['price'].disable();
            productFormGroupSectionE2.controls['unitOfMeasurement'].disable();
          }
          else if (this.detailingType.value === UFormDetailingType.CONVERSION) {
            productFormGroupSectionE2.controls['name'].disable();
          }
          this.dataSourceSectionE2.data = [...this.productsFormArraySectionE2.controls];
        }
    });
  }

  editProduct(data){
    const dialogRef = this.dialog.open(ProductAddComponent,{width: '1000px', maxHeight: '90vh', maxWidth: 'none',
    data: {
      formType: this.formSectionE.get('typeForm').value,
      detailingTypeE2: this.detailingType.value,
      countryGroup: [this.favouriteCountries, this.countries],
      formProductType: data.controls,
      form: data,
      warehouseId: this.formSectionE.get('warehouse.warehouseSelector').value}
    });
    dialogRef.afterClosed().subscribe((editedData: any) => {
      data.controls['quantity'].setValue(editedData.product['quantity'])
      data.controls['price'].setValue(editedData.product['price'])
      data.controls['unitOfMeasurement'].setValue(editedData.product['unitOfMeasurement'])
      data.controls['name'].setValue(editedData.product['name'])
    })
  }

  removeProduct(index: number): void{
    this.productsFormArraySectionE2.removeAt(index);
    this.dataSourceSectionE2.data = [...this.productsFormArraySectionE2.controls];
  }
}
