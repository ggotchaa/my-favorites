import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';

import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { CalAngularModule } from '@cvx/cal-angular';
import { provideHttpClient } from '@angular/common/http';

export const applicationConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      RouterModule,
      // Loads CAL configuration and provides CAL services (ConfigService, CalAngularService, RoleGuardService, CalGuardService, etc.)
      CalAngularModule.forRoot('/assets/config.json')
    ),
    provideHttpClient(),
  ],
};
