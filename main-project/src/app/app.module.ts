import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { CalAngularModule } from '@cvx/cal-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { MaterialModule } from './shared/material/material.module';
import { API_BASE_URL } from './core/services/api.base';
import { environment } from '../environments/environment';
import { CvxModule } from './core/cvx/cvx.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    MaterialModule,
    CalAngularModule.forRoot({
      autoSignIn: environment.autoSignIn,
      popupForLogin: environment.popupForLogin,
      cacheLocation: environment.cacheLocation,
      instance: environment.instance,
      tenantId: environment.tenantId,
      clientId: environment.clientId,
      redirectUri: environment.redirectUri,
      oidcScopes: environment.oidcScopes,
      graphScopes: environment.graphScopes,
    }),
    CvxModule,
  ],
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
