import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent, FooterComponent, NavComponent, NavigationItem, LayoutService } from '@cvx/nextpage';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateSignalsService } from './services/auth-state-signals.service';
import { INTERNAL_LINKS } from './app.links';
import { Subject, takeUntil } from 'rxjs';

interface ComponentLink {
  name: string;
  component: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    FooterComponent,
    NavComponent,
    CommonModule,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  protected readonly authService = inject(AuthStateSignalsService);
  private destroy$ = new Subject<void>();
  private layoutService = inject(LayoutService);

  sitename = 'CAL Examples - Angular';
  isSignedIn = false;
  selectedComponent = 'signin-signout';
  readonly internalLinks = INTERNAL_LINKS;

  navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      link: ''
    },
  ];

  componentLinks: ComponentLink[] = [
    {
      name: '🔐 Authentication',
      component: 'signin-signout'
    },
    {
      name: '⚙️ Config Service Properties',
      component: 'config-prop'
    },
    {
      name: '🛡️ CAL Guard',
      component: 'cal-guard'
    },
    {
      name: '👤 Role Guard',
      component: 'role-guard'
    },
    {
      name: '💳 User Information',
      component: 'user-info'
    },
    {
      name: '📊 MS Graph',
      component: 'ms-graph'
    },
    {
      name: '🏢 Check AAD Group',
      component: 'check-aad-group'
    },
    {
      name: '🔑 Azure Active Directory Token',
      component: 'aad-token'
    }
  ];

  // Method to select a component with routing
  selectComponent(componentName: string) {
    this.selectedComponent = componentName;
    // Navigate to the component route
    this.router.navigate([componentName]);
  }

  ngOnInit(): void {
    this.layoutService.setClass('layout-39');
    this.layoutService.toggleFullWidth();

    // Listen to route changes to update selected component
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Example: this.router.url = "/signin-signout" → currentRoute = "signin-signout"
        // Example: this.router.url = "/get-account" → currentRoute = "get-account"
        const currentRoute = this.router.url.slice(1); // Remove the leading '/'
        if (
          currentRoute &&
          this.componentLinks.some((link) => link.component === currentRoute)
        ) {
          this.selectedComponent = currentRoute;
        }
      });

    // Set initial component based on current route
    const initialRoute = this.router.url.slice(1);
    if (
      initialRoute &&
      this.componentLinks.some((link) => link.component === initialRoute)
    ) {
      this.selectedComponent = initialRoute;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
