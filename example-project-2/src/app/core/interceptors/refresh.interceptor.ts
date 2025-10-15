import {inject} from '@angular/core';
import {HttpInterceptorFn} from '@angular/common/http';
import {catchError, switchMap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Попробуем получить новый токен
        return authService.getToken().pipe(
          switchMap((newToken) => {
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(clonedReq); // Повтор запроса
          }),
          catchError((refreshError) => {
            console.error('Token refresh failed', refreshError);
            authService.clearToken();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
