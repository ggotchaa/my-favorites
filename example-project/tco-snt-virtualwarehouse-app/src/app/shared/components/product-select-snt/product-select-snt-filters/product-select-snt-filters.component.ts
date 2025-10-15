import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { SntFilterDto } from 'src/app/model/entities/Snt/SntFilterDto';
import { SntFilter } from 'src/app/pages/snt/snt-filters/snt-filters.model';
import { SntFacade } from '../../../../pages/snt/snt.facade';

@Component({
    selector: 'app-product-select-snt-filters',
    templateUrl: './product-select-snt-filters.component.html',
    styleUrls: ['./product-select-snt-filters.component.scss'],
    standalone: false
})
export class ProductSelectSntFiltersComponent implements AfterViewInit {

  @Output() onFilter = new EventEmitter<SntFilter>();
  @Output() onClear = new EventEmitter();

  form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder
  ) {
    this.intiForm();
    
  }
  ngAfterViewInit(): void {
    this.search();
  }

  intiForm() {
    this.form = this.fb.group({
      number: this.fb.control(null),
      dateFrom: this.fb.control(''),
      dateTo: this.fb.control(''),
      registrationNumber: this.fb.control(null),
    });
  }

  clear() {
    this.form.get("number").setValue('');
    this.form.get("dateFrom").setValue('');
    this.form.get("dateTo").setValue('');
    this.form.get("registrationNumber").setValue('');

    this.onClear.emit();
  }

  search() {    
    this.onFilter.emit(this.form.value as SntFilter);
  }
}
