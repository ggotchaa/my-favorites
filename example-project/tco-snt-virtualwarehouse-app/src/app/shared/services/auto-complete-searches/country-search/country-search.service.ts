import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { CountryDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISearchable} from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';
import { CountryFilliableService } from './country-filliable.service';


@Injectable()
export class CountrySearchService implements ISearchable<CountryDto, string> {

  filteredItems$: Observable<ISelectGroup<CountryDto>[]> | Observable<CountryDto[]>;
  searchTermItems$: Subject<string> = new Subject<string>();

  constructor(
    @Inject(CountryFillableToken) private fillable: IFilliable<CountryDto, string>
  ) {
    this.filteredItems$ = this.searchTermItems$.pipe(
      distinctUntilChanged(),
      startWith(''),
      map(value => this.fillable.filter(value))
    )
  }

}
