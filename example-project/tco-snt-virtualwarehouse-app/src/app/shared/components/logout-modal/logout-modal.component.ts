import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CalAngularService } from '@cvx/cal-angular';

@Component({
    selector: 'app-logout-modal',
    templateUrl: './logout-modal.component.html',
    styleUrls: ['./logout-modal.component.scss'],
    standalone: false
})
export class LogoutModalComponent implements OnInit {

  countdown: number = 30;
  private countdownInterval: any;

  constructor(
    private dialogRef: MatDialogRef<LogoutModalComponent>,
    private authService: CalAngularService
  ) { }

  ngOnInit(): void {
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.onLogout();
      }
    }, 1000);
  }

  onLogout(): void {
    this.authService.userInitiatedSignOut();
  }

  cancelLogout(): void {
    clearInterval(this.countdownInterval);
    this.dialogRef.close();
  }
}
