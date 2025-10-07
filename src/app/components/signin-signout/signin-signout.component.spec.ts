import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninSignoutComponent } from './signin-signout.component';

describe('SigninSignoutComponent', () => {
  let component: SigninSignoutComponent;
  let fixture: ComponentFixture<SigninSignoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninSignoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigninSignoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
