import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailsDialogComponent } from './reports/report-details-dialog/report-details-dialog.component';
import { ReportBiddingDetailsComponent } from './reports/report-bidding-details/report-bidding-details.component';
import { ReportApprovalsDialogComponent } from './reports/report-approvals-dialog/report-approvals-dialog.component';
import { NewExceptionReportComponent } from './reports/new-exception-report/new-exception-report.component';
import { TenderAwardsComponent } from './tender-awards/tender-awards.component';
import { TenderStatusDialogComponent } from './tender-awards/status-change-dialog/tender-status-dialog.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerListFiltersComponent } from './customer-list/customer-list-filters/customer-list-filters.component';
import { SendForApprovalDialogComponent } from './tender-awards/send-for-approval-dialog/send-for-approval-dialog.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { AuditLogFiltersComponent } from './audit-log/audit-log-filters/audit-log-filters.component';
import { MaterializeConfirmationDialogComponent } from './audit-log/materialize-confirmation-dialog/materialize-confirmation-dialog.component';
import { ViewProposalsDialogComponent } from './tender-awards/view-proposals-dialog/view-proposals-dialog.component';
import { ManageApproversDialogComponent } from './tender-awards/manage-approvers-dialog/manage-approvers-dialog.component';
import { TenderCommentsDialogComponent } from './tender-awards/comments-dialog/tender-comments-dialog.component';
import { HistoryCustomerDialogComponent } from './tender-awards/history-customer-dialog/history-customer-dialog.component';

@NgModule({
  declarations: [
    HomePageComponent,
    ReportsComponent,
    ReportDetailsDialogComponent,
    ReportBiddingDetailsComponent,
    ReportApprovalsDialogComponent,
    NewExceptionReportComponent,
    TenderAwardsComponent,
    TenderStatusDialogComponent,
    CustomerListComponent,
    CustomerListFiltersComponent,
    SendForApprovalDialogComponent,
    AuditLogComponent,
    AuditLogFiltersComponent,
    MaterializeConfirmationDialogComponent,
    ViewProposalsDialogComponent,
    ManageApproversDialogComponent,
    TenderCommentsDialogComponent,
    HistoryCustomerDialogComponent,
  ],
  imports: [SharedModule, HomeRoutingModule],
})
export class HomeModule {}
