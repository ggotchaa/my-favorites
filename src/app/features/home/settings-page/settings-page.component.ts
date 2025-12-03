import { NgIf } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDto } from '../../../core/services/api.types';
import { ApiEndpointService } from '../../../core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccessControlService } from '../../../core/services/access-control.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ]
})
export class SettingsPageComponent implements OnInit {
  settingsForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  settings: SettingsDto | null = null;
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiEndpointService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly accessControl = inject(AccessControlService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettings();
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      minBidVolume: [0, [Validators.required, Validators.min(1)]],
      capacityPropaneRTC: [0, [Validators.required, Validators.min(1)]],
      capacityButaneRTC: [0, [Validators.required, Validators.min(1)]],
      maxPreAwardPropane: [0, [Validators.required, Validators.min(1)]],
      maxPreAwardButane: [0, [Validators.required, Validators.min(1)]],
      maxPropanePerCustomer: [0, [Validators.required, Validators.min(1)]],
      maxButanePerCustomer: [0, [Validators.required, Validators.min(1)]],
      maxTotalPerCustomer: [0, [Validators.required, Validators.min(1)]]
    });

    if (this.accessControl.isReadOnlyMode()) {
      this.settingsForm.disable({ emitEvent: false });
    }
  }

  private patchFormFromSettings(settings: SettingsDto): void {
    this.settingsForm.patchValue({
      minBidVolume: settings.minVolumes,
      capacityPropaneRTC: settings.rtcPropane,
      capacityButaneRTC: settings.rtcButane,
      maxPreAwardPropane: settings.maxPRVolume,
      maxPreAwardButane: settings.maxBTVolume,
      maxPropanePerCustomer: settings.maxPRCustomerVolume,
      maxButanePerCustomer: settings.maxBTCustomerVolume,
      maxTotalPerCustomer: settings.maxPRBTVolume
    });
  }

  private loadSettings(): void {
    this.isLoading = true;
    this.apiService.getSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (settings) => {
          this.settings = settings;
          this.patchFormFromSettings(settings);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading settings:', error);
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.accessControl.isReadOnlyMode() || !this.settingsForm.valid) {
      return;
    }

    if (this.settingsForm.valid) {
      this.isSubmitting = true;
      const formData = this.settingsForm.value;

      const settingsDto: SettingsDto = {
        minVolumes: formData.minBidVolume,
        rtcPropane: formData.capacityPropaneRTC,
        rtcButane: formData.capacityButaneRTC,
        maxPRVolume: formData.maxPreAwardPropane,
        maxBTVolume: formData.maxPreAwardButane,
        maxPRCustomerVolume: formData.maxPropanePerCustomer,
        maxBTCustomerVolume: formData.maxButanePerCustomer,
        maxPRBTVolume: formData.maxTotalPerCustomer
      };

      this.apiService.updateSettings(settingsDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.settings = settingsDto;
            this.settingsForm.markAsPristine();
            this.snackBar.open('Settings updated successfully.', 'Dismiss', {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar'],
            });
          },
          error: (error) => {
            console.error('Error saving settings:', error);
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    if (this.settings) {
      this.patchFormFromSettings(this.settings);
      this.settingsForm.markAsPristine();
    };
  }

  get isLpgCoordinator(): boolean {
    return this.accessControl.canManageApprovals();
  }
}
