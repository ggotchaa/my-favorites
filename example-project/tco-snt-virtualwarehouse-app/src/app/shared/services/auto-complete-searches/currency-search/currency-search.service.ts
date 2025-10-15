import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, startWith, map } from 'rxjs/operators';
import { CurrencyDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';
import { CurrencyFillableToken } from 'src/app/shared/tokens/currency-search.token';

@Injectable()
export class CurrencySearchService implements ISearchable<CurrencyDto, string> {

  filteredItems$: Observable<ISelectGroup<CurrencyDto>[]>;
  searchTermItems$: Subject<string> = new Subject<string>();

  constructor(
    @Inject(CurrencyFillableToken) private fillable: IFilliable<CurrencyDto, string>
  ) { 
    this.filteredItems$ = this.searchTermItems$.pipe(
      distinctUntilChanged(),
      startWith(''),
      map(value => this.fillable.filter(value)),
  )
  }
  
}
