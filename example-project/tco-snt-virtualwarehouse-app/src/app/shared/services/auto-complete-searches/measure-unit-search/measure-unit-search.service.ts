import { Observable, Subject } from "rxjs";
import { distinctUntilChanged, map, startWith } from "rxjs/operators";
import { MeasureUnitDto } from "src/app/api/GCPClient";
import { ISelectGroup } from "src/app/model/interfaces/ISelectGroup";
import { ISearchable } from "src/app/model/interfaces/ISearchable";
import { MeasureUnitFillableToken } from "src/app/shared/tokens/measure-unit-search.token";
import { IFilliableNonOption } from "src/app/model/interfaces/IFillableNonOption";
import { IFilliable } from "src/app/model/interfaces/IFillable";
import { Inject, Injectable } from "@angular/core";

@Injectable()
export class MeasureUnitSearchService implements ISearchable<MeasureUnitDto, number> {
    filteredItems$: Observable<ISelectGroup<MeasureUnitDto>[]>;
    searchTermItems$: Subject<string> = new Subject<string>();

    constructor(
        @Inject(MeasureUnitFillableToken) private fillable: IFilliable<MeasureUnitDto, number>
    ) {
        this.filteredItems$ = this.searchTermItems$.pipe(
            distinctUntilChanged(),
            startWith(''),
            map(value => this.fillable.filter(value)),
        )
    }
}
