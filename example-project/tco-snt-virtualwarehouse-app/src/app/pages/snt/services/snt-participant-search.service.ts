import { Injectable, Injector } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, finalize, tap } from 'rxjs/operators';
import { SntClient, SntParticipantDto, SntParticipantShortDto } from 'src/app/api/GCPClient';
import { ISntParticipantSearch } from 'src/app/model/interfaces/Snt/ISntParticipantSearch';

@Injectable()
export class SntParticipantSearchService implements ISntParticipantSearch{

  participantTinSource = new Subject<string>();
  participantNameSource = new Subject<string>();
  searchingParticipantByTin: boolean;
  searchingParticipantsByName: boolean;
  participantForm: AbstractControl

  constructor(public sntClient: SntClient) {

  }

  filterSearchForTin(): Observable<string> {
    return this.participantTinSource.asObservable().pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(_ => !this.participantForm.get('nonResident').value),
      filter(tin => tin.length === 12),
      tap(_ => this.searchingParticipantByTin = true)
    )
  }

  filterSearchForName(): Observable<string> {
    return this.participantNameSource.asObservable().pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(_ => this.participantForm.get('nonResident').value),
      filter(name => name.length >= 3),
      tap(_ => this.searchingParticipantsByName = true)
    );
  }



}
