import { AbstractControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";

export interface ISntParticipantSearch {
  participantTinSource: Subject<string>;
  participantNameSource: Subject<string>;
  searchingParticipantByTin: boolean;
  searchingParticipantsByName: boolean;
  participantForm: AbstractControl
  filterSearchForTin(): Observable<string>;

  filterSearchForName(): Observable<string>;
}
