import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaxpayerStoreClient, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { FormsStatuses } from 'src/app/model/lists/FormStatuses';
import { FormFilterTypes } from 'src/app/model/lists/FormTypes';
import { CommonDataService } from '../../../shared/services/common-data.service';
import { FormsFilter } from './formsFilter.model';

@Component({
    selector: 'app-form-filters',
    templateUrl: './form-filters.component.html',
    styleUrls: ['./form-filters.component.scss'],
    standalone: false
})
export class FormFiltersComponent implements OnInit, OnDestroy {
  types = FormFilterTypes;
  statuses = FormsStatuses;
  warehouses: TaxpayerStoreSimpleDto[];

  model = new FormsFilter();

  unsubscribe$: Subject<void> = new Subject();

  @Output() formFilterEvent = new EventEmitter<FormsFilter>();

  constructor(
    private commonDataService: CommonDataService
  ) { }

  ngOnInit(): void {
    this.commonDataService.getAllTaxpayerStores()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(stores => this.warehouses = stores)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit() {
    this.formFilterEvent.emit(this.model);
  }

  onReset(form: NgForm) {
    form.reset();
    form.controls['type'].setValue('');
    form.controls['status'].setValue('');
    form.controls['senderStoreId'].setValue(-1);
    form.controls['recipientStoreId'].setValue(-1);
    this.formFilterEvent.emit(this.model);
  }
}
