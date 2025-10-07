import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsGraphComponent } from './ms-graph.component';

describe('MsGraphComponent', () => {
  let component: MsGraphComponent;
  let fixture: ComponentFixture<MsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
