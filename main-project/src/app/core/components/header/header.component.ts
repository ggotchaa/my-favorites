import { Component, inject } from '@angular/core';

import { AuthStateSignalsService } from '../../../services/auth-state-signals.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  protected readonly authService = inject(AuthStateSignalsService);
}
