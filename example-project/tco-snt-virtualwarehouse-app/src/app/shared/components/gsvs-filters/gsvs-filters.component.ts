import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GsvsFlags } from 'src/app/model/lists/GsvsFlags';
import { GsvsFilter } from './gsvsFilter.model';

@Component({
    selector: 'app-gsvs-filters',
    templateUrl: './gsvs-filters.component.html',
    styleUrls: ['./gsvs-filters.component.scss'],
    standalone: false
})
export class GsvsFiltersComponent{

  @Output() gsvsFilterEvent = new EventEmitter<GsvsFilter>();

  gsvsFlags = GsvsFlags;

  model = new GsvsFilter();    
  
  onSubmit() {
    this.gsvsFilterEvent.emit(this.model);
  }

  onReset(form: NgForm) {
    form.reset();
    this.model = new GsvsFilter();    
    this.gsvsFilterEvent.emit(this.model);
  }
}
