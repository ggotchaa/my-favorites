import { Injectable } from '@angular/core';
import { MeasureUnitDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';

@Injectable()
export class MeasureUnitFillableService implements IFilliable<MeasureUnitDto, number> {

  items: ISelectGroup<MeasureUnitDto>[] = [
    {
      name: 'Популярные',
      group: null
    },
    {
        name: 'Все',
        group: null
    }
  ];
  itemsLookUp: Map<number, MeasureUnitDto> = new Map<number, MeasureUnitDto>();

   /*
        measureUnitsGroup[0] -> favourite MeasureUnits
        measureUnitsGroup[1] -> other MeasureUnits
    */
  fillOut(items: MeasureUnitDto[][]): void {
    this.fillOutSelectionGroup(items)
    items[1].forEach(item => {
      this.itemsLookUp.set(item.id, item)
    })
  }
  private fillOutSelectionGroup(measureUnitsGroup: MeasureUnitDto[][]): void {
      measureUnitsGroup.forEach((g, i) => {
          this.items[i].group = g;
      })
  }

  displayFn(value: number): string {
      const country = this.itemsLookUp.get(value)
      return country && country.name ? country.name : '';
  }
  filter(value: string) {      
      const filterValue = value.toLowerCase();
      const searchInFavourite: ISelectGroup<MeasureUnitDto> = {
          name: this.items[0].name,
          group: this.items[0].group.filter(option =>option.name.toLowerCase().includes(filterValue))
      }
      const searchInAll: ISelectGroup<MeasureUnitDto> = {
          name: this.items[1].name,
          group: this.items[1].group.filter(option =>option.name.toLowerCase().includes(filterValue))
      }
      return [searchInFavourite, searchInAll];
  }
}
