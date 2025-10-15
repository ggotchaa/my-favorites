
export interface IFilliableNonOption<T, D> {

    items: T[];
    itemsLookUp: Map<D, T>
    fillOut(items: T[])
    filter(value: string):T[]
}