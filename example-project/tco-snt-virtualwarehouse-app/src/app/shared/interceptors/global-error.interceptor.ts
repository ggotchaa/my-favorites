import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { ProblemDetails } from "src/app/api/GCPClient";
import { GCPExceptionTypes } from "src/app/model/enums/GCPExceptionTypes";
import { NotificationService } from "src/app/services/notification.service";

@Injectable()

export class GlobalErrorInterceptor implements HttpInterceptor {

    constructor(private notificationService: NotificationService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((errorResponse: HttpErrorResponse) => {
                //TODO: need to review and refactor once migrated to angular 18 if needed.
                if (errorResponse instanceof HttpErrorResponse && errorResponse.error instanceof Blob && errorResponse.error.type === "application/problem+json") {
                    if (errorResponse.status !== 0) {
                        const reader = new FileReader();
                        reader.addEventListener('loadend', (e) => {
                            const problemDetails = JSON.parse((<any>e.target).result) as ProblemDetails;
                            this.handleApiException(problemDetails);
                        });
                        reader.readAsText(errorResponse.error);
                    } else {
                        console.error('A client side or network error occured.');
                    }
                }

                return throwError(() => errorResponse);
            })
        );
    }

    private handleApiException(err: ProblemDetails): void {
        if (err && err.type) {
            switch (err.type) {
                case GCPExceptionTypes.ConsentValidationException:
                    const popupText = 'Необходимо подписать форму согласия.<br/>Обратитесь <a href="mailto:tco-finance-gcp-ts@tengizchevroil.com">GCP Technical Support</a>'
                    this.notificationService.error(popupText);

                    this.logError(err);
                    break;

                default:
                    this.logError(err);
                    break;
            }
        } else {
            console.error('Unexpected error:', err);
        }
    }

    private logError(err: ProblemDetails) {
        console.error(`Error: ${err.type}, Message: ${err.title}, Code: ${err.status}`);
    }
}