
import { Injectable } from '@angular/core';
import { CalAngularService } from '@cvx/cal-angular';
import { defer, lastValueFrom, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RoleType, UserClient } from '../api/GCPClient';

export interface IAadToken{
  accessToken:string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  loggedIn: boolean = false;
  private _currentUserProfile: any;

  public set currentUserProfile(cvxClaims : any) {
    this._currentUserProfile = cvxClaims;
  }

  public get currentUserProfile() : any {
    return this._currentUserProfile
  }



  //Token already with Bearer word
  authBearerToken:string='';

  constructor(
    private authService: CalAngularService,
    private userClient: UserClient){}

  public getUserName():string {
    if (this.loggedIn){
      return this.currentUserProfile.name;
    }
    else{
      return "Unauthorize";
    }
  }

  public getRolesOfUser(): Observable<RoleType[]>{
    return this.userClient.getUserProfile()
      .pipe(
        map(profile => profile.roles)
      )
  }
  public currentRoles(): string[] {
    return JSON.parse(localStorage.getItem('roles')) as string[];
  }
  public checkAccount() {
    return defer(() => this.authService.isUserSignedIn())
      .pipe(
        tap(() => {
          this.currentUserProfile = this.authService.cvxClaimsPrincipal
        })
      );
  }

  public async getAADToken(){
    let auth = await this.authService.getAADToken();

    let auth2 = await lastValueFrom(auth);
    return auth2;

  }
}
