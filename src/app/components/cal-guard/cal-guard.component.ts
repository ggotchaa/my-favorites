import { Component, inject } from '@angular/core';
import { AuthStateSignalsService } from '../../services/auth-state-signals.service';
import { EXTERNAL_LINKS } from '../../app.links';

@Component({
  selector: 'app-cal-guard',
  imports: [],
  templateUrl: './cal-guard.component.html',
  styleUrl: './cal-guard.component.css',
})
export class CalGuardComponent {
  protected readonly authService = inject(AuthStateSignalsService);
  readonly externalLinks = EXTERNAL_LINKS;
}
