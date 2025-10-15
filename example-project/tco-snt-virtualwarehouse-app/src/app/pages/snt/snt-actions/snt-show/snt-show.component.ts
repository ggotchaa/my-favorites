import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { SntActionMode, SntActionModeNames } from 'src/app/model/enums/SntActionMode';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntActionsDependenciesBase } from '../snt-actions-base/snt-actions-dependencies.base';
import { SntActionsBase } from '../snt-actions-base/snt-actions.base';

@Component({
    selector: 'app-snt-show',
    templateUrl: '../snt-actions-base/snt-actions.template.html',
    styleUrls: ['../snt-actions-base/snt-actions.style.scss'],
    providers: [
        SntActionsDependenciesBase,
        {
            provide: SNTACTIONMODE,
            useValue: SntActionMode.Show
        }
    ],
    standalone: false
})
export class SntShowComponent extends SntActionsBase implements OnInit, OnDestroy {
  constructor(
    public deps: SntActionsDependenciesBase,
    @Inject(SNTACTIONMODE) public mode: SntActionMode
  ){
      super(deps, mode)
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.id = this.deps.route.snapshot.params['id'];    
    this.deps.titleService.setTitle(SntActionModeNames[2].name);
    this.isActionButtonsAvailable = false;
    this.loadInformation()
       .pipe(
         switchMap(([stores, units, favouriteMeasureUnits, currencies,, countries]) => {
           this.warehouses = stores;
           this.measureUnits = units;
           this.favouriteMeasureUnits = favouriteMeasureUnits;
           this.countries = countries; 
           this.currencies = currencies;
           
           return this.getSnt();
         }),
         finalize(() => { this.isLoading = false; }),
         takeUntil(this.unsubscribe$)
      )
      .subscribe(snt => {
        this.patchFormValue(snt);
        this.deps.sntFacade.isFixedSnt(snt);
        this.setProducts(snt);
        this.setTransportTypes(snt.shippingInfo);
        this.setIsContract(snt);
        this.setSharingAgreementParticipant(snt);
        this.deps.draftSntForm.disable();
      })
  }

  DateFilter = (_d: Date | null): boolean => {
    return true;
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
