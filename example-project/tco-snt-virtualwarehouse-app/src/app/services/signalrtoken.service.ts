import { Injectable } from '@angular/core';
import { NotificationClient } from '../api/GCPClient';
import { BehaviorSubject, interval, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalrtokenService {
  public accessTokenSubj: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );
  private accessTokenExpiration: Date;
  private signalrUrl: string;

  constructor(private notificationClient: NotificationClient) {
    interval(1000 * 60 * 10)
      .pipe(switchMap(() => this.checkTokenExpiration()))
      .subscribe();
  }

  public getAccessToken(): Observable<string> {
    return this.renewToken().pipe(
      tap((token) => this.accessTokenSubj.next(token))
    );
  }

  public getSignalrUrl(): string {
    return this.signalrUrl;
  }

  private renewToken(): Observable<string> {
    return this.notificationClient.getSignalRConnectionInfo().pipe(
      tap((response) => {
        this.signalrUrl = response.url;
        this.accessTokenExpiration = this.calculateExpiration(49);
      }),
      switchMap((response) => {
        return new Observable<string>((observer) => {
          observer.next(response.accessToken);
          observer.complete();
        });
      })
    );
  }

  private calculateExpiration(minutes: number): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
  }

  private checkTokenExpiration(): Observable<string | void> {
    const now = new Date();

    if (now >= this.accessTokenExpiration) {
      return this.renewToken().pipe(
        tap((token) => this.accessTokenSubj.next(token as string))
      );
    } else {
      return new Observable<void>((observer) => observer.complete());
    }
  }
}
