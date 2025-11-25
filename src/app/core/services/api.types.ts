export type FilterOperator = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SortDirection = 0 | 1;
export interface AnalyzeShipmentsAndHistoryCommand {
  biddingReportId?: number;
}
export interface ApprovalHistory {
  id?: number;
  reportId?: number;
  eventTypeId?: number;
  comments?: string | null;
  actorUserId?: string;
  attempt?: number;
  dateCreated?: string;
  dateModified?: string | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
  report?: BiddingReport;
  eventType?: EventType;
  actorUser?: User;
}

export interface ApprovalHistoryDto {
  approverName?: string | null;
  action?: string | null;
  comment?: string | null;
  attempt?: number;
  date?: string | null;
}
export interface Approver {
  id?: number;
  reportId?: number;
  userId?: string;
  isEndorser?: boolean;
  delegateUserId?: string | null;
  dateCreated?: string;
  dateModified?: string | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
  report?: BiddingReport;
  user?: User;
  delegateUser?: User;
}
export interface ApproversDto {
  objectId?: string;
  displayName?: string | null;
}
export interface AribaEntryPricesDto {
  period?: string | null;
  minEntryPrice?: number | null;
  ansiButaneQuotation?: number | null;
}
export interface AribaProposalDto {
  product?: string | null;
  period?: string | null;
  name?: string | null;
  propaneVolumeTonnes?: number | null;
  propaneTenderPrice?: number | null;
  butaneVolumeTonnes?: number | null;
  butaneTenderPrice?: number | null;
  minEntryPrice?: number | null;
  ansiButaneQuotation?: number | null;
}
export interface BiddingDataDto {
  id?: number;
  biddingReportId?: number;
  product?: string | null;
  bidder?: string | null;
  status?: string | null;
  year?: number;
  month?: string | null;
  differentialPrice?: number | null;
  bidPrice?: number | null;
  bidVolume?: number | null;
  rankPerPrice?: number | null;
  rollingLiftFactor?: number | null;
  awardedVolume?: number | null;
  finalAwardedVolume?: number | null;
  comments?: string | null;
  biddingDate?: string | null;
  reportDate?: string | null;
}
export interface BiddingHistoryAnalysis {
  id?: number;
  biddingReportId?: number;
  customerName?: string | null;
  biddingMonth?: string | null;
  biddingYear?: number | null;
  takenPR?: number | null;
  takenBT?: number | null;
  oneMonthPerformanceScore?: number | null;
  finalAwardedPR?: number | null;
  finalAwardedBT?: number | null;
  status?: string | null;
  comments?: string | null;
  additionalVolumePR?: number | null;
  additionalVolumeBT?: number | null;
  volumePR?: number | null;
  volumeBT?: number | null;
  biddingReport?: BiddingReport;
}
export interface BiddingHistoryAnalysisDto {
  id?: number;
  biddingReportId?: number;
  customerName?: string | null;
  biddingMonth?: string | null;
  biddingYear?: number | null;
  takenPR?: number | null;
  takenBT?: number | null;
  oneMonthPerformanceScore?: number | null;
  finalAwardedPR?: number | null;
  finalAwardedBT?: number | null;
  status?: string | null;
  comments?: string | null;
  additionalVolumePR?: number | null;
  additionalVolumeBT?: number | null;
  volumePR?: number | null;
  volumeBT?: number | null;
  biddingReport?: BiddingReport;
  isDeleted?: boolean;
  deletedDate?: string | null;
  deletedBy?: string | null;
}
export interface BiddingReport {
  id?: number;
  reportName?: string | null;
  reportMonth?: string | null;
  reportYear?: number | null;
  reportDate?: string | null;
  status?: string | null;
  totalButaneVolume?: number | null;
  totalPropaneVolume?: number | null;
  weightedAvgButanePrice?: number | null;
  weightedAvgPropanePrice?: number | null;
  weightedTotalPrice?: number | null;
  biddingHistoryAnalysis?: BiddingHistoryAnalysis | null;
  filePath?: string | null;
  fileName?: string | null;
  totalVolume?: number | null;
  createdBy?: string | null;
  dateCreated?: string | null;
  isExceptionReport?: boolean;
  approvers?: Approver[] | null;
  approvalHistories?: ApprovalHistory[] | null;
}
export interface BiddingReportDto {
  id?: number;
  reportName?: string | null;
  reportMonth?: string | null;
  reportYear?: number | null;
  reportDate?: string | null;
  status?: string | null;
  totalButaneVolume?: number | null;
  totalPropaneVolume?: number | null;
  weightedAvgButanePrice?: number | null;
  weightedAvgPropanePrice?: number | null;
  weightedTotalPrice?: number | null;
  biddingHistoryAnalysis?: BiddingHistoryAnalysisDto | string | null;
  filePath?: string | null;
  fileName?: string | null;
  totalVolume?: number | null;
  isExceptionReport?: boolean;
  createdBy?: string | null;
  dateCreated?: string | null;
  approvers?: Approver[] | null;
  approvalHistories?: ApprovalHistory[] | null;
}
export interface CalculateRollingFactorByBiddingProposalsCommand {
  biddingReportId?: number;
}
export interface UpdateAribaEntryPricesDto {
  period?: string;
  minEntryPrice?: number | null;
  ansiButaneQuotation?: number | null;
}
export interface CalculateRollingFactorCommand {
  biddingReportId?: number;
}
export interface CalculateSummaryCommand {
  biddingReportId?: number;
}
export interface CreateBiddingReportCommand {
  reportDate?: string;
}

export interface CommentDto {
  comment?: string | null;
}
export interface CreateExceptionReportResultDto {
  biddingReportId?: number;
  message?: string | null;
}
export interface BiddingReportSummaryDto {
  caption?: string | null;
  value?: string | null;
  biddingReportId?: number;
}

