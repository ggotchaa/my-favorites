import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IRouteInfo } from 'src/app/model/interfaces/IRouteInfo';
import { UserService } from 'src/app/services/user.service';

export const ROUTES: IRouteInfo[] = [
  {
    path: 'rolegroup',
    title: 'Роли',
    icon: 'groups',
    class: ''
  },
  {
    path: 'storegroup',
    title: 'Склады',
    icon: 'store',
    class: ''
  },
  {
    path: 'account-reporting',
    title: 'Отчетность счетов',
    icon: 'switch_account',
    class: ''
  }
]
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: false
})

export class AdminComponent implements OnInit {
  menuItems: IRouteInfo[];
  public username:string;
  constructor(
    private userService: UserService, 
    private titleService: Title
  ) {
    this.titleService.setTitle('TCO GCP Админ-панель')
   }

  ngOnInit(): void {
    this.username= this.userService.getUserName();
    this.menuItems = ROUTES;
  }

}
