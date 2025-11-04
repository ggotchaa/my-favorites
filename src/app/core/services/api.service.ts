import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BiddingReport } from '../../features/home/reports/bidding-report.interface';
import { BiddingReportHistoryEntry } from '../../features/home/reports/report-history-entry.interface';
import { BiddingReportDetail } from '../../features/home/tender-awards/bidding-report-detail.interface';
import { ApiService } from './api.base';
import {
  AnalyzeShipmentsAndHistoryCommand,
  ApproversDto,
  AribaProposalDto,
  BiddingDataDto,
  BiddingHistoryAnalysisDto,
  BiddingReportDto,
  BiddingReportSummaryDto,
  CalculateRollingFactorByBiddingProposalsCommand,
  CreateBiddingReportCommand,
  CreateExceptionReportResultDto,
  CustomersBiddingDataRequestBaseDto,
  CustomersBiddingDataRequestDto,
  CustomersListDtoPagedResult,
  GetBiddingDataCustomerDto,
  GetBiddingReportDetailsResponse,
  ReportApproversDto,
  SetApproversDto,
  UpdateBiddingDataForExceptionReportCommand,
} from './api.types';

export interface BiddingReportDetailsResult {
  details: BiddingReportDetail[];
  summaries: BiddingReportSummaryDto[];
  reportFileName: string | null;
  reportFilePath: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiEndpointService {
  constructor(private readonly api: ApiService) {}

  getBiddingReports(filters?: { month?: number | null; year?: number | null }): Observable<BiddingReport[]> {
    const rawMonth = filters?.month ?? null;
    const rawYear = filters?.year ?? null;

    const hasMonth = typeof rawMonth === 'number' && Number.isInteger(rawMonth) && rawMonth >= 1 && rawMonth <= 12;
    const hasYear = typeof rawYear === 'number' && Number.isInteger(rawYear);

    const params = new URLSearchParams();

    if (hasMonth) {
      params.append('month', String(rawMonth));
    }

    if (hasYear) {
      params.append('year', String(rawYear));
    }

    const query = params.toString();
    const url = query ? `/api/BiddingReports?${query}` : '/api/BiddingReports';

    return this.api
      .get<BiddingReportDto[]>(url)
      .pipe(map((reports) => reports.map((report) => this.mapBiddingReport(report))));
  }

  getBiddingReportDetails(
    reportId: number,
    options?: { isExceptionReport?: boolean }
  ): Observable<BiddingReportDetailsResult> {
    const params: Record<string, string> = {};

    if (typeof options?.isExceptionReport === 'boolean') {
      params['isExceptionReport'] = String(options.isExceptionReport);
    }

    const requestConfig = Object.keys(params).length ? { params } : undefined;

    return this.api
      .get<GetBiddingReportDetailsResponse>(`/api/BiddingReports/${reportId}/details`, requestConfig)
      .pipe(
        map((response) => ({
          details: (response.biddingData ?? []).map((detail) => this.mapBiddingReportDetail(detail)),
          summaries: response.summaries ?? [],
          reportFileName: response.reportFileName ?? null,
          reportFilePath: response.reportFilePath ?? null,
        }))
      );
  }

  getBiddingReportSummary(reportId: number): Observable<BiddingReportSummaryDto[]> {
    return this.api.get<BiddingReportSummaryDto[]>(`/api/BiddingReports/${reportId}/summary`);
  }

  getBiddingReportHistory(
    reportId: number,
    options?: { isExceptionReport?: boolean }
  ): Observable<BiddingReportHistoryEntry[]> {
    const params: Record<string, string> = {};

    if (typeof options?.isExceptionReport === 'boolean') {
      params['isExceptionReport'] = String(options.isExceptionReport);
    }

    const requestConfig = Object.keys(params).length ? { params } : undefined;

    return this.api
      .get<BiddingHistoryAnalysisDto[]>(`/api/BiddingReports/${reportId}/history`, requestConfig)
      .pipe(map((history) => history.map((entry) => this.mapHistoryEntry(entry))));
  }

  setReportApprovers(reportId: number, approvers: SetApproversDto[]): Observable<void> {
    return this.api
      .put<unknown>(`/api/Approval/${reportId}/approvers`, approvers)
      .pipe(map(() => undefined));
  }

  getReportApprovers(reportId: number): Observable<ReportApproversDto[]> {
    return this.api.get<ReportApproversDto[]>(`/api/Approval/${reportId}/approvers`);
  }

  startApprovalFlow(reportId: number): Observable<void> {
    return this.api
      .post<unknown>(`/api/Approval/${reportId}/approval-flow/start`)
      .pipe(map(() => undefined));
  } // on click send for approval just trigger this, intead modal etc logic


  approveApprovalFlow(reportId: number): Observable<void> {
    return this.api
      .post<unknown>(`/api/Approval/${reportId}/approval-flow/approve`)
      .pipe(map(() => undefined));
  }

  getAribaProposals(period: string): Observable<AribaProposalDto[]> {
    return this.api.get<AribaProposalDto[]>('/api/AribaProposals/proposals', {
      params: { period }
    });
  }

  createBiddingReport(payload: CreateBiddingReportCommand): Observable<BiddingReport> {
    return this.api
      .post<BiddingReportDto>('/api/BiddingReports', payload)
      .pipe(map((report) => this.mapBiddingReport(report)));
  }

  deleteBiddingReport(reportId: number): Observable<void> {
    return this.api.delete<unknown>(`/api/BiddingReports/${reportId}`).pipe(map(() => undefined));
  } //delete icon available only for statuses: except completed||closed

  unlockBiddingReport(reportId: number): Observable<BiddingReport> {
    return this.api
      .post<BiddingReportDto>(`/api/BiddingReports/${reportId}/unlock`)
      .pipe(map((report) => this.mapBiddingReport(report)));
  } // only for statuses completed||closed

  createExceptionReport(reportId: number): Observable<CreateExceptionReportResultDto> {
    return this.api.post<CreateExceptionReportResultDto>(`/api/BiddingReports/${reportId}/exception`);
  } // column, click availble only for  "isExceptionReport": false,

  updateExceptionReport(
    payload: UpdateBiddingDataForExceptionReportCommand
  ): Observable<void> {
    return this.api
      .put<unknown>('/api/BiddingData/exceptionReport', payload)
      .pipe(map(() => undefined));
  }

  updateBiddingProposals(
    payload: CalculateRollingFactorByBiddingProposalsCommand
  ): Observable<string> {
    return this.api.put<string>('/api/BiddingReports/proposals', payload);
  }

  analyzeShipments(payload: AnalyzeShipmentsAndHistoryCommand): Observable<string> {
    return this.api.put<string>('/api/BiddingReports/shipments', payload);
  }

  getCustomerBiddingData(
    customerName: string,
    period: string
  ): Observable<GetBiddingDataCustomerDto[]> {
    return this.api.get<GetBiddingDataCustomerDto[]>(`/api/BiddingReports/${encodeURIComponent(customerName)}/customer-data`, {
      params: { period }
    });
  }

  searchCustomers(payload: CustomersBiddingDataRequestDto): Observable<CustomersListDtoPagedResult> {
    return this.api.post<CustomersListDtoPagedResult>('/api/Customers/search', payload);
  }

  exportCustomers(payload: CustomersBiddingDataRequestBaseDto): Observable<Blob> {
    return this.api.post<Blob>('/api/Customers/export', payload, {
      responseType: 'blob'
    });
  }

  lookupCustomers(options?: {
    searchValue?: string;
    take?: number;
    isActive?: boolean;
  }): Observable<string[]> {
    const params: Record<string, string> = {};

    if (options?.searchValue) {
      params['SearchValue'] = options.searchValue;
    }

    if (typeof options?.take === 'number') {
      params['Take'] = String(options.take);
    }

    if (typeof options?.isActive === 'boolean') {
      params['IsActive'] = String(options.isActive);
    }

    return this.api.get<string[]>('/api/Customers/lookup', { params });
  }

  getApproverGroups(): Observable<ApproversDto[]> {
    return this.api.get<ApproversDto[]>('/api/Groups/approvers');
  }

  getDelegateGroups(): Observable<ApproversDto[]> {
    return this.api.get<ApproversDto[]>('/api/Groups/delegates');
  }

  private mapBiddingReport(report: BiddingReportDto): BiddingReport {
    return {
      id: report.id ?? 0,
      reportName: report.reportName ?? '',
      reportMonth: report.reportMonth ?? '',
      reportYear: report.reportYear ?? 0,
      reportDate: report.reportDate ?? '',
      status: report.status ?? '',
      totalButaneVolume: report.totalButaneVolume ?? 0,
      totalPropaneVolume: report.totalPropaneVolume ?? 0,
      weightedAvgButanePrice: report.weightedAvgButanePrice ?? null,
      weightedAvgPropanePrice: report.weightedAvgPropanePrice ?? null,
      weightedTotalPrice: report.weightedTotalPrice ?? null,
      biddingHistoryAnalysis: this.resolveBiddingHistoryAnalysis(report.biddingHistoryAnalysis),
      previousReportLink: null,
      filePath: report.filePath ?? '',
      fileName: report.fileName ?? '',
      totalVolume: report.totalVolume ?? 0,
      isExceptionReport: report.isExceptionReport ?? undefined,
      createdBy: report.createdBy ?? undefined,
      dateCreated: report.dateCreated ?? undefined,
    };
  }

  private mapHistoryEntry(entry: BiddingHistoryAnalysisDto): BiddingReportHistoryEntry {
    return {
      id: entry.id ?? 0,
      biddingReportId: entry.biddingReportId ?? 0,
      customerName: entry.customerName ?? '',
      biddingMonth: entry.biddingMonth ?? '',
      biddingYear: entry.biddingYear ?? 0,
      takenPR: entry.takenPR ?? 0,
      takenBT: entry.takenBT ?? 0,
      oneMonthPerformanceScore: entry.oneMonthPerformanceScore ?? 0,
      finalAwardedPR: entry.finalAwardedPR ?? 0,
      finalAwardedBT: entry.finalAwardedBT ?? 0,
      status: entry.status ?? '',
      comments: entry.comments ?? null,
      additionalVolumePR: entry.additionalVolumePR ?? 0,
      additionalVolumeBT: entry.additionalVolumeBT ?? 0,
      volumePR: entry.volumePR ?? 0,
      volumeBT: entry.volumeBT ?? 0,
      isDeleted: entry.isDeleted ?? false,
      deletedDate: entry.deletedDate ?? null,
      deletedBy: entry.deletedBy ?? null,
    };
  }

  private mapBiddingReportDetail(detail: BiddingDataDto): BiddingReportDetail {
    return {
      id: detail.id ?? 0,
      biddingReportId: detail.biddingReportId ?? 0,
      product: detail.product ?? '',
      bidder: detail.bidder ?? '',
      status: detail.status ?? '',
      year: detail.year ?? 0,
      month: detail.month ?? '',
      differentialPrice: detail.differentialPrice ?? 0,
      bidPrice: detail.bidPrice ?? 0,
      bidVolume: detail.bidVolume ?? 0,
      rankPerPrice: detail.rankPerPrice ?? 0,
      rollingLiftFactor: detail.rollingLiftFactor ?? 0,
      awardedVolume: detail.awardedVolume ?? 0,
      finalAwardedVolume: detail.finalAwardedVolume ?? 0,
      comments: detail.comments ?? '',
      biddingDate: detail.biddingDate ?? '',
      reportDate: detail.reportDate ?? '',
    };
  }

  calculateReportSummary(reportId: number): Observable<void> {
    return this.api
      .put<unknown>('/api/BiddingReports/calculateSummary', { biddingReportId: reportId })
      .pipe(map(() => undefined));
  }

  private resolveBiddingHistoryAnalysis(
    analysis: BiddingReportDto['biddingHistoryAnalysis']
  ): string | null {
    if (typeof analysis === 'string') {
      return analysis;
    }

    if (analysis && typeof analysis === 'object' && 'comments' in analysis) {
      const possibleComment = (analysis as { comments?: unknown }).comments;
      if (typeof possibleComment === 'string') {
        return possibleComment;
      }
    }

    return null;
  }
}
