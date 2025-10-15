import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { NotificationService } from "src/app/services/notification.service";
import { RoleAccessService } from "src/app/shared/services/role-access.service";
import { AwpClient, DictionariesClient, InvoicesClient, JdeClient, SntClient } from "../../../../api/GCPClient";

@Injectable()
export class InvoiceFacade {
    constructor(
        private notificationService: NotificationService,
        public roleAccessService: RoleAccessService,
        public dictionaryClient: DictionariesClient,
        public jdeClient: JdeClient,
        public invoiceClient: InvoicesClient,
        private sntClient: SntClient,
        private awpClient: AwpClient){}

    displayErrors(errorMessage: any): void {
        this.notificationService.error(errorMessage);
    }
    displaySuccess(successMessage: string): void {
        this.notificationService.success(successMessage);
    }
    displayNotification(notificationMessage: string): void {
        this.notificationService.notify(notificationMessage);
    }
    displayWarning(successMessage: string): void {
        this.notificationService.warning(successMessage);
    }

    getAwpWorksPerformedByAwpdId(awpId: number) {
        return this.awpClient.getAwpWorksPerformedByAwpId(awpId);
    }

    getSntProductsBySntId(sntId: number) {
        return this.sntClient.getSntProudctBySntId(sntId);
    }   
}
