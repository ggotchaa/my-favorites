import { Routes } from '@angular/router';

import { CustomerListComponent } from './customer-list/customer-list.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ReportsComponent } from './reports/reports.component';
import { TenderAwardsComponent } from './tender-awards/tender-awards.component';

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'reports',
      },
      {
        path: 'reports',
        component: ReportsComponent,
        data: { tab: 'reports' },
      },
      {
        path: 'tender-awards',
        component: TenderAwardsComponent,
        data: { tab: 'tender-awards' },
      },
      {
        path: 'customers',
        component: CustomerListComponent,
        data: { tab: 'customers' },
      },
    ],
  },
];
