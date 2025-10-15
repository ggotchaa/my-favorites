import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';
import { DecimalFormatterPipe } from './pipes/decimal-formatter.pipe';
import { MaterialModule } from '../materialModule.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AutoCompleteSearchCurrencyComponent } from './components/auto-complete-search/auto-complete-search-currency/auto-complete-search-currency.component';
import { AutoCompleteSearchUOMComponent } from './components/auto-complete-search/auto-complete-search-uom/auto-complete-search-uom.component';
import { AutoCompleteSearchCountryComponent } from './components/auto-complete-search/auto-complete-search-country/auto-complete-search-country.component';
import { ProductSelectSntComponent } from './components/product-select-snt/product-select-snt.component';
import { ProductSelectSntFiltersComponent } from './components/product-select-snt/product-select-snt-filters/product-select-snt-filters.component';
import { ProductSelectSntTableComponent } from './components/product-select-snt/product-select-snt-table/product-select-snt-table.component';
import { ProductSelectAwpComponent } from './components/product-select-awp/product-select-awp.component';
import { ProductSelectAwpFiltersComponent } from './components/product-select-awp/product-select-awp-filters/product-select-awp-filters.component';
import { ProductSelectAwpTableComponent } from './components/product-select-awp/product-select-awp-table/product-select-awp-table.component';
import { ProductSelectEgpTableComponent } from './components/product-select-awp/product-select-egp-table/product-select-egp-table.component';
import { ProductNodeDynamicData } from '../model/entities/Product/ProductNodeDynamicData';
import { LogoutModalComponent } from './components/logout-modal/logout-modal.component';
import { ShowHidePasswordComponent } from './components/show-hide-password/show-hide-password.component';
import { DsignDialogComponent } from './components/dsign-dialog/dsign-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule,
    FlexLayoutModule 
  ],
  declarations: [
    LoadingComponent,
    DecimalFormatterPipe,
    AutoCompleteSearchUOMComponent,
    ConfirmDialogComponent,
    DsignDialogComponent,    
    AutoCompleteSearchCurrencyComponent,
    AutoCompleteSearchCountryComponent,
    ProductSelectSntComponent,
    ProductSelectSntFiltersComponent,
    ProductSelectSntTableComponent,
    ProductSelectAwpComponent,
    ProductSelectAwpFiltersComponent,
    ProductSelectAwpTableComponent,
    ProductSelectEgpTableComponent,
    LogoutModalComponent,
    ProductSelectEgpTableComponent,
    ShowHidePasswordComponent
  ],
  exports: [
    LoadingComponent,
    DecimalFormatterPipe,
    AutoCompleteSearchUOMComponent,
    ConfirmDialogComponent,
    DsignDialogComponent,
    AutoCompleteSearchCurrencyComponent,
    AutoCompleteSearchCountryComponent,
    FlexLayoutModule,
    ShowHidePasswordComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutoCompleteSearchUOMComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutoCompleteSearchCountryComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutoCompleteSearchCurrencyComponent,
      multi: true
    },
    ProductNodeDynamicData
  ]
})
export class SharedModule { }
