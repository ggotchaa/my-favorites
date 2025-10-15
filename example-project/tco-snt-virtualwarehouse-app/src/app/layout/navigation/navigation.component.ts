import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoleType } from 'src/app/api/GCPClient';
import { LinkToTeamsChange } from 'src/app/model/GlobalConst';
import { IRouteInfo } from 'src/app/model/interfaces/IRouteInfo';
import { RoleAccessService } from 'src/app/shared/services/role-access.service';

export const ROUTES: IRouteInfo[] = [
  {
    path: '/modules',
    title: 'Главная',
    icon: 'home',
    class: '',
  },
  {
    path: '/warehouse',
    title: 'Склады',
    icon: 'account_balance',
    class: '',
  },
  {
    path: '/snt',
    title: 'СНТ',
    icon: 'library_books',
    class: '',
  },
  {
    path: '/balance',
    title: 'Остатки',
    icon: 'assignment',
    class: '',
  },
  {
    path: '/gsvs',
    title: 'ГСВС',
    icon: 'shop_two',
    class: '',
  },
  {
    path: '/forms',
    title: 'Журнал форм',
    icon: 'list_alt',
    class: '',
  },
  {
    path: '/einvoicing',
    title: 'E-Invoicing',
    icon: 'description',
    class: '',
  },
  {
    path: '/admin',
    title: 'Админ-панель',
    icon: 'admin_panel_settings',
    class: '',
  },
];

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: false
})
export class NavigationComponent implements OnInit {
  menuItems: IRouteInfo[];
  rolesOfItems: RoleType[];
  events: string[] = [];
  isOpened: boolean = true;
  linkToTeamChannel = LinkToTeamsChange

  @Output() public sidenavClose = new EventEmitter();
  @Output() public sidenavToggle = new EventEmitter();
  @Input() set isArrowRightInput(_value: boolean) {
    this.isOpened = _value;
  }

  constructor(
    private router: ActivatedRoute,
    private roleAccessService: RoleAccessService
  ) {}

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  };

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };

  ngOnInit(): void {
    this.menuItems = ROUTES;
    this.getRolesOfItems();
  }

  hasAccess(roles: RoleType[]): boolean {
    return this.roleAccessService.hasAccess(roles);    
  }

  private getRolesOfItems(): void {
    const routesOfPages = this.router.snapshot.children[0].routeConfig.children;
    for (let index = 0; index < this.menuItems.length; index++) {
      if (routesOfPages[index].data['roles'])
        this.menuItems[index].roles = routesOfPages[index].data['roles'];
      else continue;
    }
  }
}
