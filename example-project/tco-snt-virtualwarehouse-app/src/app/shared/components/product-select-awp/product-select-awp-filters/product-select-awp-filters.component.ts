import { Component, EventEmitter, OnInit, Output, Input, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AwpFilter } from '../../../../model/entities/Awp/AwpFilter';
import { AwpStatus } from 'src/app/api/GCPClient';

@Component({
    selector: 'app-product-select-awp-filters',
    templateUrl: './product-select-awp-filters.component.html',
    styleUrls: ['./product-select-awp-filters.component.scss'],
    standalone: false
})
export class ProductSelectAwpFiltersComponent implements OnInit, AfterViewInit {

  form: UntypedFormGroup;

  @Input() senderTin: string
  @Input() recipientTin: string
  @Output() onFilter = new EventEmitter<AwpFilter>();
  @Output() onClear = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.intiForm();
  }

  ngAfterViewInit(): void {
    this.search()
  }
  

  intiForm() {
    this.form = this.fb.group({
      dateFrom: this.fb.control(''),
      dateTo: this.fb.control(''),
      registrationNumber: this.fb.control(null),
      senderTin: this.fb.control(this.senderTin),
      recipientTin: this.fb.control(this.recipientTin)
    });
  }

  clear() {
    this.form.get("dateFrom").setValue('');
    this.form.get("dateTo").setValue('');
    this.form.get("registrationNumber").setValue('');
    this.form.get("senderTin").setValue('');
    this.form.get("recipientTin").setValue('');
    this.onClear.emit();
  }

  search() {
    let filter = this.form.value as AwpFilter;
    filter.awpStatus = AwpStatus.CONFIRMED;
    this.onFilter.emit(this.form.value as AwpFilter);
  }

}
