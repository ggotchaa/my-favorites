export interface BiddingReportDetail {
  id: number;
  biddingReportId: number;
  product: string;
  bidder: string;
  status: string;
  year: number;
  month: string;
  differentialPrice: number;
  bidPrice: number;
  bidVolume: number;
  rankPerPrice: number;
  rollingLiftFactor: number;
  awardedVolume: number;
  finalAwardedVolume: number | null;
  comments: string | null;
  biddingDate: string;
  reportDate: string;
  [key: string]: string | number | Date | undefined;
}
