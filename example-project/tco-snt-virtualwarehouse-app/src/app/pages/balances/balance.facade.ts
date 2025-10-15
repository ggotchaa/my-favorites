import { Injectable } from "@angular/core";
import { NotificationService } from "src/app/services/notification.service";
import { RoleAccessService } from "src/app/shared/services/role-access.service";

@Injectable({'providedIn': 'root'})
export class BalanceFacade {
    constructor(
        private notificationService: NotificationService,
        public roleAccessService: RoleAccessService, 
    )
    {

    }

    displayErrors(errorMessage: any): void {
        //you can add here your own error handler logic
        this.notificationService.error(errorMessage);
    }
    displaySuccess(successMessage: string): void {
        //you can add here your own success handler logic
        this.notificationService.success(successMessage);
    }
}