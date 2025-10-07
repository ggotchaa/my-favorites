import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPropComponent } from './config-prop.component';

describe('ConfigPropComponent', () => {
  let component: ConfigPropComponent;
  let fixture: ComponentFixture<ConfigPropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigPropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigPropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
