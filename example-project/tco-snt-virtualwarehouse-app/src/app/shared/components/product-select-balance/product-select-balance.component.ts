import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs/operators';
import { BalanceClient, BalanceSimpleDto } from 'src/app/api/GCPClient';
import { BalanceTableDataSource } from 'src/app/model/dataSources/BalanceTableDataSource';
import { ProductSelectBalanceFiltersComponent } from './product-select-balance-filters/product-select-balance-filters.component';
import { BalancesFilter } from "../../../pages/balances/balances-filters/balancesFilter.model";


@Component({
    selector: 'app-product-select-balance',
    templateUrl: './product-select-balance.component.html',
    styleUrls: ['./product-select-balance.component.scss'],
    providers: [BalanceTableDataSource],
    standalone: false
})
export class ProductSelectBalanceComponent implements OnInit {
  @ViewChild(ProductSelectBalanceFiltersComponent) productSelectBalanceFiltersComponent: ProductSelectBalanceFiltersComponent;
  displayedColumns: string[] = ['select', 'taxpayerStoreName',"name","kpvedCode","tnvedCode", "manufactureOrImportDocNumber", "productNumberInImportDoc", "measureUnitName","unitPrice",'quantity'];
  selection = new SelectionModel<BalanceSimpleDto>(true, []);
  warehouseId: number;
  currentFilter: BalancesFilter;
  constructor(
    private balanceApi: BalanceClient,
    public dialogRef: MatDialogRef<ProductSelectBalanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public products: BalanceTableDataSource){
      this.products.apiClient = this.balanceApi
      this.warehouseId = data.warehouseId;
    }

  ngOnInit() {
    this.currentFilter = new BalancesFilter();
    this.loadProducts(this.currentFilter);
  }

  loadProducts(currentFilter: BalancesFilter) {
    this.products.loadingSubject.next(true);
    currentFilter.taxpayerStoreId = this.warehouseId;
    this.products.loadBalancesWithFilters(currentFilter)
      .pipe(
        finalize(() => this.products.loadingSubject.next(false)),
        takeUntil(this.products.subscription$)
      )
      .subscribe((data) => {
        this.products.dataSourceSubjects.next(data);
        this.products.allSourceSubjects = this.products.dataSourceSubjects.value;
      })
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.products.allSourceSubjects.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.products.allSourceSubjects.forEach(row => this.selection.select(row));
  }
  selectProduct(): void{
    if(this.selection.selected.length > 0){
      if(this.data.type === 'SNT') this.dialogRef.close(this.selection.selected);
      else this.dialogRef.close(this.selection.selected[0]);
    }
  }
  onFilter(currentFilter: BalancesFilter) {
    this.loadProducts(currentFilter);
  }

  onClear() {
    this.currentFilter = new BalancesFilter();
    this.loadProducts(this.currentFilter);
  }

  closeDialog(): void{
    this.dialogRef.close();
  }
}
