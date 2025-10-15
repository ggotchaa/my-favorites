import {importProvidersFrom, NgModule, provideZoneChangeDetection} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {AuthService} from './core/services/auth/auth.service';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/interceptors/auth/auth.interceptor';
import {errorInterceptor} from './core/interceptors/http/error.interceptor';
import {AppRoutingModule} from './app-routing.module';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideTranslateService, TranslateLoader} from '@ngx-translate/core';
import {CalAngularModule} from '@cvx/cal-angular';
import {environment} from '../environments/environment';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AcdRequestsModule} from './modules/acd-requests/acd-requests.module';
import {HomeModule} from './modules/home/home.module';
import {FeedbackModule} from './modules/feedback/feedback.module';
import {LayoutComponent} from './layout/layout.component';
import {ToastrModule} from 'ngx-toastr';
import {refreshInterceptor} from './core/interceptors/refresh.interceptor';

const httpLoaderFactory = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n', '.json');

@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AcdRequestsModule,
    HomeModule,
    FeedbackModule,
    LayoutComponent,
    ToastrModule.forRoot({
      closeButton: true,
      progressBar: true,
    })
  ],
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor, errorInterceptor])),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    AuthService,
    importProvidersFrom(
      CalAngularModule.forRoot({
        autoSignIn: true,
        popupForLogin: false,
        cacheLocation: 'localStorage',
        instance: environment.instance,
        tenantId: environment.tenantId,
        clientId: environment.clientId,
        redirectUri: environment.redirectUri,
        oidcScopes: environment.oidcScopes,
        graphScopes: environment.graphScopes,
      })
    ),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
