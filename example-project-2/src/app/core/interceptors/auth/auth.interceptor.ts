import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!req.url.includes(environment.baseApiURL)) {
    return next(req);
  }

  return authService.getToken().pipe(
    switchMap((token) => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    })
    // catchError((error) => {
    //   console.error('Token acquisition failed', error);
    //   authService.clearToken();
    //   return throwError(() => new Error('Failed to acquire token for request'));
    // })
  );
};
