import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
    standalone: false
})

export class PagesComponent{
  @ViewChild('sidenav') public myNav: MatSidenav;
  public isOpen: boolean;

  @Output() public isArrowRightInput = new EventEmitter();

  public onChangeArrowType = () => {
    this.isArrowRightInput.emit(this.isOpen);
  }

  public onContentClick = (event: MouseEvent) => {
    if (this.isOpen) {
      this.close();
    }
  }
  
  ngDoCheck(): void {
    if (this.isOpen == false) {
      this.onChangeArrowType();
    }
  }  

  close() {
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
