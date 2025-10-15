import { AwpStatus } from "src/app/api/GCPClient";

export class AwpFilter {
    registrationNumber: string;
    dateFrom: Date;
    dateTo: Date;
    senderTin: string;
    recipientTin: string;
    awpStatus: AwpStatus;
}
