import {Component, OnInit} from '@angular/core';
import {AuthService} from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  // imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.initialize().subscribe({
      next: () => {
        this.authService.checkAccount().subscribe(() => {
          console.log(this.authService.currentUserProfile.roles)
        })
      },
      error: (error) =>
        console.error('Failed to initialize authentication:', error),
    });
  }
}
