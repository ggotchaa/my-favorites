import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BalancesFilter } from "../../../../pages/balances/balances-filters/balancesFilter.model";

@Component({
    selector: 'app-product-select-balance-filters',
    templateUrl: './product-select-balance-filters.component.html',
    styleUrls: ['./product-select-balance-filters.component.scss'],
    standalone: false
})
export class ProductSelectBalanceFiltersComponent {

  form: UntypedFormGroup;

  @Output() onFilter = new EventEmitter<BalancesFilter>();
  @Output() onClear = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder
  ) {
    this.intiForm();
  }
  
  intiForm() {
    this.form = this.fb.group({
      tnvedCode: this.fb.control(null),
      manufactureOrImportDocNumber: this.fb.control(null),
      productNumberInImportDoc: this.fb.control(null),
    });
  }
  clear() {
    this.form.get("tnvedCode").setValue('');
    this.form.get("manufactureOrImportDocNumber").setValue('');
    this.form.get("productNumberInImportDoc").setValue('');

    this.onClear.emit();
  }

  search() {
    this.onFilter.emit(this.form.value as BalancesFilter);
  }

}
