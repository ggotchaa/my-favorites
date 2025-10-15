import { Injectable } from '@angular/core';
import { CountryDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';

@Injectable()
export class CountryFillableNonOptionsService implements IFilliableNonOption<CountryDto, string> {

  items: CountryDto[];
  itemsLookUp: Map<string, CountryDto> = new Map<string, CountryDto>();

  fillOut(items: CountryDto[]): void {
    this.items = items;
    items.forEach(item => {
      this.itemsLookUp.set(item.code, item)
    })
  }

  filter(value: string): CountryDto[] {
    const filterValue = value.toLowerCase();
    return this.items.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}
