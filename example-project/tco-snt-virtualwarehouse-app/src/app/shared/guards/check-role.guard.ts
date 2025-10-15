import { Injectable } from '@angular/core';
import { Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class CheckRoleGuard  {
  currentRoles: string[];
  constructor(private userService: UserService, private router: Router) {
    this.currentRoles = this.userService.currentRoles();
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const allowedRoles = childRoute.data['roles'] as string[];
    return this.checkRole(allowedRoles);
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const allowedRoles = next.data['roles'] as string[];
    return this.checkRole(allowedRoles);
  }
  canLoad(
    route: Route,
    _segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    const allowedRoles = route.data['roles'] as string[];
    return this.checkRole(allowedRoles);
  }

  private checkRole(
    allowedRoles: string[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    for (let index = 0; index < allowedRoles.length; index++) {
      const element = allowedRoles[index];
      if (this.currentRoles.includes(element)) return true;
    }
    this.router.navigateByUrl('/error');
  }
}
