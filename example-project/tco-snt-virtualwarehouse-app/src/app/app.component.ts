import { Component, HostListener, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap, debounceTime } from 'rxjs/operators';
import { UserService } from '../app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { LogoutModalComponent } from './shared/components/logout-modal/logout-modal.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})

export class AppComponent implements OnInit {
  private inactivityTimeout: any;
  private INACTIVITY_DURATION = 10 * 60 * 1000;
  private activitySubject: Subject<void> = new Subject<void>();

  private _isLoggedIn: boolean = false;
  public get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  public set isLoggedIn(v: boolean) {
    this._isLoggedIn = v;
  }
  constructor(
    private userService: UserService,
    private matDialog: MatDialog    
  ) {
    this.resetInactivityTimer();

    this.activitySubject.pipe(
      debounceTime(500)
    ).subscribe(() => this.resetInactivityTimer());
  }

  ngOnInit(): void {
    const $checkAccount = this.userService.checkAccount();
    this.userService.getRolesOfUser()
      .pipe(      
        concatMap(roles => {
          localStorage.setItem('roles', JSON.stringify(roles));
          return $checkAccount
        }),
      )
      .subscribe(
        isLogged => {
          this.isLoggedIn = this.userService.loggedIn = isLogged
        }
      )
  };

  @HostListener("window:mousemove")
  @HostListener("window:keydown")
  onUserActivity(): void {
    this.activitySubject.next();
  }

  private resetInactivityTimer(): void {    
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => this.openLogOutModal(), this.INACTIVITY_DURATION);
  }

  private openLogOutModal(): void {   
    this.matDialog.open(LogoutModalComponent, {
      disableClose: true
    });    
  }
}
