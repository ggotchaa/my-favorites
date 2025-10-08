import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ApiService } from '../../../core/services/api.base';
import { MaterialModule } from '../../../shared/material/material.module';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  const apiServiceMock = {
    get: jasmine.createSpy('get').and.returnValue(of([]))
  } as Pick<ApiService, 'get'>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, RouterTestingModule],
      declarations: [HomePageComponent],
      providers: [{ provide: ApiService, useValue: apiServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request posts on init', () => {
    expect(apiServiceMock.get).toHaveBeenCalledWith('/posts', { params: { _limit: 3 } });
  });
});
