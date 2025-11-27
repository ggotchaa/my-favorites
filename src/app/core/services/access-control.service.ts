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
      roles.includes(UserRole.CommitteeMember) ||
      roles.includes(UserRole.CommitteeDelegate)
    );
  });

  private readonly hasCommitteeRole = computed(() =>
    !this.hasLpgCoordinatorRole() &&
    this.roles().some((role) =>
      [UserRole.CommitteeMember, UserRole.CommitteeDelegate].includes(role)
    )
  );

  private readonly hasCustomersOnlyRole = computed(() =>
    !this.hasLpgCoordinatorRole() &&
    this.roles().some((role) => role === UserRole.TcoBiddingSupport)
  );

  private readonly hasRestrictedDeleteRole = computed(() =>
    !this.hasLpgCoordinatorRole() &&
    this.roles().some((role) =>
      [
        UserRole.ComplianceOfficer,
        UserRole.CommitteeMember,
        UserRole.CommitteeDelegate,
      ].includes(role)
    )
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

  isCommitteeRole(): boolean {
    return this.hasCommitteeRole();
  }

  canShowDeleteColumn(): boolean {
    return !this.hasRestrictedDeleteRole();
  }

  canAccessTab(tab?: string | null): boolean {
    if (!tab) {
      return true;
    }

    if (this.hasLpgCoordinatorRole()) {
      return true;
    }

    if (this.hasCustomersOnlyRole()) {
      return tab.toLowerCase() === 'customer-name-mapping';
    }

    if (this.hasReadOnlyRole()) {
      const normalizedTab = tab.toLowerCase();
      const isRestrictedForCommittee =
        this.hasCommitteeRole() &&
        (normalizedTab === 'settings' || normalizedTab === 'customer-name-mapping');

      return !isRestrictedForCommittee;
    }

    return true;
  }

  preferredTabPath(): string {
    if (this.hasCustomersOnlyRole()) {
      return '/customer-name-mapping';
    }

    return '/customers';
  }
}
