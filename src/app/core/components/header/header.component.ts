import { Component, inject } from '@angular/core';

import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';
import { UserRole } from '../../../shared/utils/user-roles.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent {
  protected readonly authService = inject(AuthStateSignalsService);

  protected getRoleDisplayName(role: UserRole): string {
    const roleMap: Record<UserRole, string> = {
      [UserRole.CommitteeMember]: 'Committee Member',
      [UserRole.CommitteeDelegate]: 'Committee Member Delegate',
      [UserRole.ComplianceOfficer]: 'Compliance Officer',
      [UserRole.LpgCoordinator]: 'LPG Coordinator',
      [UserRole.TcoBiddingSupport]: 'Support Member',
    };

    return roleMap[role] || role;
  }

  protected logout(): void {
    this.authService.signOut().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Sign out failed:', error);
      },
    });
  }
}
