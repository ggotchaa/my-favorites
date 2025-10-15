import { Observable, Subject } from "rxjs";
import { ISelectGroup } from "./ISelectGroup";
export interface ISearchable<T,D> {
    filteredItems$: Observable<ISelectGroup<T>[]> | Observable<T[]>
    searchTermItems$: Subject<string>;
   
}
