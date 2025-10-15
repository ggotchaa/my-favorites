import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FormsActionsBase } from '../forms-actions-base/forms-actions.base';
import { FormsActionsDependenciesBase } from '../forms-actions-base/forms-actions-dependencies.base';
import { CountryDto, UFormFullDto } from '../../../../api/GCPClient';
import { switchMap, takeUntil } from 'rxjs/operators';
import { FormActionMode, FormActionModeNames } from 'src/app/model/enums/UForms/FormActionMode';
import { MeasureUnitDto, TaxpayerStoreSimpleDto,CompanyOptions } from "src/app/api/GCPClient";
import { FORMACTIONMODE } from 'src/app/shared/tokens/form-action-mode.token';

@Component({
    selector: 'app-form-show',
    templateUrl: '../forms-actions-base/forms-actions.template.html',
    styleUrls: ['../forms-actions-base/forms-actions.style.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'ru-Ru' },
        FormsActionsDependenciesBase,
        {
            provide: FORMACTIONMODE,
            useValue: FormActionMode.Show
        }
    ],
    standalone: false
})

export class FormShowComponent extends FormsActionsBase implements OnInit, OnDestroy {

  constructor(
    public deps: FormsActionsDependenciesBase,
    @Inject(FORMACTIONMODE) public mode: FormActionMode) {
      super(deps, mode);
  }

  setInformation(stores: TaxpayerStoreSimpleDto[], companyOptions: CompanyOptions, measureUnits: MeasureUnitDto[], countries?: CountryDto[]) {
    this.warehouses = stores;
    this.deps.formsForm.get('requisites').patchValue(companyOptions);
    this.measureUnits = measureUnits;
    this.countries = countries
  }
  
  ngOnInit() {
    this.deps.titleService.setTitle(FormActionModeNames[2].name);
    this.isSaveAvailable = false;
    this.id = this.deps.route.snapshot.params['id'];    
    
    this.loadInformation()
      .pipe(        
        switchMap(([stores, user, units, countries]) => {
          this.setInformation(stores, user, units, countries);
          return this.getForm();
        }),
        takeUntil(this.unsubscribe$))
      .subscribe(
        (form: UFormFullDto) => {     
          this.isLoading = false     
          this.setFormValues(form);
          this.deps.formsForm.disable();    
        });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
