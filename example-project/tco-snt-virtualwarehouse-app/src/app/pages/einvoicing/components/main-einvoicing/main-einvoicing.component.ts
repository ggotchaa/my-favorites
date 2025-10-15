import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ArTableDataSource } from 'src/app/model/dataSources/EInvoicing/ArTableDataSource';
import { RoleType } from '../../../../api/GCPClient';
import { AccessControlList } from '../../../../model/entities/AccessControlList';
import { RoleAccessService } from '../../../../shared/services/role-access.service';
import { ArDraftsTableDataSource } from 'src/app/model/dataSources/EInvoicing/ArDraftsTableDataSource';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';


@Component({
    selector: 'app-main-einvoicing',
    templateUrl: './main-einvoicing.component.html',
    styleUrls: ['./main-einvoicing.component.scss'],
    providers: [
        ArTableDataSource,
        ArDraftsTableDataSource
    ],
    standalone: false
})
export class MainEinvoicingComponent implements OnInit, OnDestroy {

  eiAccessControlList = AccessControlList.einvoicing;
  selectedTabIndex = 0;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private roleAccessService: RoleAccessService,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.titleService.setTitle('Электронный счет-фактура');
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(params => {
        const tabParam = params['tab'];
        if (tabParam !== undefined) {
          const indx = Number(tabParam); 
          if (!isNaN(indx)) {
            this.selectedTabIndex = indx;
          }
        }
      });
  }

  hasAccess(roles: RoleType[]): boolean {
    return this.roleAccessService.hasAccess(roles);
  }

  onTabChange(indx: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: indx },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
