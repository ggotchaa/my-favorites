import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { SntDraftDto, SntFullDto } from 'src/app/api/GCPClient';
import { SntActionMode, SntActionModeNames } from 'src/app/model/enums/SntActionMode';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntSectionAValidators } from '../../snt-sections/snt-section-a/snt-section-a.validators';
import { SntActionsDependenciesBase } from '../snt-actions-base/snt-actions-dependencies.base';
import { SntActionsBase } from '../snt-actions-base/snt-actions.base';

@Component({
    selector: 'app-snt-correction',
    templateUrl: '../snt-actions-base/snt-actions.template.html',
    styleUrls: ['../snt-actions-base/snt-actions.style.scss'],
    providers: [
        SntActionsDependenciesBase,
        {
            provide: SNTACTIONMODE,
            useValue: SntActionMode.Correction
        }
    ],
    standalone: false
})
export class SntCorrectionComponent extends SntActionsBase implements OnInit, OnDestroy{

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
    this.deps.titleService.setTitle(SntActionModeNames[3].name);

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
          this.deps.sntFacade.isFixedSnt(snt);
          this.sntFullDto = snt;

          const registrationNumberControl = this.deps.draftSntForm.get('registrationNumber');
          (this.deps.draftSntForm.get('relatedRegistrationNumber') as UntypedFormControl).setValue(registrationNumberControl.value, {onlySelf: true, emitEvent: false})
          registrationNumberControl.reset()

          this.setProducts(snt);
          this.setTransportTypes(snt.shippingInfo);
          this.setIsContract(snt);

          this.correctionRulesForSectionA();
          this.correctionRulesForSectionB();
          this.correctionRulesForSectionC();

          this.setSharingAgreementParticipant(snt);
         });         
  }

  getSntModel(): SntDraftDto {
    let model = super.getSntModel();
    model.id = null;
    model.relatedRegistrationNumber = this.deps.draftSntForm.get('relatedRegistrationNumber').value;
    return model;
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private correctionRulesForSectionB(): void {
    this.deps.draftSntForm.get('seller').disable();
  }
  DateFilter = (d: Date | null): boolean => {
    if(this.sntFullDto.shippingDate === undefined || this.sntFullDto.shippingDate === null) return true;
    return this.sntFullDto.shippingDate <= d;
  }
  private correctionRulesForSectionC():void {
    this.deps.draftSntForm.get('customer').disable()
  }

  private correctionRulesForSectionA(): void {
    const importType = this.deps.draftSntForm.get('importType');
    const exportType = this.deps.draftSntForm.get('exportType');
    const transferType = this.deps.draftSntForm.get('transferType');
    SntSectionAValidators.disableElements([
      importType,
      exportType,
      transferType
    ])

  }
}
