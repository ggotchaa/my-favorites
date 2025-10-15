import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { SignProcessClient } from "src/app/api/GCPClient";
import { SignalRService } from "src/app/services/signalr.service";
import { SignWidget } from "../../interfaces/sign-widget.model";

@Component({
    selector: 'app-dsign-dialog',
    templateUrl: './dsign-dialog.component.html',
    styleUrls: ['./dsign-dialog.component.scss'],
    standalone: false
})
export class DsignDialogComponent implements OnInit, OnDestroy {
  title = "Авторизация";
  loaderTextAuth = "Проверка авторизации";
  loaderTextSign = "Формируем документы на подписание";
  widgetLinkText = 'Открыть страницу авторизации';
  statusText = "";
  isLoading = true;
  widgetUrl = '';
  hasError = false;
  isAuthorizedSubject = new BehaviorSubject<boolean>(false);
  isSignedSubject = new BehaviorSubject<boolean>(false);
  private notificationSubscription: Subscription;
  private widgetWindow: Window | null = null;

  constructor(
    public dialogRef: MatDialogRef<DsignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private signalRService: SignalRService,
    public signProcessClient: SignProcessClient,
  ) {}

  ngOnInit(): void {
    this.notificationSubscription = this.signalRService.$dsignCallbackNotifications.subscribe(notification => {
      this.handleNotification(notification);
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  verifyAuthentication(): Observable<boolean> {
    const authWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };
    this.signProcessClient.send().subscribe(
      resp => this.handleAuthResponse(resp, authWidget),
      error => this.handleAuthError(error, authWidget)
    );
    return this.isAuthorizedSubject.asObservable();
  }

  signDocument(signWidget: SignWidget): Observable<boolean> {
    this.updateState(signWidget, true);
    return this.isSignedSubject.asObservable();
  }

  
  private updateState(widget: SignWidget, isSigning: boolean = false): void {
    this.hasError = widget.hasError;
    this.statusText = widget.hasError ? `Возникла ошибка: ${widget.errorMessage}` : isSigning ? "Ожидание подписания" : "Ожидание авторизации";
    this.widgetUrl = widget.url;
    this.isLoading = false;
    if (isSigning) {
      this.widgetLinkText = "Открыть страницу подписания";
    }
  }

  private prepareToSign(): void {
    this.isAuthorizedSubject.next(true);
    this.title = "Подписание";
    this.loaderTextAuth = "Авторизация пройдена";
    this.isLoading = true;
  }

  private afterSigning(): void {
    this.loaderTextSign = "Документы подписаны";
    this.isLoading = true;
    this.isSignedSubject.next(true);
    setTimeout(() => {
      this.onCancel();
    }, 3000);
  }

  openModal(): void {
    const width = 800;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    this.widgetWindow = window.open(
      this.widgetUrl,
      'window',
      `toolbar=no, menubar=no, resizable=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  }

  closeModal(): void {
    if (this.widgetWindow) {
      this.widgetWindow.close();
      this.widgetWindow = null;
    }
  }
  onCancel(): void {
    this.dialogRef.close(false);
  }

  private handleAuthResponse(resp: any, authWidget: SignWidget): void {
    if (resp.hasSignedAuthTicket) {
      this.prepareToSign();
    } else {
      authWidget.url = resp.urlToSign;
      this.updateState(authWidget);
    }
  }

  private handleAuthError(error: any, authWidget: SignWidget): void {
    authWidget.hasError = true;
    authWidget.errorMessage = error.title;
    this.updateState(authWidget);
  }

  private handleNotification(notification: any): void {
    this.closeModal();
    if (notification === 'AuthTicket') {
      this.prepareToSign();
    } else {
      this.afterSigning();
    }
  }
}