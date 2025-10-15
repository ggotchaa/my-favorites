import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { RoleType, SignProcessClient } from 'src/app/api/GCPClient';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { SignalRService } from 'src/app/services/signalr.service';
import { AuthTicketStatusMenuService } from 'src/app/services/auth-ticket-status-menu.service';

@Component({
    selector: 'app-auth-ticket-status',
    templateUrl: './auth-ticket-status.component.html',
    styleUrls: ['./auth-ticket-status.component.scss'],
    standalone: false
})
export class AuthTicketStatusComponent implements OnInit, OnDestroy {
  public menuAccessControlList: Map<string, RoleType[]> = AccessControlList.menu;
  public hasAuthXml: boolean;
  public showForCurrentUser: boolean;
  public authTicketStatusMessage = "Проверка авторизации...";

  private isAuthorizedSubject = new BehaviorSubject<boolean>(false);
  private widgetUrl: string;

  private statusSubscription: Subscription;
  private notificationSubscription: Subscription;

  private widgetWindow: Window | null = null;
  private pollTimer: number | null = null;

  @ViewChild('authMenuTrigger') authMenuTrigger: MatMenuTrigger;
  private menuSubscription: Subscription;

  constructor(
    private userService: UserService,
    private signalRService: SignalRService,
    private signProcessClient: SignProcessClient,
    private authMenuService: AuthTicketStatusMenuService
  ) {}

  ngOnInit() {
    this.checkUserRole();
    
    this.notificationSubscription = this.signalRService.$dsignCallbackNotifications.subscribe(notification => {
      if (notification === 'AuthTicket') {
        this.closeModal();
      }
    });

    this.menuSubscription = this.authMenuService.openMenu$.subscribe(() => {
      this.openMenu();
    });

    this.updateAuthStatus();
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }

  private checkUserRole() {
    const currentRoles = this.userService.currentRoles();
    const allowedRoles = this.menuAccessControlList.get('auth_ticket_status') || [];
    this.showForCurrentUser = allowedRoles.some(role => currentRoles.includes(role));
  }

  private updateAuthStatus() {
    if(this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    } 
    this.statusSubscription = this.signProcessClient.send().subscribe(
      resp => {
        if (resp.hasSignedAuthTicket) {
          this.hasAuthXml = true;
          this.authTicketStatusMessage = 'Вы подписали авторизацию';
        } else {
          this.hasAuthXml = false;
          this.widgetUrl = resp.urlToSign;
          this.authTicketStatusMessage = 'Вы не подписали авторизацию <br><a href="javascript:void(0)" class="sign-link">Подписать</a>';
        }
        this.isAuthorizedSubject.next(this.hasAuthXml);
      },
      error => {
        this.authTicketStatusMessage = 'Ошибка проверки авторизации';
      }
    );
  }

  openMenu(): void {
    if(this.authMenuTrigger){
      this.authMenuTrigger.openMenu();
      setTimeout(() => {
        this.authMenuTrigger.closeMenu();
      }, 6000); 
    }
  }

  onMessageClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('sign-link')) {
      event.preventDefault();
      this.openSigningPopup();
    }
  }

  private openSigningPopup(): void {
    const width = 800;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    this.widgetWindow = window.open(
      this.widgetUrl,
      'window',
      `toolbar=no, menubar=no, resizable=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    // If the poll is already running, reset it
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    // We start polling the window state (pollTimer is needed because window.open does not provide a close event)
    this.pollTimer = window.setInterval(() => {
      if (this.widgetWindow && this.widgetWindow.closed) {
        window.clearInterval(this.pollTimer!);
        this.pollTimer = null;
        this.widgetWindow = null;

        this.updateAuthStatus();
      }
    }, 500);
  }

  closeModal(): void {
    if (this.widgetWindow) {
      this.widgetWindow.close();
      this.widgetWindow = null;
    }
    this.updateAuthStatus();
    this.authMenuService.notifyCloseMenu();
  }
}