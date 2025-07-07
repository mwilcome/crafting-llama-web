import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./admin-shell.component').then(m => m.AdminShellComponent),
        children: [
            { path: '', redirectTo: 'orders', pathMatch: 'full' },
            {
                path: 'orders',
                loadComponent: () =>
                    import('./pages/orders-page/orders-page.component').then(
                        m => m.OrdersPageComponent,
                    ),
            },
            {
                path: 'designs',
                loadComponent: () =>
                    import('./pages/designs-page/designs-page.component').then(
                        m => m.DesignsPageComponent,
                    ),
            },
            {
                path: 'designs/:id',
                loadComponent: () =>
                    import('./pages/custom-page/custom-page.component').then(
                        m => m.CustomPageComponent,
                    ),
            },
            {
                path: 'gallery',
                loadComponent: () =>
                    import('./pages/gallery-page/gallery-page.component').then(
                        m => m.GalleryPageComponent,
                    ),
            },
            {
                path: 'notes',
                loadComponent: () =>
                    import('./pages/notes-page/notes-page.component').then(
                        m => m.NotesPageComponent,
                    ),
            },
        ],
    },
];
