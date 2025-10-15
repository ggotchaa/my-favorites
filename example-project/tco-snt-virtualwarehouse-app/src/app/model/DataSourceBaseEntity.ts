import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export abstract class DataSourceBaseEntity<T, A> extends DataSource<T>{
  public dataSourceSubjects = new BehaviorSubject<T[]>([]);
  public allSourceSubjects: Array<T>;
  public apiClient: A;
  abstract subscription$: Subject<void>
    constructor(public loadingSubject?:Subject<boolean>){
      super();
      this.loadingSubject = new BehaviorSubject<boolean>(true);
    }

    connect(collectionViewer: CollectionViewer): Observable<T[] | readonly T[]> {
      return this.dataSourceSubjects.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
      this.subscription$.next();
      this.dataSourceSubjects.complete();
      this.loadingSubject.complete();
      this.subscription$.complete();
    }

    abstract loadSubjects(): Observable<T[]>;    
}
