import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailsDialogComponent } from './reports/report-details-dialog/report-details-dialog.component';
import { TenderAwardsComponent } from './tender-awards/tender-awards.component';
import { TenderStatusDialogComponent } from './tender-awards/status-change-dialog/tender-status-dialog.component';
import { CustomerListComponent } from './customer-list/customer-list.component';

@NgModule({
  declarations: [
    HomePageComponent,
    ReportsComponent,
    ReportDetailsDialogComponent,
    TenderAwardsComponent,
    TenderStatusDialogComponent,
    CustomerListComponent,
  ],
  imports: [SharedModule, HomeRoutingModule],
})
export class HomeModule {}
