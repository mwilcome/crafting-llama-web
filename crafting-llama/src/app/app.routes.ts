import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
        import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'custom',
    loadChildren: () =>
        import('@features/custom-order/custom-order.routes').then(
            (m) => m.CUSTOM_ORDER_ROUTES
        ),
  },
  // {
  //   path: 'shop',
  //   loadChildren: () => import('./features/shop/shop.routes').then(m => m.SHOP_ROUTES)
  // },
  // {
  //   path: 'contact',
  //   loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
  // },
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  // }
];
