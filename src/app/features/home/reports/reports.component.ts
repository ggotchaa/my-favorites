import { Component } from '@angular/core';
import { BiddingReport } from './bidding-report.interface';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  readonly reports: BiddingReport[] = [];
}
