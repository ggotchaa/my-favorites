import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AadTokenComponent } from './aad-token.component';

describe('AadTokenComponent', () => {
  let component: AadTokenComponent;
  let fixture: ComponentFixture<AadTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AadTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AadTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
