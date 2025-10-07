import { Component, inject, OnInit } from '@angular/core';
import { AuthStateSignalsService } from '../../services/auth-state-signals.service';
import { EXTERNAL_LINKS } from '../../app.links';

@Component({
  selector: 'app-role-guard',
  imports: [],
  templateUrl: './role-guard.component.html',
  styleUrl: './role-guard.component.css',
})
export class RoleGuardComponent implements OnInit {
  protected readonly authService = inject(AuthStateSignalsService);
  currentUserRoles: string[] | null = null;
  readonly externalLinks = EXTERNAL_LINKS;

  ngOnInit() {
    this.currentUserRoles = this.authService?.claims()?.roles ?? null;
  }
}
