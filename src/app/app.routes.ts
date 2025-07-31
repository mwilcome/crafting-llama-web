import { Routes } from '@angular/router';
import {inject} from "@angular/core";
import {DesignService} from "@core/catalog/design.service";
import {GalleryService} from "@core/gallery/gallery.service";
import { LockPageComponent } from './features/lock-page/lock-page.component';


export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES),
    title: 'Home'
  },
  {
    path: 'custom',
    loadChildren: () =>
        import('./features/custom-order/custom-order.routes').then(m => m.CUSTOM_ORDER_ROUTES),
    resolve: { designs: () => inject(DesignService).refresh() },
    title: 'Custom Order'
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery.component')
        .then(m => m.GalleryComponent),
    resolve: { gallery: () => inject(GalleryService).refresh() },
    title: 'Gallery'
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/price-guide/price-guide.component')
        .then(m => m.PriceGuideComponent),
    title: 'Pricing'
  },
  {
    path: 'policy',
    loadChildren: () =>
        import('./features/legal/legal.routes').then(m => m.LEGAL_ROUTES),
    title: 'Policy'
  },
  {
    path: 'admin',
    loadChildren: () =>
        import('./features/admin/admin.routes')
            .then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'contact',
    loadComponent: () =>
        import('./features/contact-page/contact-page.component').then(m => m.ContactPageComponent),
    title: 'Contact'
  },
  {
    path: 'base-products',
    loadComponent: () => import('./features/base-products/base-products-page.component')
        .then(m => m.BaseProductsPageComponent),
    title: 'Base Products'
  },
  {
    path: 'screen-lock',
    component: LockPageComponent,
    title: 'Screen Lock'
  },
  { path: '**', redirectTo: '' }
];