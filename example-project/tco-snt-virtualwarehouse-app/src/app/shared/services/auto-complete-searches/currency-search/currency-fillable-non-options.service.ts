import { Injectable } from '@angular/core';
import { CurrencyDto } from 'src/app/api/GCPClient';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';

@Injectable()
export class CurrencyFillableNonOptionsService implements IFilliableNonOption<CurrencyDto, string> {

  items: CurrencyDto[];
  itemsLookUp: Map<string, CurrencyDto> = new Map<string, CurrencyDto>();

  fillOut(items: CurrencyDto[]) {
    this.items = items;
    items.forEach(item => {
      this.itemsLookUp.set(item.code, item)
    })
  }
  filter(value: string): CurrencyDto[] {
    const filterValue = value.toLowerCase();
    return this.items.filter(option => option.code.toLowerCase().includes(filterValue));
  }
}
