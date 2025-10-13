import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BiddingReport } from '../../features/home/reports/bidding-report.interface';
import { BiddingReportHistoryEntry } from '../../features/home/reports/report-history-entry.interface';
import { ApiService } from './api.base';

@Injectable({ providedIn: 'root' })
export class ApiEndpointService {
  constructor(private readonly api: ApiService) {}

  getBiddingReports(filters?: { month?: string | null; year?: number | null }): Observable<BiddingReport[]> {
    const month = filters?.month ?? null;
    const year = filters?.year ?? null;

    if (month && year !== null && year !== undefined) {
      const params = new URLSearchParams({
        month: month.toLowerCase(),
        year: String(year)
      });

      return this.api.get<BiddingReport[]>(`/BiddingReports?${params.toString()}`);
    }

    return this.api.get<BiddingReport[]>('/BiddingReports');
  }

  getBiddingReport(reportId: number): Observable<BiddingReport> {
    return this.api.get<BiddingReport>(`/BiddingReports/${reportId}`);
  }

  getBiddingReportHistory(reportId: number): Observable<BiddingReportHistoryEntry[]> {
    return this.api.get<BiddingReportHistoryEntry[]>(`/BiddingReports/${reportId}/history`);
  }
}
