import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { BalanceSimpleDto, MeasureUnitDto, OilPinCodeDto, ProductDto, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ProductSelectBalanceQuantityComponent } from 'src/app/shared/components/product-select-balance/product-select-balance-quantity/product-select-balance-quantity.component';
import { ProductSelectBalanceComponent } from 'src/app/shared/components/product-select-balance/product-select-balance.component';
import { MeasureUnitFillableService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-fillable.service';
import { MeasureUnitFillableToken } from 'src/app/shared/tokens/measure-unit-search.token';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { VadRates } from '../../../../model/lists/Einvoicing/VadRates';
import { TruOriginCodes } from '../../../../model/lists/TruOriginCodes';
import { SntFacade } from '../../snt.facade';
import { SntSectionsNames } from '../SntSectionsNames';
import { ExportControlProductBalance } from 'src/app/model/entities/Product/ExportControlProduct';
import { SntProductFormService } from '../../services/SntProductFormService';
import { SntDraftDtoExtended } from 'src/app/model/entities/Snt/SntDraftDtoExtended';
import { GsvsDtoExtended } from 'src/app/model/entities/Gsvs/GsvsDtoExtended';
import { ProductSelectGsvsComponent } from 'src/app/shared/components/product-select-gsvs/product-select-gsvs.component';

@Component({
    selector: 'app-snt-section-g10',
    templateUrl: './snt-section-g10.component.html',
    styleUrls: ['./snt-section-g10.component.scss'],
    providers: [
        {
            provide: MeasureUnitFillableToken,
            useClass: MeasureUnitFillableService,
        },
    ],
    standalone: false
})
export class SntSectionG10Component implements OnInit, OnDestroy {
  @Input() draftSntForm: UntypedFormGroup;  
  @Input() warehouses: TaxpayerStoreSimpleDto[];
  @Input() measureUnits: MeasureUnitDto[];
  @Input() favouriteMeasureUnits: MeasureUnitDto[];

  dataSource: MatTableDataSource<any>;
  truOriginCodes = TruOriginCodes;
  filteredMeasureUnits$: Observable<MeasureUnitDto[]>
  searchTermMeasureUnit$ = new Subject<string>();
  displayedColumns = ['truOriginCode', 'productName', 'codeTNVED', 'measureUnitName', 'quantity', 'price', 'netWeight', 'sum', 'vadRate', 'vadSum', 'totalSumWithIndirectTaxes', 'productId', 'manufactureOrImportDocNumber', 'productNumberInImportDoc', 'actions'];
  vadRates = VadRates;
  isloadingPinCodes = false;
  unsubscribe$: Subject<void> = new Subject();

  sntSectionsNames = SntSectionsNames

  get numberHeaderRowDefs(): string[] {
    let columnCount = this.displayedColumns.length;
    let columnNumbers = Array.from({ length: columnCount }, (_, i) => i + 1);
    return columnNumbers.map(n => 'hn-' + n);
  }

  get exportControlProductsFormArray() {
    return this.draftSntForm.get('exportControlProducts') as UntypedFormArray;
  }

  constructor(
    private sntFacade: SntFacade,
    public dialog: MatDialog,
    private sntProductFormService: SntProductFormService,
    @Inject(SNTACTIONMODE) public mode: SntActionMode,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto, number>

  ) { }
  

  ngOnInit(): void {
    this.measureUnitFillable.fillOut([this.favouriteMeasureUnits, this.measureUnits])
    if (this.mode === SntActionMode.Show) {
      this.displayedColumns.pop();
    };
    this.dataSource = new MatTableDataSource(this.exportControlProductsFormArray.controls);
    this.clearProductsOnSellerTinChange();
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
            this.exportControlProductsFormArray.clear();
            this.dataSource.data = [...this.exportControlProductsFormArray.controls]
        })
    }  
  
  
    addProductFromGsvs() {
      const dialogRef = this.dialog.open(ProductSelectGsvsComponent, { width: '1250px', height: '90vh',
        maxWidth: 'none', maxHeight: 'none' });
      dialogRef.afterClosed()
        .subscribe((product: ProductDto) => {
          if (product) {
            let gsvsDtoExtended = GsvsDtoExtended.fromJS(product);
            gsvsDtoExtended.addProductFromGsvs(this.exportControlProductsFormArray)
            this.dataSource.data = [...this.exportControlProductsFormArray.controls]
            this.exportControlProductsFormArray.controls.forEach(c => {            
              c.markAllAsTouched();
              c.updateValueAndValidity();            
            });          
          }
      })    
    }

  addProductFromBalance() {
    this.dialog.open(ProductSelectBalanceComponent, {
      width: '1500px', height: '90vh', maxWidth: 'none', maxHeight: 'none',
      data: {
        title: 'Товары',
        warehouseId: this.draftSntForm.get('seller.taxpayerStoreId').value,
        type: 'SNT'
      },
    }).afterClosed().pipe(
      switchMap(
        ((products: BalanceSimpleDto[]) => {
          return !products ? of(null) : this.dialog.open(ProductSelectBalanceQuantityComponent, {
            width: '1000px', height: '90', maxHeight: 'none', maxWidth: 'none',
            data: {
              title: 'Укажите количество товаров',
              products: products,
            }
          }).afterClosed()
        })
      ),
      switchMap((products: BalanceSimpleDto[]) => {
        
        return !products ? of(null) :  forkJoin(
          products.map(product => {
            if (!product.pinCode) return of(product);
            else {
              this.isloadingPinCodes = true;
              return this.sntFacade.dictionariesClient.getPinCode(product.pinCode).pipe(
                map((res: OilPinCodeDto[]) => {
                  product.name = res[0]?.productName;
                  return product;
                }),
                takeUntil(this.unsubscribe$),
                finalize(() => this.isloadingPinCodes = false))
            }           
          })
        )
      }),      
    ).subscribe((products: BalanceSimpleDto[]) => {      
        if (products) {
          products.forEach(product => {
            let productBalanceextended = ExportControlProductBalance.fromJS(product)     
            productBalanceextended.addExportControlProductFromBalance(this.exportControlProductsFormArray)
          })
          this.dataSource.data = [...this.exportControlProductsFormArray.controls]
          this.exportControlProductsFormArray.controls.forEach(c => {
            c.markAllAsTouched();
            c.updateValueAndValidity();
          });        
        }
      }
    )    
  }

  removeProduct(index: number): void {
    this.exportControlProductsFormArray.removeAt(index)
    this.dataSource.data.splice(index, 1)
    this.dataSource.data = [...this.dataSource.data];
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
  calculateTotal(formControlName:string) : number|string {
    return this.sntProductFormService.calculateTotal(formControlName, this.exportControlProductsFormArray)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