export interface GetBiddingReportDetailsResponse {
  reportFilePath?: string | null;
  reportFileName?: string | null;
  biddingData?: BiddingDataDto[] | null;
  summaries?: BiddingReportSummaryDto[] | null;
  createdBy?: string | null;
  status?: string | null;
}
export interface CustomersBiddingDataRequestBaseDto {
  filter?: FilterDescriptor[] | null;
  sorting?: SortDescriptor[] | null;
}
export interface CustomersBiddingDataRequestDto {
  filter?: FilterDescriptor[] | null;
  sorting?: SortDescriptor[] | null;
  paging: PagedRequest;
}
export interface CustomersListDto {
  product?: string | null;
  bidder?: string | null;
  status?: string | null;
  month?: string | null;
  year?: number | null;
  bidVolume?: number | null;
  bidPrice?: number | null;
  finalAwardedVolume?: number | null;
  volumeTaken?: number | null;
  additionalVolume?: number | null;
  rollingLiftFactor?: number | null;
  comments?: string | null;
}
export interface CustomersListDtoPagedResult {
  items: CustomersListDto[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number | null;
  totalPages?: number | null;
  hasPrevious?: boolean;
  hasNext?: boolean;
}
export interface EventType {
  id?: number;
  name?: string | null;
  approvalHistories?: ApprovalHistory[] | null;
}
export interface FilterDescriptor {
  field: string | null;
  operator?: FilterOperator;
  value?: string | null;
  values?: string[] | null;
}
export interface GetBiddingDataCustomerDto {
  product?: string | null;
  customerName?: string | null;
  status?: string | null;
  month?: string | null;
  year?: number | null;
  bidVolume?: number | null;
  bidPrice?: number | null;
  finalAwardedVolume?: number | null;
  takenVolume?: number | null;
  additionalVolume?: number | null;
  rollingLiftFactor?: number | null;
  comments?: string | null;
  biddingDate?: string | null;
}
export interface PagedRequest {
  pageNumber?: number;
  pageSize?: number;
  includeTotal?: boolean;
  all?: boolean;
}
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: unknown;
}
export interface ReportApproversDto {
  userId?: string;
  name?: string | null;
  isEndorser?: boolean;
  delegateUserId?: string | null;
  delegateName?: string | null;
}
export interface SetApproversDto {
  userId?: string;
  isEndorser?: boolean;
  delegateUserId?: string | null;
}
export interface UpdateBiddingDataForActiveReportCommand {
  biddingReportId?: number;
  biddingData?: UpdateBiddingDataForActiveReportDto[] | null;
}
export interface UpdateBiddingDataForActiveReportDto {
  id?: number;
  finalAwardedVolume?: number | null;
  comments?: string | null;
  status?: string | null;
}
export interface UpdateBiddingDataForExceptionReportCommand {
  exceptionReportId?: number;
  biddingData?: UpdateBiddingDataForExceptionReportDto[] | null;
}
export interface UpdateBiddingDataForExceptionReportDto {
  id?: number;
  bidPrice?: number | null;
  bidVolume?: number | null;
  awardedVolume?: number | null;
  finalAwardedVolume?: number | null;
  comments?: string | null;
}
export interface UpdateBiddingDataStatusCommand {
  biddingReportId?: number;
  biddingDataIds?: number[] | null;
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}
export interface UpdateBiddingHistoryAnalysisCommand {
  biddingReportId?: number;
  biddingHistoryAnalysis?: UpdateBiddingHistoryAnalysisDto[] | null;
}
export interface UpdateBiddingHistoryAnalysisDto {
  id?: number;
  additionalVolumePR?: number | null;
  additionalVolumeBT?: number | null;
  comments?: string | null;
}
export interface UpdateBiddingHistoryAnalysisStatusCommand {
  biddingReportId?: number;
  historyAnalysisId?: number;
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}
export interface SortDescriptor {
  field?: string | null;
  direction?: SortDirection;
}
export interface UpdateSummaryCommand {
  biddingReportId?: number;
  additionalInformation?: string | null;
}
export interface User {
  id?: string;
  email?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isActive?: boolean;
  dateCreated?: string;
  dateModified?: string | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
  approverRoles?: Approver[] | null;
  delegateApproverRoles?: Approver[] | null;
  approvalHistories?: ApprovalHistory[] | null;
}

export interface CustomerNameMapping {
  mappings?: Mappings[] | null;
  availableCustomerNames?: string[] | null;
}

export interface Mappings {
  id: number;
  ecCustomerName: string;
  aribaCustomerName: string;
}

export interface AuditLogSearchRequestDto {
  searchValue?: string | null;
  logDate?: string | null;
  sorting?: SortDescriptor[] | null;
  paging?: PagedRequest;
}

export interface AuditLogChangeDto {
  col?: string | null;
  from?: string | null;
  to?: string | null;
}

export interface AuditLogDto {
  tableName?: string | null;
  changedAt?: string | null;
  changedBy?: string | null;
  changeMethod?: string | null;
  actionType?: string | null;
  changes?: AuditLogChangeDto[] | null;
}

export interface AuditLogDtoPagedResult {
  items: AuditLogDto[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number | null;
  totalPages?: number | null;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface MaterializeAuditLogsResponseDto {
  status?: string | null;
}

export interface SettingsDto {
  rtcPropane: number,
  rtcButane: number,
  minVolumes: number,
  maxPRVolume: number,
  maxBTVolume: number,
  maxPRCustomerVolume: number,
  maxBTCustomerVolume: number,
  maxPRBTVolume: number
}
