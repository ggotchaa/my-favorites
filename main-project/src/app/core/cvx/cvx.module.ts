import { NgModule } from '@angular/core';
import { CalAngularModule } from '@cvx/cal-angular';

@NgModule({
  imports: [CalAngularModule.forRoot('/assets/config.json')],
  exports: [CalAngularModule],
})
export class CvxModule {}
