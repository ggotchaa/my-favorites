import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckAadGroupComponent } from './check-aad-group.component';

describe('CheckAadGroupComponent', () => {
  let component: CheckAadGroupComponent;
  let fixture: ComponentFixture<CheckAadGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckAadGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckAadGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
