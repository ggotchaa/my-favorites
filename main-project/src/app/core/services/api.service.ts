import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BiddingReport } from '../../features/home/reports/bidding-report.interface';
import { ApiService } from './api.base';

@Injectable({ providedIn: 'root' })
export class ApiEndpointService {
  constructor(private readonly api: ApiService) {}

  getBiddingReports(filters?: { month?: number | null; year?: number | null }): Observable<BiddingReport[]> {
    const month = filters?.month ?? null;
    const year = filters?.year ?? null;

    if (month !== null && year !== null) {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year)
      });

      return this.api.get<BiddingReport[]>(`/BiddingReports/by-month?${params.toString()}`);
    }

    return this.api.get<BiddingReport[]>('/BiddingReports');
  }

  getBiddingReport(reportId: number): Observable<BiddingReport> {
    return this.api.get<BiddingReport>(`/BiddingReports/${reportId}`);
  }
}
