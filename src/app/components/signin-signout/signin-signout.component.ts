import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateSignalsService } from '../../services/auth-state-signals.service';
import { EXTERNAL_LINKS } from '../../app.links';

@Component({
  selector: 'app-signin-signout',
  imports: [CommonModule],
  templateUrl: './signin-signout.component.html',
  styleUrl: './signin-signout.component.css',
})
export class SigninSignoutComponent {
  readonly authService = inject(AuthStateSignalsService);
  isProcessing = false;
  isSigningIn = false;
  isSigningOut = false;
  loggedIn = false;
  loggedInName = '';
  claimsPrincipal: unknown = null;
  readonly externalLinks = EXTERNAL_LINKS;
  
  constructor() {
    effect(() => {
      this.loggedIn = this.authService.isSignedIn();
    });
    
    effect(() => {
      this.loggedInName = this.authService.userName();
    });
    
    effect(() => {
      this.claimsPrincipal = this.authService.claims();
    });
    
    // For debugging, check the results in the browser's console
    effect(() => {
      const isSignedIn = this.authService.isSignedIn();
      const userName = this.authService.userName();
      
      console.log(`Auth state changed: ${isSignedIn ? 'Signed In' : 'Signed Out'}`, {
        userName: userName || 'N/A',
        timestamp: new Date().toISOString()
      });
    });
  }

  onSignIn() {
    this.isSigningIn = true;
    this.isProcessing = true;
    
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      this.authService.signIn().subscribe({
        next: (result) => {
          console.log('Sign in successful', result);
          this.isSigningIn = false;
          this.isProcessing = false;
        },
        error: (error: unknown) => {
          console.error('Sign in failed', error);
          this.isSigningIn = false;
          this.isProcessing = false;
        }
      });
    }, 500);
  }

  onSignOut() {
    this.isSigningOut = true;
    this.isProcessing = true;
    
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      this.authService.signOut().subscribe({
        next: (success: boolean) => {
          console.log('Sign out result:', success);
          this.isSigningOut = false;
          this.isProcessing = false;
        },
        error: (error: unknown) => {
          console.error('Sign out failed', error);
          this.isSigningOut = false;
          this.isProcessing = false;
        }
      });
    }, 500);
  }
}
