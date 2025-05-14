import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
        import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'custom',
    loadComponent: () => import('./features/order-composer/order-composer.component').then(m => m.OrderComposerComponent)
  }

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
