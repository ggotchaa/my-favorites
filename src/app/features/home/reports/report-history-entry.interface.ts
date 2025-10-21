export interface BiddingReportHistoryEntry {
  id: number;
  biddingReportId: number;
  customerName: string;
  biddingMonth: string;
  biddingYear: number;
  takenPR: number;
  takenBT: number;
  oneMonthPerformanceScore: number;
  finalAwardedPR: number;
  finalAwardedBT: number;
  status: string;
  comments: string | null;
  additionalVolumePR: number;
  additionalVolumeBT: number;
  volumePR: number;
  volumeBT: number;
  isDeleted: boolean;
  deletedDate: string | null;
  deletedBy: string | null;
}
