import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FormsActionsBase } from '../forms-actions-base/forms-actions.base';
import { FormsActionsDependenciesBase } from '../forms-actions-base/forms-actions-dependencies.base';
import {  takeUntil } from 'rxjs/operators';
import { FormActionMode, FormActionModeNames } from 'src/app/model/enums/UForms/FormActionMode';
import { FORMACTIONMODE } from 'src/app/shared/tokens/form-action-mode.token';

@Component({
    selector: 'app-form-create',
    templateUrl: '../forms-actions-base/forms-actions.template.html',
    styleUrls: ['../forms-actions-base/forms-actions.style.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'ru-Ru' },
        FormsActionsDependenciesBase,
        {
            provide: FORMACTIONMODE,
            useValue: FormActionMode.Add
        }
    ],
    standalone: false
})

export class FormCreateComponent extends FormsActionsBase implements OnInit, OnDestroy {

  constructor(
    public deps: FormsActionsDependenciesBase,
    @Inject(FORMACTIONMODE) public mode: FormActionMode
    ) {
    super(deps, mode);
  }

  ngOnInit() {    

    this.deps.titleService.setTitle(FormActionModeNames[0].name);
    this.loadInformation()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([stores, user, units, countries, favouriteUnits, favouriteCountries]) => {
        this.isLoading = false;
        this.setInformation(stores, user, units, countries, favouriteUnits, favouriteCountries);
      });

    this.deps.formsForm.markAllAsTouched();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
