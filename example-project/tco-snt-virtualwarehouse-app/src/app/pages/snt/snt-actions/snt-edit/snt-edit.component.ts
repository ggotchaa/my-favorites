import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { SntFullDto } from 'src/app/api/GCPClient';
import { SntActionMode, SntActionModeNames } from 'src/app/model/enums/SntActionMode';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntActionsDependenciesBase } from '../snt-actions-base/snt-actions-dependencies.base';
import { SntActionsBase } from '../snt-actions-base/snt-actions.base';

@Component({
    selector: 'app-snt-edit',
    templateUrl: '../snt-actions-base/snt-actions.template.html',
    styleUrls: ['../snt-actions-base/snt-actions.style.scss'],
    providers: [
        SntActionsDependenciesBase,
        {
            provide: SNTACTIONMODE,
            useValue: SntActionMode.Edit
        }
    ],
    standalone: false
})
export class SntEditComponent extends SntActionsBase implements OnInit, OnDestroy{

  constructor(
    public deps: SntActionsDependenciesBase,
    @Inject(SNTACTIONMODE) public mode: SntActionMode
  ){
      super(deps, mode)
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.deps.draftSntForm.markAllAsTouched();
    this.id = this.deps.route.snapshot.params['id'];
    this.deps.titleService.setTitle(SntActionModeNames[1].name);

    this.loadInformation()
       .pipe(
         switchMap(([stores, units, favouriteMeasureUnits, currencies, favouriteCurrencies, countries, favouriteCountries]) => {
            this.warehouses = stores;
            this.measureUnits = units;
            this.favouriteMeasureUnits = favouriteMeasureUnits
            this.currencies = currencies;
            this.favouriteCurrencies = favouriteCurrencies;
            this.countries = countries;
            this.favouriteCountries = favouriteCountries

           return this.getSnt();
         }),
         finalize(() => { this.isLoading = false; }),
         takeUntil(this.unsubscribe$))
       .subscribe(
         (snt: SntFullDto) => {           
          this.patchFormValue(snt);
          this.deps.sntFacade.isFixedSnt(snt);
          this.sntFullDto = snt
          this.setProducts(snt);
          this.setTransportTypes(snt.shippingInfo);
          this.setIsContract(snt);
          this.setSharingAgreementParticipant(snt);
         });         
  }

  DateFilter = (d: Date | null): boolean => {
    if(this.deps.sntFacade.fixedSnt){
      if(this.sntFullDto.shippingDate === undefined || this.sntFullDto.shippingDate === null) return true;
      return this.sntFullDto.shippingDate >= d;
    }
    return true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
