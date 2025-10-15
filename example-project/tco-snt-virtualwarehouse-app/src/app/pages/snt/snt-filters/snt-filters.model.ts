export class SntFilter {
  dateFrom: Date | null | undefined;
  dateTo: Date | null | undefined;
  type: string | null | undefined = '';
  statuses: string[] | null | undefined;
  importType: string | null | undefined = '';
  exportType: string | null | undefined = '';
  transferType: string | null | undefined = '';
  category: string | null | undefined = '';
  number: string | null | undefined = '';
  registrationNumber: string | null | undefined = '';
  sellerName: string | null | undefined = '';
  sellerTin: string | null | undefined = '';

  constructor() {
    let dateTo = new Date();
    let dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDay() - 7)
    dateFrom.toDateOnly()
    dateTo.toDateOnly()
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
  }
}

