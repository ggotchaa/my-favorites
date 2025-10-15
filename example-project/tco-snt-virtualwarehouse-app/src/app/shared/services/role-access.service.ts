import { Injectable } from '@angular/core';
import { RoleType} from 'src/app/api/GCPClient';

@Injectable({
  providedIn: 'root'
})
export class RoleAccessService {
  public currentRoles(): RoleType[] {
    return JSON.parse(localStorage.getItem('roles')) as RoleType[];
  }
  hasAccess(roles: RoleType[]): boolean {
    const currentRoles = [...this.currentRoles()];
    for (let index = 0; index < roles.length; index++) {
      const element = roles[index];
      if(currentRoles.includes(element))
        return true;
    }
    return false
  }  
}

