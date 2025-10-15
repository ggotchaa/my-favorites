import { Component, ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { GsvsExpandedListComponent } from 'src/app/shared/components/gsvs-expanded-list/gsvs-expanded-list.component';
import { GsvsFilter } from '../../shared/components/gsvs-filters/gsvsFilter.model';

@Component({
    selector: 'app-gsvs',
    templateUrl: './gsvs.component.html',
    styleUrls: ['./gsvs.component.scss'],
    standalone: false
})

export class GSVSComponent{
  filterNotifier = new Subject<GsvsFilter>();

  @ViewChild(GsvsExpandedListComponent) gsvsExpandedListComponent: GsvsExpandedListComponent;


  constructor(private titleService: Title) {      
      this.titleService.setTitle('ГСВС');
  }

  onGsvsFilter(filter: GsvsFilter) {
    this.gsvsExpandedListComponent.filterProducts(filter);
  }
}


