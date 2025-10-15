import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SntCreateComponent } from './snt-actions/snt-create/snt-create.component';
import { RouterModule, Routes } from '@angular/router';
import { SntRoutingModule } from './snt-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MaterialModule } from 'src/app/materialModule.component';
import { SntFacade } from './snt.facade';
import { SntSectionAComponent } from './snt-sections/snt-section-a/snt-section-a.component';
import { SntSectionFComponent } from './snt-sections/snt-section-f/snt-section-f.component';
import { SntSectionEComponent } from './snt-sections/snt-section-e/snt-section-e.component';
import { SntSectionDComponent } from './snt-sections/snt-section-d/snt-section-d.component';
import { SntSectionBComponent } from './snt-sections/snt-section-b/snt-section-b.component';
import { SntSectionCComponent } from './snt-sections/snt-section-c/snt-section-c.component';
import { SntSectionGComponent } from './snt-sections/snt-section-g/snt-section-g.component';
import { SntEditComponent } from './snt-actions/snt-edit/snt-edit.component';
import { SntShowComponent } from './snt-actions/snt-show/snt-show.component';
import { SntCorrectionComponent } from './snt-actions/snt-correction/snt-correction.component';
import { SntActionsDependenciesBase } from './snt-actions/snt-actions-base/snt-actions-dependencies.base';
import { SntSectionCurrencyComponent } from './snt-sections/snt-section-currency/snt-section-currency.component';
import { SntComponent } from './snt.component';
import { PagesModule } from '../pages.module';
import { SntFiltersComponent } from './snt-filters/snt-filters.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SntClient } from 'src/app/api/GCPClient';
import { SntSectionG6Component } from './snt-sections/snt-section-g6/snt-section-g6.component';
import { SntSectionG10Component } from './snt-sections/snt-section-g10/snt-section-g10.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SntBtnVisibilityService } from './snt-btn-visibility.service';
import { SntProductFormService } from './services/SntProductFormService';
import { SntCopyComponent } from './snt-actions/snt-copy/snt-copy.component';



@NgModule({
    declarations: [
        SntComponent,
        SntCreateComponent,
        SntSectionAComponent,
        SntSectionBComponent,
        SntSectionFComponent,
        SntSectionEComponent,
        SntSectionCComponent,
        SntSectionDComponent,
        SntSectionGComponent,
        SntEditComponent,
        SntShowComponent,
        SntCorrectionComponent,
        SntSectionCurrencyComponent,
        SntFiltersComponent,
        SntSectionG6Component,
        SntSectionG10Component,
        SntCopyComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        SntRoutingModule,
        PagesModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatIconModule,
        MatListModule,
        MaterialModule,
        SharedModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [
        SntClient,
        SntFacade,
        SntActionsDependenciesBase,
        SntBtnVisibilityService,
        SntProductFormService
    ]
})
export class SntModule { }
