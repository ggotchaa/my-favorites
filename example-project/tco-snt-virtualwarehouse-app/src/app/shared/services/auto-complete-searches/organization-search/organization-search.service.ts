import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { GetSuppliersResultDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISearchable} from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';
import { OrganizationFillableToken } from 'src/app/shared/tokens/organization-search.token';



@Injectable()
export class OrganizationSearchService implements ISearchable<GetSuppliersResultDto, string> {

  filteredItems$: Observable<ISelectGroup<GetSuppliersResultDto>[]> | Observable<GetSuppliersResultDto[]>;
  searchTermItems$: Subject<string> = new Subject<string>();

  constructor(
    @Inject(OrganizationFillableToken) private fillable: IFilliable<GetSuppliersResultDto, string>
  ) {
    this.filteredItems$ = this.searchTermItems$.pipe(
      distinctUntilChanged(),
      startWith(''),
      map(value => this.fillable.filter(value))
    )
  }

}
