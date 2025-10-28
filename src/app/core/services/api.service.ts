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
  CalculateRollingFactorByBiddingProposalsCommand,
  CreateBiddingReportCommand,
  CreateExceptionReportResultDto,
  CustomersBiddingDataRequestBaseDto,
  CustomersBiddingDataRequestDto,
  CustomersListDtoPagedResult,
  GetBiddingDataCustomerDto,
  ReportApproversDto,
  SetApproversDto,
} from './api.types';

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

      return this.api
        .get<BiddingReportDto[]>(`/BiddingReports?${params.toString()}`)
        .pipe(map((reports) => reports.map((report) => this.mapBiddingReport(report))));
    }

    return this.api
      .get<BiddingReportDto[]>('/BiddingReports')
      .pipe(map((reports) => reports.map((report) => this.mapBiddingReport(report))));
  }

  getBiddingReportDetails(reportId: number): Observable<BiddingReportDetail[]> {
    return this.api
      .get<BiddingDataDto[]>(`/BiddingReports/${reportId}/details`)
      .pipe(map((details) => details.map((detail) => this.mapBiddingReportDetail(detail))));
  }

  getBiddingReportHistory(reportId: number): Observable<BiddingReportHistoryEntry[]> {
    return this.api
      .get<BiddingHistoryAnalysisDto[]>(`/BiddingReports/${reportId}/history`)
      .pipe(map((history) => history.map((entry) => this.mapHistoryEntry(entry))));
  }

  setReportApprovers(reportId: number, approvers: SetApproversDto[]): Observable<void> {
    return this.api
      .put<unknown>(`/Approval/${reportId}/approvers`, approvers)
      .pipe(map(() => undefined));
  }

  getReportApprovers(reportId: number): Observable<ReportApproversDto[]> {
    return this.api.get<ReportApproversDto[]>(`/Approval/${reportId}/approvers`);
  }

  startApprovalFlow(reportId: number): Observable<void> {
    return this.api
      .post<unknown>(`/Approval/${reportId}/approval-flow/start`)
      .pipe(map(() => undefined));
  } // on click send for approval just trigger this, intead modal etc logic 


  approveApprovalFlow(reportId: number): Observable<void> {
    return this.api
      .post<unknown>(`/Approval/${reportId}/approval-flow/approve`)
      .pipe(map(() => undefined));
  }

  getAribaProposals(period: string): Observable<AribaProposalDto[]> {
    return this.api.get<AribaProposalDto[]>('/AribaProposals/proposals', {
      params: { period }
    });
  }

  createBiddingReport(payload: CreateBiddingReportCommand): Observable<BiddingReport> {
    return this.api
      .post<BiddingReportDto>('/BiddingReports', payload)
      .pipe(map((report) => this.mapBiddingReport(report)));
  }

  deleteBiddingReport(reportId: number): Observable<void> {
    return this.api.delete<unknown>(`/BiddingReports/${reportId}`).pipe(map(() => undefined));
  } //delete icon available only for statuses: except completed||closed

  unlockBiddingReport(reportId: number): Observable<BiddingReport> {
    return this.api
      .post<BiddingReportDto>(`/BiddingReports/${reportId}/unlock`)
      .pipe(map((report) => this.mapBiddingReport(report)));
  } // only for statuses completed||closed 

  createExceptionReport(reportId: number): Observable<CreateExceptionReportResultDto> {
    return this.api.post<CreateExceptionReportResultDto>(`/BiddingReports/${reportId}/exception`);
  } // column, click availble only for  "isExceptionReport": false,

  updateBiddingProposals(
    payload: CalculateRollingFactorByBiddingProposalsCommand
  ): Observable<string> {
    return this.api.put<string>('/BiddingReports/proposals', payload);
  }

  analyzeShipments(payload: AnalyzeShipmentsAndHistoryCommand): Observable<string> {
    return this.api.put<string>('/BiddingReports/shipments', payload);
  }

  getBiddingDetailsByProduct(
    product: string,
    month: string,
    year: number
  ): Observable<BiddingDataDto[]> {
    return this.api.get<BiddingDataDto[]>(
      `/BiddingReports/details/product/${encodeURIComponent(product)}/month/${encodeURIComponent(month)}/year/${year}`
    );
  }

  getCustomerBiddingData(
    customerName: string,
    period: string
  ): Observable<GetBiddingDataCustomerDto[]> {
    return this.api.get<GetBiddingDataCustomerDto[]>(`/BiddingReports/${encodeURIComponent(customerName)}/customer-data`, {
      params: { period }
    });
  }

  searchCustomers(payload: CustomersBiddingDataRequestDto): Observable<CustomersListDtoPagedResult> {
    return this.api.post<CustomersListDtoPagedResult>('/Customers/search', payload);
  }

  exportCustomers(payload: CustomersBiddingDataRequestBaseDto): Observable<Blob> {
    return this.api.post<Blob>('/Customers/export', payload, {
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

    return this.api.get<string[]>('/Customers/lookup', { params });
  }

  getApproverGroups(): Observable<ApproversDto[]> {
    return this.api.get<ApproversDto[]>('/Groups/approvers');
  }

  getDelegateGroups(): Observable<ApproversDto[]> {
    return this.api.get<ApproversDto[]>('/Groups/delegates');
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
      biddingHistoryAnalysis: null,
      previousReportLink: null,
      filePath: '',
      fileName: '',
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
}
