import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesComponent } from './modules/modules.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { MatSidenavModule} from '@angular/material/sidenav';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MaterialModule } from '../materialModule.component';
import { ErrorpageComponent } from './common/errorpage/errorpage.component';
import {SntModule} from './snt/snt.module'
import { BalanceComponent } from './balances/balance.component';
import { GSVSComponent } from './gsvs/gsvs.component';
import { ProfileComponent } from './profile/profile.component';
import { FormModule } from './forms/forms.module';
import { RouterModule } from '@angular/router';
import { FormsComponent } from './forms/forms.component';
import { ProductAddComponent } from './forms/product-add/product-add.component';
import { ProductSelectGsvsComponent } from '../shared/components/product-select-gsvs/product-select-gsvs.component';
import { PagesRoutingModule } from './pages-routing.module';
import { ConfirmSntComponent } from './snt/confirm-snt/confirm-snt.component';
import { RejectSntComponent } from './snt/reject-snt/reject-snt.component';
import { SntComponent } from './snt/snt.component';
import { SnackbarHtmlComponent } from './common/snackbar-html/snackbar-html/snackbar-html.component';
import { NotificationService } from '../services/notification.service';
import { TwoDigitDecimaNumberDirective } from './common/directives/two-digit-decimal.directive';
import { RevokeSntComponent } from './snt/revoke-snt/revoke-snt.component';
import { RestrictedDecimalsDirective } from './common/directives/resticted-decimals.directive';
import { SharedModule } from '../shared/shared.module';
import { ProductSelectBalanceQuantityComponent } from '../shared/components/product-select-balance/product-select-balance-quantity/product-select-balance-quantity.component';
import { ProductSelectBalanceComponent } from '../shared/components/product-select-balance/product-select-balance.component';
import { ProductSelectBalanceFiltersComponent } from '../shared/components/product-select-balance/product-select-balance-filters/product-select-balance-filters.component';
import { BalancesFiltersComponent } from './balances/balances-filters/balances-filters.component';
import { GsvsExpandedListComponent } from '../shared/components/gsvs-expanded-list/gsvs-expanded-list.component';
import { GsvsFiltersComponent } from '../shared/components/gsvs-filters/gsvs-filters.component';
import { OnlyDigitsDirective } from './common/directives/only-digits.directive';
import { AllNotificationsComponent } from './all-notifications/all-notifications.component';
import { AllnotificationFiltersComponent } from './all-notifications/allnotification-filters/allnotification-filters.component';


@NgModule({
    declarations: [
        ModulesComponent,
        WarehouseComponent,
        BalanceComponent,
        GSVSComponent,
        ErrorpageComponent,
        ProfileComponent,
        ProductAddComponent,
        ProductSelectGsvsComponent,
        ProductSelectBalanceComponent,
        ProductSelectBalanceFiltersComponent,
        ConfirmSntComponent,
        RejectSntComponent,
        SnackbarHtmlComponent,
        ProductSelectBalanceQuantityComponent,
        TwoDigitDecimaNumberDirective,
        RevokeSntComponent,
        RestrictedDecimalsDirective,
        OnlyDigitsDirective,
        ProfileComponent,
        BalancesFiltersComponent,
        GsvsExpandedListComponent,
        GsvsFiltersComponent,
        AllNotificationsComponent,
        AllnotificationFiltersComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatIconModule,
        MatListModule,
        MaterialModule,
        PagesRoutingModule,
        FormModule,
        FlexLayoutModule,
        SharedModule
    ],
    providers: [
        NotificationService,
    ],
    exports: [
        RestrictedDecimalsDirective,
        OnlyDigitsDirective
    ]
})
export class PagesModule {

}

