import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { HomeFiltersService } from '../services/home-filters.service';

type TabId = 'reports' | 'tender-awards' | 'customers';

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
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly tabs: ToolbarTab[] = [
    { id: 'reports', label: 'Bidding Reports' },
    { id: 'tender-awards', label: 'Tender Awards' },
    { id: 'customers', label: 'Customer List' }
  ];

  readonly months: string[];
  readonly years: number[];

  selectedMonth = '';
  selectedYear!: number;

  activeTab: TabId = 'reports';
  showSecretPopup = false;

  readonly secretTableData: SecretTableRow[] = [
    { column1: 'Alpha', column2: 'Bravo', column3: 'Charlie' },
    { column1: 'Delta', column2: 'Echo', column3: 'Foxtrot' },
    { column1: 'Golf', column2: 'Hotel', column3: 'India' }
  ];

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
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => this.updateActiveTabFromRoute())
    );

    this.subscriptions.add(
      this.filters.selectedMonth$.subscribe((month) => (this.selectedMonth = month))
    );

    this.subscriptions.add(
      this.filters.selectedYear$.subscribe((year) => (this.selectedYear = year))
    );

    this.updateActiveTabFromRoute();
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

  openSecretPopup(): void {
    this.showSecretPopup = true;
  }

  closeSecretPopup(): void {
    this.showSecretPopup = false;
  }

  onMonthChange(month: string): void {
    this.filters.setSelectedMonth(month);
  }

  onYearChange(year: number): void {
    this.filters.setSelectedYear(year);
  }

  private updateActiveTabFromRoute(): void {
    const child = this.route.firstChild;
    const tab = child?.snapshot.data['tab'] as TabId | undefined;

    this.activeTab = tab ?? 'reports';

    if (this.activeTab !== 'customers') {
      this.showSecretPopup = false;
    }
  }
}
