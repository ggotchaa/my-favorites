import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { IAadToken, UserService } from './user.service';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public auth: UserService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.auth.getAADToken())
      .pipe(switchMap(token => {
        let authToken = token  as IAadToken;
        const headers = request.headers
          .set('Authorization', 'Bearer ' + authToken);

        const requestClone = request.clone({headers});
        return next.handle(requestClone);
      }))
  }
}
