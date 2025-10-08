import { Component, inject, OnInit } from '@angular/core';
import { ConfigService } from '@cvx/cal-angular';
import { EXTERNAL_LINKS } from '../../app.links';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-config-prop',
  imports: [CommonModule],
  templateUrl: './config-prop.component.html',
  styleUrl: './config-prop.component.css',
})
export class ConfigPropComponent implements OnInit {
  protected readonly config = inject(ConfigService);
  calProperties: Record<string, string> = {};
  externalLinks = EXTERNAL_LINKS;

  ngOnInit() {
    const settings = { ...(this.config.getSettings() || {}) };
    if ('clientId' in settings) {
      settings.clientId = 'value hidden';
    }
    this.calProperties = settings;
  }
}
