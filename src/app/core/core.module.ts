import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { API_BASE_URL } from './services/api.base';
import { MaterialModule } from '../shared/material/material.module';
import { environment } from '../../environments/environment';

@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [CommonModule, RouterModule, MaterialModule],
  exports: [HeaderComponent, FooterComponent],
  providers: [{ provide: API_BASE_URL, useValue: environment.apiBaseUrl }]
})
export class CoreModule {}
