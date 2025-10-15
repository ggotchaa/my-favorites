import { ISelectGroup } from "./ISelectGroup";

export interface IFilliable<T, D> {

    items:  ISelectGroup<T>[];
    itemsLookUp: Map<D, T>
    fillOut(items: T[][] | T[])
    filter(value: string): ISelectGroup<T>[]
    displayFn(value: D): string 
}