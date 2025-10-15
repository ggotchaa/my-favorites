import { InjectionToken } from "@angular/core";
import { InvoiceModuleMode } from "src/app/model/enums/InvoiceModuleTypes";

export const InvoiceCurrentModuleToken = new InjectionToken<InvoiceModuleMode>('InvoiceCurrentModuleToken');

