import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormCreateComponent } from './forms-actions/form-create/form-create.component';
import { FormRoutingModule } from './forms-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MaterialModule } from 'src/app/materialModule.component';
import { RouterModule } from '@angular/router';
import { FormSectionEComponent } from './form-sections/form-section-e/form-section-e.component';
import { FormSectionDComponent } from './form-sections/form-section-d/form-section-d.component';
import { FormSectionBComponent } from './form-sections/form-section-b/form-section-b.component';
import { FormSectionAComponent } from './form-sections/form-section-a/form-section-a.component';
import { FormsFacade } from './forms.facade';
import { FormsService } from './forms.service';
import { FormShowComponent } from './forms-actions/form-show/form-show.component';
import { FormEditComponent } from './forms-actions/form-edit/form-edit.component';
import { FormFiltersComponent } from './forms-filters/form-filters.component';
import { FormsComponent } from './forms.component';
import { SharedModule } from '../../shared/shared.module';
import { FormSectionE2Component } from './form-sections/form-section-e2/form-section-e2.component';


@NgModule({
  declarations: [
    FormsComponent,
    FormCreateComponent,
    FormShowComponent,
    FormEditComponent,
    FormSectionEComponent,
    FormSectionDComponent,
    FormSectionBComponent,
    FormSectionAComponent,
    FormFiltersComponent,
    FormSectionE2Component,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormRoutingModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MaterialModule,
    SharedModule
  ],
  providers:[
    FormsFacade,
    FormsService
  ]

})
export class FormModule {}

