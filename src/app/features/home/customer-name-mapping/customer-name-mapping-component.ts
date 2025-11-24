import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { ApiEndpointService } from '../../../core/services/api.service';
import { Mappings } from '../../../core/services/api.types';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-customer-name-mapping',
  templateUrl: './customer-name-mapping-component.html',
  styleUrls: ['./customer-name-mapping-component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    NgIf,
    NgFor,
    MatProgressBar,
    FormsModule,
    MatMenuModule,
    NgStyle
  ]
})

export class CustomerNameMappingComponent implements OnInit, OnDestroy {
  mappings: Mappings[] = [];
  availableCustomerNames: string[] = [];
  selectedRow: any;

  isLoading = false;
  private subscription = new Subscription();

  constructor(private apiService: ApiEndpointService) { }

  ngOnInit(): void {
    this.loadMappings();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadMappings(): void {
    this.isLoading = true;
    this.subscription.add(
      this.apiService.getCustomerNameMappings().subscribe({
        next: (data) => {
          this.availableCustomerNames = data.availableCustomerNames || [];
          const rawMappings = data.mappings || [];
          this.mappings = this.sortMappings(rawMappings);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading mappings:', err);
          this.isLoading = false;
        }
      })
    );
  }

  sortMappings(mappings: Mappings[]): Mappings[] {
    return [...mappings].sort((a, b) => {
      const aHasMapping = !!a.aribaCustomerName;
      const bHasMapping = !!b.aribaCustomerName;

      if (aHasMapping && !bHasMapping) return -1;
      if (!aHasMapping && bHasMapping) return 1;
      return 0;
    });
  }

  hasNoMapping(row: Mappings): boolean {
    return !row.aribaCustomerName;
  }

  onAribaNameChange(mapping: Mappings, newAribaCustomerName: string): void {
    if (mapping.aribaCustomerName === newAribaCustomerName || mapping.aribaCustomerName === '') {
      return;
    }

    this.subscription.add(
      this.apiService.updateAribaCustomerName(mapping.id, newAribaCustomerName).subscribe({
        next: () => {
          mapping.aribaCustomerName = newAribaCustomerName;
          this.mappings = this.sortMappings(this.mappings);
        },
        error: (err) => {
          console.error('Error updating mapping:', err);
        }
      })
    );
  }

  trackByMappingId(index: number, item: Mappings): number {
    return item.id;
  }

  onMenuOpened(row: any) {
    this.selectedRow = row;
  }

  getDisplayValue(row: any): string {
    if (!row.aribaCustomerName) {
      return 'Select customer...';
    }

    const exists = this.availableCustomerNames.includes(row.aribaCustomerName);

    return exists ? row.aribaCustomerName : ' ';
  }
}