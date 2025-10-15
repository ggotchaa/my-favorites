import { Observable, of, Subject } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { DictionariesClient, MeasureUnitDto } from "src/app/api/GCPClient";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";

export class FormMeasureUnitsSource extends DataSourceBaseEntity<MeasureUnitDto, DictionariesClient> {
  subscription$: Subject<void> = new Subject<void>();
  public loading = this.loadingSubject.asObservable();
  constructor(){
    super();
  }
  loadSubjects(): Observable<MeasureUnitDto[]> {
    return this.apiClient.getMeasureUnits().pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      // .subscribe((data) => {
      //   this.dataSourceSubjects.next(data);
      //   this.allSourceSubjects = this.dataSourceSubjects.value;
      // });
  }
}
