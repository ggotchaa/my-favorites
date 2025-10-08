export interface BiddingReport {
  id: number;
  reportName: string;
  reportMonth: string;
  reportYear: number;
  reportDate: string;
  status: string;
  totalButaneVolume: number;
  totalPropaneVolume: number;
  weightedAvgButanePrice: number | null;
  weightedAvgPropanePrice: number | null;
  weightedTotalPrice: number | null;
  biddingHistoryAnalysis: string | null;
  previousReportLink: string | null;
  filePath: string;
  fileName: string;
  totalVolume: number;
}
