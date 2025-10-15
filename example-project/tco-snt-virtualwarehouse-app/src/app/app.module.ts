import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { PagesComponent } from './pages/pages.component';
import { APP_ROUTES } from './app-routing.module';
import { LayoutModule } from './layout/layout.module';
import { RouterModule } from '@angular/router';

import { CalAngularModule } from '@cvx/cal-angular';
import { BalanceClient, EsfProfileClient, DictionariesClient, SntClient, TaxpayerStoreClient, UFormClient, UserClient, GroupRoleClient, AdminClient, GroupTaxpayerStoreClient, API_BASE_URL, AwpClient, NotificationClient, ResponsibleAccountantClient, SignProcessClient } from './api/GCPClient';
import { CommonUpdateValuesService } from './services/commonUpdateValues.service';
import { TokenInterceptor } from './services/tokenInterceptor.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FlexLayoutModule } from '@angular/flex-layout';
import '../app/Extensions/date.extensions'
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './materialModule.component';
import { EINVOICING_API_BASE_URL } from './api/EInvoicingApiClient';
import { GlobalErrorHandlingService } from './shared/services/global-error-handling.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlRus } from './shared/translations/mat-paginator-intl-rus';
import { environment } from 'src/environments/environment';
import { GlobalErrorInterceptor } from './shared/interceptors/global-error.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';


const APIServices = [
    TaxpayerStoreClient,
    BalanceClient,
    DictionariesClient,
    EsfProfileClient,
    UFormClient,
    EsfProfileClient,
    UFormClient,
    UserClient,
    GroupRoleClient,
    AdminClient,
    GroupTaxpayerStoreClient,
    SntClient,
    AwpClient,
    ResponsibleAccountantClient,
    SignProcessClient
]

@NgModule({
    declarations: [
        AppComponent,
        PagesComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        LayoutModule,
        MaterialModule,
        CalAngularModule.forRoot(environment.cal),
        RouterModule.forRoot(APP_ROUTES, { enableTracing: false, anchorScrolling: 'enabled' }),
        SharedModule
    ],
    exports: [
        FlexLayoutModule,
        MaterialModule
    ],
    bootstrap: [AppComponent],
    providers: [
        ...APIServices,
        { provide: EINVOICING_API_BASE_URL, useValue: environment.einvoicingApiUrl },
        CommonUpdateValuesService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: GlobalErrorInterceptor,
            multi: true
        },
        {
            provide: API_BASE_URL,
            useValue: environment.cal["sntApiUrl"]
        },
        MatDatepickerModule,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandlingService
        },
        { provide: MatPaginatorIntl, useClass: MatPaginatorIntlRus },
        NotificationClient,
        provideHttpClient(withInterceptorsFromDi()),
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                subscriptSizing: 'dynamic'
            }
        }
    ] })

export class AppModule {
}
