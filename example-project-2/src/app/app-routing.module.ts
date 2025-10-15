import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'acd-requests',
    loadChildren: () => import('./modules/acd-requests/acd-requests.module').then(m => m.AcdRequestsModule),
  },
  {
    path: 'pm-feedback',
    loadChildren: () => import('./modules/feedback/feedback.module').then((m) => m.FeedbackModule),
  },
  {
    path: 'technical-authorities',
    loadChildren: () => import('./modules/technical-authorities/technical-authorities.module').then((m) => m.TechnicalAuthoritiesModule),
  },
  {
    path: 'acd-requests/:acdId/equipments/:equipmentId',
    loadChildren: () => import('./modules/equipment/detail/equipment-detail.module').then((m) => m.EquipmentDetailModule),
  },
  {
    path: 'acd-requests/:acdId/equipments/create',
    loadChildren: () => import('./modules/equipment/detail/equipment-detail.module').then((m) => m.EquipmentDetailModule),
  },
  {
    path: 'acd-requests/:acdId/mwo/create',
    loadChildren: () => import('./modules/mwo/mwo-detail/mwo-detail.module').then((m) => m.MwoDetailModule),
  },
  {
    path: '**', redirectTo: 'acd-requests'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
