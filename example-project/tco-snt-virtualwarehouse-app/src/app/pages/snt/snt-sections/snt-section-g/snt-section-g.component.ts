import { Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { defer, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { BalanceSimpleDto, MeasureUnitDto, ProductDto, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { GsvsDtoExtended } from 'src/app/model/entities/Gsvs/GsvsDtoExtended';
import { SntDraftDtoExtended } from 'src/app/model/entities/Snt/SntDraftDtoExtended';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { ProductSelectBalanceQuantityComponent } from 'src/app/shared/components/product-select-balance/product-select-balance-quantity/product-select-balance-quantity.component';
import { ProductSelectBalanceComponent } from 'src/app/shared/components/product-select-balance/product-select-balance.component';
import { MeasureUnitFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable-non-options.service';
import { MeasureUnitFillableService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable.service';
import { MeasureUnitFillableToken } from 'src/app/shared/tokens/measure-unit-search.token';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { ProductBalanceExtended } from '../../../../model/entities/Product/ProductBalanceExtended';
import { ProductSelectGsvsComponent } from '../../../../shared/components/product-select-gsvs/product-select-gsvs.component';
import { SntSectionsNames } from '../SntSectionsNames';
import { SntSectionGValidators } from './snt-section-g.validators';
import { VadRates } from 'src/app/model/lists/Einvoicing/VadRates';
import { SntProductFormService } from '../../services/SntProductFormService';

const TruOriginCode = [
  { value: '', name: '--Не выбрано--' },
  { value: 1, name: '1' },
  { value: 2, name: '2' },
  { value: 3, name: '3' },
  { value: 4, name: '4' },
  { value: 5, name: '5' },

]

@Component({
    selector: 'app-snt-section-g',
    templateUrl: './snt-section-g.component.html',
    styleUrls: ['./snt-section-g.component.scss'],
    providers: [
        {
            provide: MeasureUnitFillableToken,
            useFactory: (mode: SntActionMode) => {
                return mode !== 2 ? new MeasureUnitFillableService() : new MeasureUnitFillableNonOptionsService();
            },
            deps: [SNTACTIONMODE]
        }
    ],
    standalone: false
})
export class SntSectionGComponent implements OnInit {
  @Input() draftSntForm: UntypedFormGroup;
  @Input() warehouses: TaxpayerStoreSimpleDto[];
  @Input() measureUnits: MeasureUnitDto[];
  @Input() favouriteMeasureUnits: MeasureUnitDto[];

  sntSectionsNames = SntSectionsNames

  dataSource: MatTableDataSource<any>;
  truOriginCode;
  displayedColumns = ['truOriginCode', 'productName','codeTNVED', 'measureUnitName' , 'quantity', 'netWeight', 'price', 'sum', 'vadRate', 'vadSum', 'totalSumWithIndirectTaxes', 'actions'];  
  vadRates = VadRates;
  get numberHeaderRowDefs(): string[]{
    let columnCount = this.displayedColumns.length;
    let columnNumbers =  Array.from({length: columnCount}, (_, i) => i+1);
    return columnNumbers.map(n => 'hn-' + n);
  }

  get productsFormArray() {
    return this.draftSntForm.get('products') as UntypedFormArray;
  }

  constructor(
    public dialog: MatDialog,
    private sntProductFormService: SntProductFormService,
    @Inject(SNTACTIONMODE) public mode: SntActionMode,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto,number> | IFilliableNonOption<MeasureUnitDto, number>
    
    ) { 
    }

  ngOnInit(): void {
    if(this.mode === SntActionMode.Show) {
      this.displayedColumns.pop();
      (this.measureUnitFillable as IFilliableNonOption<MeasureUnitDto, number>).fillOut(this.measureUnits)
    }else{
      (this.measureUnitFillable as IFilliable<MeasureUnitDto, number>).fillOut([this.favouriteMeasureUnits, this.measureUnits])
    }
    this.dataSource = new MatTableDataSource(this.productsFormArray.controls)    
    this.truOriginCode = TruOriginCode;
    this.clearProductsOnSellerTinChange();
  }
  
  calculateTotal(formControlName:string) : number|string {
    return this.sntProductFormService.calculateTotal(formControlName, this.productsFormArray)
  }

  addProduct(): void{
    let snt = SntDraftDtoExtended.fromJS(this.draftSntForm.value)
    if (snt.sntBound.isOutbound(this.draftSntForm.get('seller.tin').value)) {
      this.addProductFromBalance();
    }
    else {
      this.addProductFromGsvs();
    }
  }

  clearProductsOnSellerTinChange() {
    this.draftSntForm.get('seller.tin').valueChanges      
      .subscribe((_sellerTin: string) => {
          this.productsFormArray.clear();
          this.dataSource.data = [...this.productsFormArray.controls]
      })
  }  


  addProductFromGsvs() {
    const dialogRef = this.dialog.open(ProductSelectGsvsComponent, { width: '1250px', height: '90vh', maxWidth: 'none', maxHeight: 'none' });
    dialogRef.afterClosed()
      .subscribe((product: ProductDto) => {
        if (product) {
          let gsvsDtoExtended = GsvsDtoExtended.fromJS(product);
          gsvsDtoExtended.addProductFromGsvs(this.productsFormArray)
          this.dataSource.data = [...this.productsFormArray.controls]
          this.productsFormArray.controls.forEach(c => {            
            c.markAllAsTouched();
            c.updateValueAndValidity();            
          });          
        }
    })    
  }

  addProductFromBalance() {
    const dialogRef = this.dialog.open(ProductSelectBalanceComponent, {
      width: '1500px',
      maxHeight: 'none',
      maxWidth: 'none',
      data: {
        title: 'Товары',
        warehouseId: this.draftSntForm.get('seller.taxpayerStoreId').value,
        type: 'SNT'
      },
    }
    );
    const dialogSelectQuantity$ = (products: BalanceSimpleDto[]) => {
      const dialogSelectQuantity = this.dialog.open(ProductSelectBalanceQuantityComponent, {
        width: '1000px',
        maxHeight: 'none',
        maxWidth: 'none',
        data: {
          title: 'Укажите количество товаров',
          products: products,
        }
      })
      return dialogSelectQuantity.afterClosed()
    }
    dialogRef.afterClosed().pipe(
      mergeMap(
        ((products: BalanceSimpleDto[]) => defer(
          () => products === undefined ? of(null) : dialogSelectQuantity$(products)
        )
        )
      ),
    ).subscribe(
      (products: BalanceSimpleDto[]) => {

        if (products) {
          products.forEach(product => {
             let productBalanceExtended = ProductBalanceExtended.fromJS(product)
             productBalanceExtended.addProductFromBalance(this.productsFormArray)
          })
          this.dataSource.data = [...this.productsFormArray.controls];          
          this.productsFormArray.controls.forEach(c => {
            c.markAllAsTouched();
            c.updateValueAndValidity();
          });
        }
      }
    );
  }
  removeProduct(index: number): void{
    this.productsFormArray.removeAt(index)
    this.dataSource.data.splice(index, 1)
    this.dataSource.data = [...this.dataSource.data]
  }
  
  onVadRateChange(element) {
    if (!element.get('vadRate').value) {
      element.get('vadSum').setValue('Без НДС');
    }
    else {
      element.get('vadSum').setValue(+this.sntProductFormService.getVadSum(element).toFixed(2));
    };
    element.get('totalSumWithIndirectTaxes').setValue(+this.sntProductFormService.getTotalSumWithIndirectTaxes(element).toFixed(2));
  }

  updateSum(element) {
    element.get('sum').setValue(this.sntProductFormService.getSum(element).toFixed(2));
    element.get('vadSum').setValue(+this.sntProductFormService.getVadSum(element) === 0 ? '' : +this.sntProductFormService.getVadSum(element).toFixed(2));
    element.get('totalSumWithIndirectTaxes').setValue(this.sntProductFormService.getTotalSumWithIndirectTaxes(element).toFixed(2));
  }

}
