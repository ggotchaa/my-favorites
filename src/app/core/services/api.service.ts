import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BiddingReport } from '../../features/home/reports/bidding-report.interface';
import { BiddingReportHistoryEntry } from '../../features/home/reports/report-history-entry.interface';
import { ApiService } from './api.base';

@Injectable({ providedIn: 'root' })
export class ApiEndpointService {
  constructor(private readonly api: ApiService) {}

  getBiddingReports(filters?: { month?: number | null; year?: number | null }): Observable<BiddingReport[]> {
    const rawMonth = filters?.month ?? null;
    const rawYear = filters?.year ?? null;

    const hasMonth = typeof rawMonth === 'number' && Number.isInteger(rawMonth) && rawMonth >= 1 && rawMonth <= 12;
    const hasYear = typeof rawYear === 'number' && Number.isInteger(rawYear);

    if (hasMonth && hasYear) {
      const params = new URLSearchParams({
        month: String(rawMonth),
        year: String(rawYear)
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
