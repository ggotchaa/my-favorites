import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { SntDraftDto, SntFullDto } from 'src/app/api/GCPClient';
import { SntActionMode, SntActionModeNames } from 'src/app/model/enums/SntActionMode';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntActionsDependenciesBase } from '../snt-actions-base/snt-actions-dependencies.base';
import { SntActionsBase } from '../snt-actions-base/snt-actions.base';

@Component({
    selector: 'app-snt-copy',
    templateUrl: '../snt-actions-base/snt-actions.template.html',
    styleUrls: ['../snt-actions-base/snt-actions.style.scss'],
    providers: [
        SntActionsDependenciesBase,
        {
            provide: SNTACTIONMODE,
            useValue: SntActionMode.Copy
        }
    ],
    standalone: false
})
export class SntCopyComponent extends SntActionsBase implements OnInit, OnDestroy{

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
    this.deps.titleService.setTitle(SntActionModeNames[4].name);

    this.loadInformation()
       .pipe(
         switchMap(([stores, units, favouriteMeasureUnits, currencies, favouriteCurrencies, countries, favouriteCountries]) => {
            this.warehouses = stores;
            this.measureUnits = units;
            this.favouriteMeasureUnits = favouriteMeasureUnits
            this.currencies = currencies
            this.favouriteCurrencies = favouriteCurrencies
            this.favouriteCountries = favouriteCountries
            this.countries = countries;

            return this.getSnt();
         }),
         finalize(() => { this.isLoading = false; }),
         takeUntil(this.unsubscribe$))
       .subscribe(
         (snt: SntFullDto) => {
          this.patchFormValue(snt);
          this.deps.sntFacade.fixedSnt = false;
          this.sntFullDto = snt;
          this.deps.draftSntForm.get('registrationNumber').reset();
          this.deps.draftSntForm.get('date').reset();

          this.setProducts(snt);
          this.setTransportTypes(snt.shippingInfo);
          this.setIsContract(snt);
          
          this.setSharingAgreementParticipant(snt);
         });         
  }

  getSntModel(): SntDraftDto {
    let model = super.getSntModel();
    model.id = null;
    return model;
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  DateFilter = (d: Date | null): boolean => {
    if(this.sntFullDto.shippingDate === undefined || this.sntFullDto.shippingDate === null) return true;
    return this.sntFullDto.shippingDate <= d;
  }
}
