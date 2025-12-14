import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { HomeFiltersService } from '../services/home-filters.service';
import { AccessControlService } from '../../../core/services/access-control.service';

type TabId =
  | 'reports'
  | 'tender-awards'
  | 'audit-log'
  | 'customers'
  | 'customer-name-mapping'
  | 'requirements'
  | 'settings';

interface ToolbarTab {
  id: TabId;
  label: string;
}

interface SecretTableRow {
  column1: string;
  column2: string;
  column3: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: false,
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly accessControl = inject(AccessControlService);

  readonly tabs: ToolbarTab[] = [
    { id: 'reports', label: 'Bidding Reports' },
    { id: 'tender-awards', label: 'Tender Awards' },
    { id: 'customers', label: 'Customer List' },
    { id: 'customer-name-mapping', label: 'Customer Name Mapping' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'audit-log', label: 'Audit Log' },
    { id: 'settings', label: 'Settings' }
  ];

  get visibleTabs(): ToolbarTab[] {
    return this.tabs.filter((tab) => this.accessControl.canAccessTab(tab.id));
  }

  readonly months: string[];
  readonly years: number[];

  selectedMonth = '';
  selectedYear!: number | 'All';
  pendingMonth = '';
  pendingYear!: number | 'All';
  isApplying = false;

  activeTab: TabId = 'reports';

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly filters: HomeFiltersService
  ) {
    this.months = this.filters.months;
    this.years = this.filters.years;
    this.selectedMonth = this.filters.selectedMonth;
    this.selectedYear = this.filters.selectedYear;
    this.pendingMonth = this.selectedMonth;
    this.pendingYear = this.selectedYear;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => this.updateActiveTabFromRoute())
    );

    this.subscriptions.add(
      this.filters.selectedMonth$.subscribe((month) => {
        this.selectedMonth = month;
        this.pendingMonth = month;
      })
    );

    this.subscriptions.add(
      this.filters.selectedYear$.subscribe((year) => {
        this.selectedYear = year;
        this.pendingYear = year;
      })
    );

    this.subscriptions.add(this.filters.loading$.subscribe((loading) => (this.isApplying = loading)));

    this.updateActiveTabFromRoute();

    if (!this.findTabFromSnapshot(this.route)) {
      const defaultTab = this.visibleTabs[0]?.id ?? 'reports';
      void this.router.navigate([defaultTab], {
        relativeTo: this.route,
        replaceUrl: true,
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectTab(tabId: TabId): void {
    if (this.activeTab === tabId) {
      return;
    }

    this.router.navigate([tabId], { relativeTo: this.route });
  }

  onFilterChange(): void {
    this.applyFilters();
  }
  
  applyFilters(): void {
    if (this.filtersUnchanged) {
      return;
    }

    this.filters.applyFilters(this.pendingMonth, this.pendingYear);
  }

  resetFilters(): void {
    if (this.resetDisabled) {
      return;
    }

    this.pendingMonth = 'All';
    this.pendingYear = 'All';
    this.applyFilters();
  }

  get filtersUnchanged(): boolean {
    return this.pendingMonth === this.selectedMonth && this.pendingYear === this.selectedYear;
  }

  get resetDisabled(): boolean {
    return this.isApplying || (this.selectedMonth === 'All' && this.selectedYear === 'All');
  }

  private updateActiveTabFromRoute(): void {
    const tab = this.findTabFromSnapshot(this.route);
    const fallbackTab = this.visibleTabs[0]?.id ?? 'reports';
    this.activeTab = tab && this.accessControl.canAccessTab(tab) ? tab : fallbackTab;
  }

  private findTabFromSnapshot(route: ActivatedRoute | null): TabId | undefined {
    let current: ActivatedRoute | null = route;

    while (current?.firstChild) {
      current = current.firstChild;
    }

    return current?.snapshot.data['tab'] as TabId | undefined;
  }
}
