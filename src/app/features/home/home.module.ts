import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../shared/material/material.module';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailsDialogComponent } from './reports/report-details-dialog/report-details-dialog.component';
import { HomeFiltersService } from './services/home-filters.service';
import { TenderAwardsComponent } from './tender-awards/tender-awards.component';
import { TenderStatusDialogComponent } from './tender-awards/status-change-dialog/tender-status-dialog.component';

@NgModule({
  declarations: [
    HomePageComponent,
    ReportsComponent,
    ReportDetailsDialogComponent,
    CustomerListComponent,
    TenderAwardsComponent,
    TenderStatusDialogComponent
  ],
  imports: [CommonModule, FormsModule, HomeRoutingModule, MaterialModule],
  providers: [HomeFiltersService]
})
export class HomeModule {}