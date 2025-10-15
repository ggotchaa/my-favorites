import { Component, OnInit } from '@angular/core';
import { RoleType } from 'src/app/api/GCPClient';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { RoleAccessService } from 'src/app/shared/services/role-access.service';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common'
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  public username:string;
  public profileAccessControlList: Map<string, RoleType[]> = AccessControlList.profile;

  constructor(
    private userService: UserService,
    private roleAccessService: RoleAccessService,
    private location: Location) { }

  ngOnInit(): void {
    this.username= this.userService.getUserName()
  }
  hasAccess(roles: RoleType[]): boolean {
    return this.roleAccessService.hasAccess(roles);
  }

  goBack() {   
    this.location.back();
  }

  isRoot() {
    return window.location.pathname === "/" || window.location.pathname === "/modules";
  }
}
