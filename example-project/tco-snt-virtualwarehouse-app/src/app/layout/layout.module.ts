import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthTicketStatusComponent } from './auth-ticket-status/auth-ticket-status.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    NavigationComponent,
    HeaderComponent,
    NotificationCenterComponent,
    AuthTicketStatusComponent
  ],
  imports: [
    CommonModule, 
    RouterModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  exports: [
    NavigationComponent,
    HeaderComponent,
    MatSidenavModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule
  ],
  providers: [DatePipe]
})
export class LayoutModule { }
