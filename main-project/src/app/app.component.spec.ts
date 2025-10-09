import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, tap } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthStateSignalsService } from './services/auth-state-signals.service';

class AuthStateSignalsServiceStub {
  private readonly signedInSignal = signal(false);
  private readonly loadingSignal = signal(true);

  readonly isSignedIn = this.signedInSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  signIn() {
    this.loadingSignal.set(true);

    return of(null).pipe(tap(() => this.loadingSignal.set(false)));
  }

  setSignedIn(value: boolean) {
    this.signedInSignal.set(value);
  }

  setLoading(value: boolean) {
    this.loadingSignal.set(value);
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AuthStateSignalsService, useClass: AuthStateSignalsServiceStub },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show a loading indicator while authentication is in progress', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-loading')).not.toBeNull();
  });

  it('should render the application shell once authentication completes', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const authService = TestBed.inject(
      AuthStateSignalsService
    ) as unknown as AuthStateSignalsServiceStub;

    fixture.detectChanges();

    authService.setLoading(false);
    authService.setSignedIn(true);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('.app-loading')).toBeNull();
  });
});
