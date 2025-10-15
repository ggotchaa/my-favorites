import { InvoiceType } from "src/app/api/GCPClient";

export const InvoiceTypeLists: Record<InvoiceType, string> = {
    ORDINARY_INVOICE: "Ordinary",
    FIXED_INVOICE: "Fixed",
    ADDITIONAL_INVOICE: "Additional",
}