import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, startWith, map } from 'rxjs/operators';
import { MeasureUnitDto } from 'src/app/api/GCPClient';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';

export class MeasureUnitFillableNonOptionsService  implements IFilliableNonOption<MeasureUnitDto, number> {
  items: MeasureUnitDto[];

  itemsLookUp: Map<number, MeasureUnitDto> = new Map<number,MeasureUnitDto>();
  

  fillOut(items: MeasureUnitDto[]): void {
    this.items = items;
    items.forEach(item => this.itemsLookUp.set(item.id, item));
  }
  displayFn(value: number): string {
    const country = this.itemsLookUp.get(value)
    return country && country.name ? country.name : '';
  }
  filter(value: string): MeasureUnitDto[] {
    const filterValue = value.toLowerCase();
    return this.items.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}
