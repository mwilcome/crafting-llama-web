import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'custom',
    loadChildren: () =>
        import('./features/custom-order/custom-order.routes').then(m => m.CUSTOM_ORDER_ROUTES)
  }
];