import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  calCanActivateChildGuard,
  calCanActivateGuard,
} from '../../core/guards/cal-auth.guard';

import { CustomerListComponent } from './customer-list/customer-list.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ReportsComponent } from './reports/reports.component';
import { TenderAwardsComponent } from './tender-awards/tender-awards.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { NewExceptionReportComponent } from './reports/new-exception-report/new-exception-report.component';
import { ReportBiddingDetailsComponent } from './reports/report-bidding-details/report-bidding-details.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    canActivate: [calCanActivateGuard],
    canActivateChild: [calCanActivateChildGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'reports',
      },
      {
        path: 'reports/new-exception',
        component: NewExceptionReportComponent,
        data: { tab: 'reports' },
      },
      {
        path: 'reports/:reportId/details',
        component: ReportBiddingDetailsComponent,
        data: { tab: 'reports' },
      },
      {
        path: 'reports',
        component: ReportsComponent,
        data: { tab: 'reports' },
      },
      {
        path: 'tender-awards',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'active',
          },
          {
            path: ':tab',
            component: TenderAwardsComponent,
            data: { tab: 'tender-awards' },
          },
          {
            path: ':tab/report/:reportId',
            component: TenderAwardsComponent,
            data: { tab: 'tender-awards' },
          },
        ],
      },
      {
        path: 'audit-log',
        component: AuditLogComponent,
        data: { tab: 'audit-log' },
      },
      {
        path: 'customers',
        component: CustomerListComponent,
        data: { tab: 'customers' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
