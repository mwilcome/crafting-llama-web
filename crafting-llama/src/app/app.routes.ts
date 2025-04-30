import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  // {
  //   path: 'shop',
  //   loadChildren: () => import('./features/shop/shop.routes').then(m => m.SHOP_ROUTES)
  // },
  {
    path: 'custom',
    loadChildren: () => import('./features/custom-order/custom-order.routes').then(m => m.CUSTOM_ORDER_ROUTES)
  },
  // {
  //   path: 'contact',
  //   loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
  // },
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  // }
];
