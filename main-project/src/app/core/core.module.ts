import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MaterialModule } from '../shared/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    HeaderComponent,
    FooterComponent,
  ],
  exports: [HeaderComponent, FooterComponent],
})
export class CoreModule {}
