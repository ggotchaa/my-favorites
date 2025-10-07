import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalAngularService } from '@cvx/cal-angular';
import { AuthStateSignalsService } from '../../services/auth-state-signals.service';
import { map } from 'rxjs';
import { signal } from '@angular/core';
import { EXTERNAL_LINKS } from '../../app.links';

@Component({
  selector: 'app-check-aad-group',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './check-aad-group.component.html',
  styleUrl: './check-aad-group.component.css',
})
export class CheckAadGroupComponent implements OnInit {
  readonly authService = inject(AuthStateSignalsService);
  private readonly calService = inject(CalAngularService);
  group = new FormControl('');
  message = signal('');
  isUserSignedIn = false;
  loading = false;
  result: boolean = false;
  readonly externalLinks = EXTERNAL_LINKS;

  ngOnInit() {
    this.isUserSignedIn = this.authService.isSignedIn();
  }


  onSubmit() {
    const groupName = this.group.value?.trim();
    if (!this.isUserSignedIn) {
      this.loading = false;
      this.result = false;
      return;
    }
    if (!groupName) {
      this.message.set('⚠️Please provide a group name.');
      return;
    }
    this.loading = true;
    this.calService.isInGroup(groupName).pipe(
      map((value: boolean) => {
        this.loading = false;
        this.result = value;
        return value
          ? `✅ User is IN group <b>${groupName}</b>`
          : `❌ User is NOT in group <b>${groupName}</b>`;
      })
    ).subscribe((msg) => this.message.set(msg));
  }

  onReset() {
    this.group.setValue('');
    this.message.set('');
    this.loading = false;
  }
}
