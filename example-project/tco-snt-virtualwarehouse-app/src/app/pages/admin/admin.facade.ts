import { Injectable } from "@angular/core";
import { Observable, of, ReplaySubject, tap } from "rxjs";
import { AdGroupDto, AdminClient, GroupRoleClient, GroupTaxpayerStoreClient, MsGraphUser, ResponsibleAccountantClient, TaxpayerStoreClient } from "src/app/api/GCPClient";
import { NotificationService } from "src/app/services/notification.service";

@Injectable()
export class AdminFacade {
    public loading = new ReplaySubject<boolean>(1);
    private groupMembers: MsGraphUser[] | null = null;
    constructor(
        public adminClient: AdminClient,
        public roleGroupClient: GroupRoleClient,
        public responsibleAccountantClient: ResponsibleAccountantClient,
        public groupTaxpayerStoreClient:GroupTaxpayerStoreClient,
        public taxpayerStoreClient: TaxpayerStoreClient,
        private notificationService: NotificationService,
    )
    {
    }

    searchGroupByText(seek: string ): Observable<AdGroupDto[]>{
        return this.adminClient.searchGroup(seek)
    }
    getEinvoicingGroupMembers(): Observable<MsGraphUser[]>{
        if(this.groupMembers){
            return of(this.groupMembers);
        }else{
            return this.responsibleAccountantClient.getGroupMembers().pipe(
                tap(members => this.groupMembers = members)
            );
        }
    }
    displayErrors(errorMessage: any): void {
        this.notificationService.error(errorMessage);
    }
    displaySuccess(successMessage: string): void {
        this.notificationService.success(successMessage);
    }
}
