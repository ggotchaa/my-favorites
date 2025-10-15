import { UFormType, UFormStatusType } from "src/app/api/GCPClient";

export class FormsFilter{
  number: string | null | undefined;
  registrationNumber: string | null | undefined;
  dateFrom: Date | null | undefined;
  dateTo: Date | null | undefined;
  senderTin: string | null | undefined;
  recipientTin: string | null | undefined;
  totalSumFrom: number | null | undefined;
  totalSumTo: number | null | undefined;
  type: string | null | undefined = '';
  status: string | null | undefined = '';
  senderStoreId: number | null | undefined = -1;
  recipientStoreId: number | null | undefined = -1;
}
