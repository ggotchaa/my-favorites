import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {API} from './api.config';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected baseUrl = API.baseUrl;

  constructor(
    @Inject(HttpClient) protected http: HttpClient,
    private authService: AuthService
  ) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, { params })
      .pipe(catchError((error) => this.handleError(error)));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.authService.clearToken();
    }
    return throwError(() => error);
  }
}
