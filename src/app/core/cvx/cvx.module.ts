import { NgModule } from '@angular/core';
import { CalAngularModule } from '@cvx/cal-angular';

@NgModule({
  imports: [CalAngularModule],
  exports: [CalAngularModule],
})
export class CvxModule {}
