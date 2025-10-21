import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { HomeFiltersService } from '../services/home-filters.service';

type TabId = 'reports' | 'tender-awards' | 'audit-log' | 'customers';

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
  readonly tabs: ToolbarTab[] = [
    { id: 'reports', label: 'Bidding Reports' },
    { id: 'tender-awards', label: 'Tender Awards' },
    { id: 'audit-log', label: 'Audit Log' },
    { id: 'customers', label: 'Customer List' }
  ];

  readonly months: string[];
  readonly years: number[];

  selectedMonth = '';
  selectedYear!: number | 'All';
  pendingMonth = '';
  pendingYear!: number | 'All';
  isApplying = false;

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

    if (!this.route.snapshot.firstChild?.data['tab']) {
      void this.router.navigate(['reports'], {
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

  openSecretPopup(): void {
    this.showSecretPopup = true;
  }

  closeSecretPopup(): void {
    this.showSecretPopup = false;
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
    const child = this.route.firstChild;
    const tab = child?.snapshot.data['tab'] as TabId | undefined;

    this.activeTab = tab ?? 'reports';

    if (this.activeTab !== 'customers') {
      this.showSecretPopup = false;
    }
  }
}
