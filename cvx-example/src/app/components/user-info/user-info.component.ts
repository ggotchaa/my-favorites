import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CalAngularService, ICvxClaimsPrincipal } from '@cvx/cal-angular';
import { EXTERNAL_LINKS } from '../../app.links';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css',
})
export class UserInfoComponent{
  private readonly calService = inject(CalAngularService);
  account: unknown = null;
  loading = false;
  loadingSync = false;
  loadingAsync = false;
  claimsPrincipalSync: ICvxClaimsPrincipal | null = null;
  claimsPrincipalAsync: ICvxClaimsPrincipal | null = null;
  readonly externalLinks = EXTERNAL_LINKS;
  activeTab: string = 'get-account';

  tryGetAccount() {
    this.loading = true;
    this.account = null;
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      this.account = this.calService.getAccount();
      this.loading = false;
    }, 500);
  }

  fetchClaimsSync() {
    this.loadingSync = true;
    this.claimsPrincipalSync = null;
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      this.claimsPrincipalSync = this.calService.cvxClaimsPrincipal;
      console.log('claims', this.claimsPrincipalSync);
      this.loadingSync = false;
    }, 500);
  }

  fetchClaimsAsync() {
    this.loadingAsync = true;
    this.claimsPrincipalAsync = null;
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      this.calService.getClaims().then((claims: ICvxClaimsPrincipal) => {
        this.claimsPrincipalAsync = claims;
        console.log(claims);
        this.loadingAsync = false;
      });
    }, 500);
  }

  switchTab(tabName: string) {
    this.activeTab = tabName;
  }
}
