import { Injectable, computed, inject } from '@angular/core';

import { AuthStateSignalsService } from '../../services/auth-state-signals.service';
import { UserRole } from '../../shared/utils/user-roles.enum';

@Injectable({
  providedIn: 'root',
})
export class AccessControlService {
  private readonly authState = inject(AuthStateSignalsService);

  private readonly roles = computed(() => this.authState.roles());

  private readonly hasLpgCoordinatorRole = computed(() =>
    this.roles().includes(UserRole.LpgCoordinator)
  );

  private readonly hasReadOnlyRole = computed(() => {
    const roles = this.roles();
    return (
      roles.includes(UserRole.ComplianceOfficer) ||
      roles.includes(UserRole.BiddingCommitteeMember)
    );
  });

  private readonly hasCustomersOnlyRole = computed(() =>
    this.roles().includes(UserRole.TcoBiddingSupport)
  );

  isReadOnlyMode(): boolean {
    return !this.hasLpgCoordinatorRole() && this.hasReadOnlyRole();
  }

  canEditData(): boolean {
    return this.hasLpgCoordinatorRole();
  }

  canManageApprovals(): boolean {
    return this.hasLpgCoordinatorRole();
  }

  canAccessTab(tab?: string | null): boolean {
    if (!tab) {
      return true;
    }

    if (this.hasLpgCoordinatorRole() || this.hasReadOnlyRole()) {
      return true;
    }

    if (this.hasCustomersOnlyRole()) {
      return tab.toLowerCase() === 'customers';
    }

    return true;
  }
}
