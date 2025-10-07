import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CalAngularModule } from '@cvx/cal-angular';
import { provideHttpClient } from '@angular/common/http';

export const applicationConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      BrowserModule,
      CalAngularModule.forRoot('/assets/config.json')
    ),
    provideHttpClient(),
  ],
};
