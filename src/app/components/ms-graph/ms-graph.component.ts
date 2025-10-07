import { Component, inject } from '@angular/core';
import { CalAngularService } from '@cvx/cal-angular';
import { CommonModule } from '@angular/common';
import { EXTERNAL_LINKS } from '../../app.links';

@Component({
  selector: 'app-ms-graph',
  imports: [CommonModule],
  templateUrl: './ms-graph.component.html',
  styleUrl: './ms-graph.component.css',
})
export class MsGraphComponent {
  private readonly calService = inject(CalAngularService);
  graphProperties: unknown = null;
  loading = false;
  readonly externalLinks = EXTERNAL_LINKS;
  
  tryGetMsGraphData() {
    this.loading = true;
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      this.calService
        .getUserPropertiesFromMsGraph(['department', 'givenName', 'mail', 'country', 'userType'])
        .subscribe({
          next: (graphProperties) => {
            this.graphProperties = graphProperties;
            this.loading = false;
          },
          error: (error: unknown) => {
            this.loading = false;
            console.log(error);
          }
        });
    }, 500);
  }
}