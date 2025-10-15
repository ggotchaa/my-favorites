import { Injectable } from '@angular/core';
import { CountryDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';


@Injectable()
export class CountryFilliableService implements IFilliable<CountryDto, string> {

  items: ISelectGroup<CountryDto>[] = [
    {
        name: 'Популярные',
        group: null
    },
    {
        name: 'Все',
        group: null
    }
  ];
  itemsLookUp: Map<string, CountryDto> = new Map<string, CountryDto>();
  displayFn(value: string): string {
    const country = this.itemsLookUp.get(value)
    return country && country.name ? country.name : '';
  }

   /*
    countryGroup[0] -> favourite Currencies
    countryGroup[1] -> other Favourite Currencies
  */
  fillOut(items: CountryDto[][]): void {
    this.fillOutSelectionGroup(items)
    items[1].forEach(item => {
      this.itemsLookUp.set(item.code, item)
    })
  }

  private fillOutSelectionGroup(countriesGroup: CountryDto[][]): void {
    countriesGroup.forEach((g, i) => {
      this.items[i].group = g;
    })
  }

  filter(value: string) {
    const filterValue = value.toLowerCase();
    const searchInFavourite: ISelectGroup<CountryDto> = {
        name: this.items[0].name,
        group: (this.items[0] as ISelectGroup<CountryDto>).group.filter(option =>option.name.toLowerCase().includes(filterValue))
    }
    const searchInAll: ISelectGroup<CountryDto> = {
        name: this.items[1].name,
        group: (this.items[1] as ISelectGroup<CountryDto>).group.filter(option =>option.name.toLowerCase().includes(filterValue))
    }
    return [searchInFavourite, searchInAll];
  }

  
}
