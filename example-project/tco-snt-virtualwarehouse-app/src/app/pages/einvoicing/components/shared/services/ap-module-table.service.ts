import { Injectable } from "@angular/core";
import { IEsfJdeApMatchBaseDto, IEsfJdeApMatchItemBaseDto, InvoiceType } from "src/app/api/GCPClient";
import { InvoiceTypeLists } from "src/app/model/lists/Einvoicing/InvoiceTypeLists";
import { Utilities } from "src/app/shared/helpers/Utils";

@Injectable()
export class ApModuleTableService {

    public formMatchStatusField(matchItems: IEsfJdeApMatchItemBaseDto[]): string {
        const matchStatuses = new Map<InvoiceType, {matched: number, all: number, stringRepresentation: string}>();

        for (let index = 0; index < matchItems.length; index++) {
            const matchItem = matchItems[index];
            
            if(Utilities.isEmptyValue(matchItem.esfType))
                continue;

            const invoiceTypeFromList = InvoiceTypeLists[matchItem.esfType];
            if(matchStatuses.has(matchItem.esfType)){
                const matchStatus = matchStatuses.get(matchItem.esfType);
                 matchStatus.all++;
                matchStatus.stringRepresentation = `${invoiceTypeFromList} (0|${matchStatus.all})`
                if(!Utilities.isEmptyValue(matchItem.esfNumber) && !Utilities.isEmptyValue(matchItem.jdeSupplierNumber))
                {
                    matchStatus.matched++;
                    matchStatus.stringRepresentation = `${invoiceTypeFromList} (${matchStatus.matched}|${matchStatus.all})`
                }
            }
            else{
                if(!Utilities.isEmptyValue(matchItem.esfNumber) && !Utilities.isEmptyValue(matchItem.jdeSupplierNumber)){
                    const stringRepresentation = `${invoiceTypeFromList} (1|1)`
                    matchStatuses.set(matchItem.esfType, {matched : 1, all: 1, stringRepresentation})
                }else{
                    const stringRepresentation = `${invoiceTypeFromList} (0|1)`
                    matchStatuses.set(matchItem.esfType, {matched : 0, all: 1, stringRepresentation})
                }
            }
        }

        return Array.from(matchStatuses.values()).map(x => x.stringRepresentation).toString();
    }

}