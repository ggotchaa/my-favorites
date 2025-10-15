import { Injectable } from '@angular/core';
import { GetSuppliersResultDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';


@Injectable()
export class OrganizationFilliableService implements IFilliable<GetSuppliersResultDto, string> {

  items: ISelectGroup<GetSuppliersResultDto>[] = [
    {
        name: 'Все',
        group: null
    }
  ];
  itemsLookUp: Map<string, GetSuppliersResultDto> = new Map<string, GetSuppliersResultDto>();
  displayFn(value: string): string {
    const country = this.itemsLookUp.get(value)
    return country && country.name ? country.name : '';
  }

  fillOut(items: GetSuppliersResultDto[]): void {
    this.fillOutSelectionGroup(items)
    items.forEach(item => {
      this.itemsLookUp.set(item.name, item)
    })
  }

  private fillOutSelectionGroup(countriesGroup: GetSuppliersResultDto[]): void {
      this.items[0].group=countriesGroup;
  }

  filter(value: string) {
    const filterValue = value.toLowerCase();
    const searchInAll: ISelectGroup<GetSuppliersResultDto> = {
        name: this.items[0].name,
        group: this.items[0].group?.filter(
          option =>option.name.toLowerCase().includes(filterValue)
        )
    }
    return  [searchInAll];
  }

  
}
