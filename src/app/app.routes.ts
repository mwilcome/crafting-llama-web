import { Routes } from '@angular/router';
import {inject} from "@angular/core";
import {DesignService} from "@core/catalog/design.service";
import {GalleryService} from "@core/gallery/gallery.service";

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'custom',
    loadChildren: () =>
        import('./features/custom-order/custom-order.routes').then(m => m.CUSTOM_ORDER_ROUTES),
    resolve: { designs: () => inject(DesignService).refresh() }
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery.component')
        .then(m => m.GalleryComponent),
    resolve: { gallery: () => inject(GalleryService).refresh() }
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/price-guide/price-guide.component')
        .then(m => m.PriceGuideComponent)
  },
  {
    path: 'policy',
    loadChildren: () =>
        import('./features/legal/legal.routes').then(m => m.LEGAL_ROUTES)
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
        import('./features/contact-page/contact-page.component').then(m => m.ContactPageComponent)
  },
  {
    path: 'base-products',
    loadComponent: () => import('./features/base-products/base-products-page.component')
        .then(m => m.BaseProductsPageComponent)
  },

  { path: '**', redirectTo: '' }
];