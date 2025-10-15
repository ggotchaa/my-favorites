import { Component, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EsfEntities } from 'src/app/model/enums/EsfEntities';
import { AwpFilter } from '../../../model/entities/Awp/AwpFilter';
import { ProductSelectAwpTableComponent } from './product-select-awp-table/product-select-awp-table.component';
import { ProductSelectEgpTableComponent } from './product-select-egp-table/product-select-egp-table.component';

@Component({
    selector: 'app-product-select-awp',
    templateUrl: './product-select-awp.component.html',
    styleUrls: ['./product-select-awp.component.scss'],
    standalone: false
})
export class ProductSelectAwpComponent {

  currentEntityMode: EsfEntities = EsfEntities.Awp;

  @ViewChild(ProductSelectAwpTableComponent) productSelectAwpTableComponent!: ProductSelectAwpTableComponent;
  @ViewChild(ProductSelectEgpTableComponent) productSelectEgpTableComponent!: ProductSelectEgpTableComponent;
  senderTin = this.data.senderTin
  recipientTin = this.data.recipientTin
  constructor(
    public dialogRef: MatDialogRef<ProductSelectAwpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {senderTin: string, recipientTin: string},
  ) { }

  public get EsfEntities() {
    return EsfEntities;
  }

  onItemSelectedAwp(item: any) {
    this.dialogRef.close(item);
  }

  onItemSelectedEgp(item: any) {
    this.dialogRef.close(item);
  }

  onFilter(filterDto: AwpFilter) {
    if (this.currentEntityMode == EsfEntities.Awp) {
      this.productSelectAwpTableComponent.filter(filterDto);
    } else {
      this.productSelectEgpTableComponent.filter(filterDto);
    }
  }

  onClear() {
    this.productSelectAwpTableComponent.clearFilter();
  }

  onCloseChange() {
    this.dialogRef.close(null)
  }
  changeEntityModeTo(mode: EsfEntities) {
    this.currentEntityMode = mode;
  }

}
