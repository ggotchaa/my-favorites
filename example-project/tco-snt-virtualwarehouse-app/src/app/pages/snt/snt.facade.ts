import { Injectable } from "@angular/core";
import { DictionariesClient, SntFullDto } from "src/app/api/GCPClient";
import { NotificationService } from "src/app/services/notification.service";
import { RoleAccessService } from "src/app/shared/services/role-access.service";
import { VStoreAccessService } from "src/app/shared/services/vstore-access.service";
import { CommonDataService } from '../../shared/services/common-data.service';

@Injectable()
export class SntFacade {

    public fixedSnt: boolean

    constructor(        
        private notificationService: NotificationService,
        public roleAccessService: RoleAccessService, 
        public vstoreAccessService: VStoreAccessService,
        public commonDataService: CommonDataService,
        public dictionariesClient: DictionariesClient
    )
    {

    }

    displayErrors(errorMessage: any): void {
        this.notificationService.error(errorMessage);
    }
    displaySuccess(successMessage: string): void {
        this.notificationService.success(successMessage);
    }
    displayNotification(notificationMessage: string): void {
        this.notificationService.notify(notificationMessage);
    }

    isFixedSnt(snt: SntFullDto){
        this.fixedSnt = snt.relatedRegistrationNumber !== null;
    }
}
