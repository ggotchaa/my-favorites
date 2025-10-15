import { Injectable } from '@angular/core';
import { CurrencyDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';

@Injectable()
export class CurrencyFillableService implements IFilliable<CurrencyDto, string> {

  items: ISelectGroup<CurrencyDto>[] = [
    {
        name: 'Популярные',
        group: null
    },
    {
        name: 'Все',
        group: null
    }
  ];
  itemsLookUp: Map<string, CurrencyDto> = new Map<string, CurrencyDto>();

 /*
    currencyGroup[0] -> favourite Currencies
    currencyGroup[1] -> other Favourite Currencies
  */
  fillOut(items: CurrencyDto[][]) {
    this.fillOutSelectionGroup(items)
    items[1].forEach(item => {
      this.itemsLookUp.set(item.code, item)
    })
  }
  filter(value: string): ISelectGroup<CurrencyDto>[] {
    const filterValue = value.toLowerCase();
    const searchInFavourite: ISelectGroup<CurrencyDto> = {
        name: this.items[0].name,
        group: this.items[0].group.filter(option =>option.code.toLowerCase().includes(filterValue))
    }
    const searchInAll: ISelectGroup<CurrencyDto> = {
        name: this.items[1].name,
        group: this.items[1].group.filter(option =>option.code.toLowerCase().includes(filterValue))
    }
    return [searchInFavourite, searchInAll];
  }
  displayFn(value: string): string {
    const country = this.itemsLookUp.get(value)
    return country && country.code ? country.code : '';
  }

  private fillOutSelectionGroup(currencyGroup: CurrencyDto[][]): void {
    currencyGroup.forEach((g, i) => {
        this.items[i].group = g;
    })
  }
}
