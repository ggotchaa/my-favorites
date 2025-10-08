import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalGuardComponent } from './cal-guard.component';

describe('CalGuardComponent', () => {
  let component: CalGuardComponent;
  let fixture: ComponentFixture<CalGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalGuardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
