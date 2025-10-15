import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SntSimpleDto } from 'src/app/api/GCPClient';
import { SntFilterDto } from 'src/app/model/entities/Snt/SntFilterDto';
import { SntFilter } from '../../../pages/snt/snt-filters/snt-filters.model';
import { ProductSelectSntTableComponent } from './product-select-snt-table/product-select-snt-table.component';

@Component({
    selector: 'app-product-select-snt',
    templateUrl: './product-select-snt.component.html',
    styleUrls: ['./product-select-snt.component.scss'],
    standalone: false
})
export class ProductSelectSntComponent {

  @ViewChild(ProductSelectSntTableComponent) productSelectSntTableComponent!: ProductSelectSntTableComponent;

  constructor(
    public dialogRef: MatDialogRef<ProductSelectSntComponent>,
  ) { }

  onItemSelected(item: SntSimpleDto) {   
    this.dialogRef.close(item);
  }

  onFilter(filterDto: SntFilter) {
    this.productSelectSntTableComponent.filter(filterDto);
  }

  onClear() {
    this.productSelectSntTableComponent.clearFilter();
  }

  onCloseChange() {
    this.dialogRef.close(null)
  }

}
