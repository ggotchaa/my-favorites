import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllnotificationFiltersComponent } from './allnotification-filters.component';

describe('AllnotificationFiltersComponent', () => {
  let component: AllnotificationFiltersComponent;
  let fixture: ComponentFixture<AllnotificationFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllnotificationFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllnotificationFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
