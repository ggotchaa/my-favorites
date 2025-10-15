import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DictionariesClient, MeasureUnitDto, TaxpayerStoreClient, TaxpayerStoreSimpleDto } from '../../../api/GCPClient';
import { BalancesFilter } from './balancesFilter.model';

@Component({
    selector: 'app-balances-filters',
    templateUrl: './balances-filters.component.html',
    styleUrls: ['./balances-filters.component.scss'],
    standalone: false
})
export class BalancesFiltersComponent implements OnInit{

  warehouses: TaxpayerStoreSimpleDto[];
  measureUnits: MeasureUnitDto[];  

  unsubscribe$: Subject<void> = new Subject();
  model = new BalancesFilter();

  @Output() balancesFilterEvent = new EventEmitter<BalancesFilter>();

  constructor(
    private taxPayerApi: TaxpayerStoreClient,
    public dictionariesApi: DictionariesClient,
  ) { }

  ngOnInit(): void {
    this.taxPayerApi.getAllTaxpayerStores()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(stores => this.warehouses = stores)

    this.dictionariesApi.getMeasureUnits()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(measureUnits => this.measureUnits = measureUnits)
  }

  onSubmit() {    
    this.balancesFilterEvent.emit(this.model);
  }
  onReset(form: NgForm) {
    form.reset();
    form.controls['taxpayerStoreId'].setValue(-1);
    form.controls['measureUnitId'].setValue(-1);
    this.balancesFilterEvent.emit(this.model);
  }
}
