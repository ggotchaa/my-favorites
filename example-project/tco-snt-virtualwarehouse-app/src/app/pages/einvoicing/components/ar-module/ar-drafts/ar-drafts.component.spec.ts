import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArDraftsComponent } from './ar-drafts.component';

describe('ArDraftsComponent', () => {
  let component: ArDraftsComponent;
  let fixture: ComponentFixture<ArDraftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArDraftsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
