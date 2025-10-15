import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EInvoicingApiClient } from 'src/app/api/EInvoicingApiClient';
import { InvoicesClient, JdeClient } from 'src/app/api/GCPClient';
import { MaterialModule } from 'src/app/materialModule.component';
import { PagesModule } from 'src/app/pages/pages.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { InvoiceSectionAComponent } from './components/invoice-sections/invoice-section-a/invoice-section-a.component';
import { InvoiceSectionAEsfComponent } from './components/invoice-sections/invoice-section-a-esf/invoice-section-a-esf.component';
import { InvoiceSectionBComponent } from './components/invoice-sections/invoice-section-b/invoice-section-b.component';
import { InvoiceSectionCComponent } from './components/invoice-sections/invoice-section-c/invoice-section-c.component';
import { InvoiceSectionC1Component } from './components/invoice-sections/invoice-section-c1/invoice-section-c1.component';
import { InvoiceSectionDComponent } from './components/invoice-sections/invoice-section-d/invoice-section-d.component';
import { InvoiceSectionEComponent } from './components/invoice-sections/invoice-section-e/invoice-section-e.component';
import { InvoiceSectionFComponent } from './components/invoice-sections/invoice-section-f/invoice-section-f.component';
import { InvoiceSectionGComponent } from './components/invoice-sections/invoice-section-g/invoice-section-g.component';
import { InvoiceCreateComponent } from './invoice-actions/invoice-create/invoice-create.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceFacade } from './invoice.facade';
import { FilterComponent } from './components/filter/filter.component';
import { SiblingComponentsDataSharing } from '../../../../shared/services/sibling-components-data-sharing.service';
import { InvoiceEditComponent } from './invoice-actions/invoice-edit/invoice-edit.component';
import { InvoiceReadComponent } from './invoice-actions/invoice-read/invoice-read.component';
import { AutoCompleteSearchOrganizationComponent } from 'src/app/shared/components/auto-complete-search/auto-complete-search-organization/auto-complete-search-organization.component';
import { RendererService } from './services/renderer.service';
import { ReportComponent } from './components/report/report/report.component';
import { ArDraftsFilterComponent } from '../ar-module/ar-drafts/ar-drafts-filter/ar-drafts-filter.component';

@NgModule({
    declarations: [
        InvoiceCreateComponent,
        InvoiceSectionAComponent,
        InvoiceSectionAEsfComponent,
        InvoiceSectionBComponent,
        InvoiceSectionCComponent,
        InvoiceSectionFComponent,
        InvoiceSectionGComponent,
        InvoiceSectionEComponent,
        InvoiceSectionDComponent,
        InvoiceSectionC1Component,
        InvoiceEditComponent,
        InvoiceReadComponent,
        FilterComponent,
        AutoCompleteSearchOrganizationComponent,
        ReportComponent,
        ArDraftsFilterComponent
    ],
    imports: [
        InvoiceRoutingModule,
        CommonModule,
        RouterModule,
        PagesModule,
        MaterialModule,
        SharedModule
    ],
    providers: [
        EInvoicingApiClient,
        InvoicesClient,
        InvoiceFacade,
        JdeClient,
        SiblingComponentsDataSharing,
        RendererService
    ],
    exports: [
        InvoiceCreateComponent,
        InvoiceReadComponent,
        FilterComponent,
        AutoCompleteSearchOrganizationComponent,
        ReportComponent,
        ArDraftsFilterComponent
    ]
})
export class SharedInvoiceModule { }
