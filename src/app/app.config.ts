import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CalAngularModule } from '@cvx/cal-angular';

import { API_BASE_URL } from './core/services/api.base';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const applicationConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      CalAngularModule.forRoot('/assets/config.json'),
      BrowserModule
    ),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideRouter(appRoutes),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ],
};
