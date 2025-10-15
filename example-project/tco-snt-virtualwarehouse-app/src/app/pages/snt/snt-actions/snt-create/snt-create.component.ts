import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { SntActionMode, SntActionModeNames } from 'src/app/model/enums/SntActionMode';
import { finalize, takeUntil } from 'rxjs/operators';
import { SntActionsBase } from '../snt-actions-base/snt-actions.base';
import { SntActionsDependenciesBase } from '../snt-actions-base/snt-actions-dependencies.base';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';

@Component({
    selector: 'app-snt-create',
    templateUrl: '../snt-actions-base/snt-actions.template.html',
    styleUrls: ['../snt-actions-base/snt-actions.style.scss'],
    providers: [
        SntActionsDependenciesBase,
        {
            provide: SNTACTIONMODE,
            useValue: SntActionMode.Add
        }
    ],
    standalone: false
})

export class SntCreateComponent extends SntActionsBase implements OnInit, OnDestroy{

  constructor(
    public deps: SntActionsDependenciesBase,
    @Inject(SNTACTIONMODE) public mode: SntActionMode
  ){
      super(deps, mode)
  }

  ngOnInit() {
    this.isLoading = true;
    this.deps.titleService.setTitle(SntActionModeNames[0].name);
    this.loadInformation()
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.unsubscribe$))
      .subscribe(
        ([stores, units, favouriteMeasureUnits, currencies, favouriteCurrencies, countries, favouriteCountries]) => {
          this.deps.sntFacade.fixedSnt = false;
          this.warehouses = stores;
          this.measureUnits = units;
          this.favouriteMeasureUnits = favouriteMeasureUnits
          this.currencies = currencies;
          this.favouriteCurrencies = favouriteCurrencies;
          this.countries = countries;
          this.favouriteCountries = favouriteCountries;

          let lastStore = this.warehouses[this.warehouses.length - 1];
          (this.deps.draftSntForm.get('seller.taxpayerStoreId') as UntypedFormControl).setValue(lastStore.id, { onlySelf: true, emitEvent: false });
          (this.deps.draftSntForm.get('seller.actualAddress') as UntypedFormControl).setValue(lastStore.address, { onlySelf: true, emitEvent: false })
        });

    this.deps.draftSntForm.get('seller').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(_ => { this.deps.draftSntForm.get('transferType').updateValueAndValidity(); });

    this.deps.draftSntForm.get('customer').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(_ => { this.deps.draftSntForm.get('transferType').updateValueAndValidity(); });

    this.deps.draftSntForm.markAllAsTouched();    
  }
  DateFilter = (_d: Date | null): boolean => {
    return true
  }
  
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
