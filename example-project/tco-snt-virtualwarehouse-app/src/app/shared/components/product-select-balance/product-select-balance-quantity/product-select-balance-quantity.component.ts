import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControlName, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BalanceSimpleDto } from 'src/app/api/GCPClient';
import { NumericValidators } from 'src/app/Extensions/validators/numeric.validators';
@Component({
    selector: 'app-product-select-balance-quantity',
    templateUrl: './product-select-balance-quantity.component.html',
    styleUrls: ['./product-select-balance-quantity.component.scss'],
    standalone: false
})
export class ProductSelectBalanceQuantityComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'selectedQuantity',
    'quantity',
    'reserveQuantity'
  ];
  selectedQuantity: FormControlName
  dataSource: MatTableDataSource<any>;
  productsForm: UntypedFormGroup
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {title: string, products: BalanceSimpleDto[]},
    public dialogRef: MatDialogRef<ProductSelectBalanceQuantityComponent>,
    private formBuilder: UntypedFormBuilder,
  ) {
    this.productsForm = this.formBuilder.group({
      products: this.formBuilder.array([])
    })
  }

  get productsFormArray(): UntypedFormArray {
    return this.productsForm.get('products') as UntypedFormArray
  }


  ngOnInit(): void {
    this.data.products.forEach(product => {
    this.productsFormArray.push( this.formBuilder.group({
        name: [{value: product.name, disabled: true}],
        selectedQuantity: [product.quantity, [Validators.required, NumericValidators.positiveNumber,  Validators.max(product.quantity)]],
        quantity: [{value: product.quantity, disabled: true}],
        reserveQuantity: [{value: product.reserveQuantity, disabled: true}]
      }))
    })
    this.dataSource = new MatTableDataSource(this.productsFormArray.controls);
    this.productsForm.markAllAsTouched();
  }

  send(): void{
    this.productsFormArray.controls.forEach((control, index) => {
      this.data.products[index].quantity = control.value.selectedQuantity
    })
    this.dialogRef.close(this.data.products);
  }

}
