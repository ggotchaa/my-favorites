import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RoleType } from 'src/app/api/GCPClient';
import { LinkToTeamsChange } from 'src/app/model/GlobalConst';
import { UserService } from 'src/app/services/user.service';
import { RoleAccessService } from 'src/app/shared/services/role-access.service';
import { ROUTES } from '../../layout/navigation/navigation.component';

@Component({
    selector: 'app-modules',
    templateUrl: './modules.component.html',
    styleUrls: ['./modules.component.scss'],
    standalone: false
})
export class ModulesComponent implements OnInit {
  public menuItems = ROUTES.filter((i) => i.path != '/modules');
  linkToTeamChannel = LinkToTeamsChange

  public username: string;
  constructor(
    private userService: UserService,
    private roleAccessService: RoleAccessService,
    private titleService: Title
  ) {
    this.titleService.setTitle('TCO SNT Главная');
  }

  ngOnInit(): void {
    this.username = this.userService.getUserName();
    this.menuItems = ROUTES.filter((i) => i.path != '/modules');
  }

  hasAccessRole(roles: RoleType[]): boolean {
    // TODO Uncomment, when the roles for e-invoicing will be defined
    //return this.roleAccessService.hasAccess(roles);
    if (roles) return this.roleAccessService.hasAccess(roles);
    else return true;
  }
}
