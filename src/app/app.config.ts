import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CalAngularModule } from '@cvx/cal-angular';

import { AppRoutingModule } from './app-routing.module';

export const applicationConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      BrowserModule,
      CalAngularModule.forRoot('/assets/config.json'),
      AppRoutingModule
    ),
    provideHttpClient(),
    provideAnimationsAsync(),
  ],
};
