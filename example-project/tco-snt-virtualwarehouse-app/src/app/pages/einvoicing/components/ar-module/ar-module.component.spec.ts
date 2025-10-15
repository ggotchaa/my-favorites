import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ArModuleComponent } from './ar-module.component';

describe('WarehouseComponent', () => {
  let component: ArModuleComponent;
  let fixture: ComponentFixture<ArModuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
