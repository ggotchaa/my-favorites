import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FormsActionsBase } from '../forms-actions-base/forms-actions.base';
import { FormsActionsDependenciesBase } from '../forms-actions-base/forms-actions-dependencies.base';
import { UFormFullDto } from '../../../../api/GCPClient';
import { switchMap, takeUntil } from 'rxjs/operators';
import { FormActionMode, FormActionModeNames } from 'src/app/model/enums/UForms/FormActionMode';
import { UntypedFormGroup } from '@angular/forms';
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
            useValue: FormActionMode.Edit
        }
    ],
    standalone: false
})

export class FormEditComponent extends FormsActionsBase implements OnInit, OnDestroy {

  constructor(
    public deps: FormsActionsDependenciesBase,
    @Inject(FORMACTIONMODE) public mode: FormActionMode) {
      super(deps, mode);
  }

   ngOnInit() {    
    this.deps.titleService.setTitle(FormActionModeNames[1].name);
     this.id = this.deps.route.snapshot.params['id'];     
     this.loadInformation()
       .pipe(
         switchMap(([stores, user, units,countries, favouriteUnits, favouriteCountries]) => {
           this.setInformation(stores, user, units, countries, favouriteUnits, favouriteCountries);
           return this.getForm();
         }),
         takeUntil(this.unsubscribe$))
       .subscribe((form: UFormFullDto) => {
         this.isLoading = false
         this.setFormValues(form);
         this.deps.formsForm.get('typeForm').disable();
         this.markFormGroupTouched(this.deps.formsForm);
         });     
  }

  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
