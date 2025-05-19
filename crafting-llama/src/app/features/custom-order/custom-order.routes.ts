import { Routes } from '@angular/router';
import { OrderComposerComponent } from './composer/order-composer.component';
import { DesignSelectorComponent } from './design-selector/design-selector.component';
import { VariantSelectorComponent } from './variant-selector/variant-selector.component';
import { EntryFormComponent } from './entry-form/entry-form.component';
import { ReviewListComponent } from './review-list/review-list.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';

export const CUSTOM_ORDER_ROUTES: Routes = [
    {
        path: '',
        component: OrderComposerComponent,
        children: [
            { path: 'select', component: DesignSelectorComponent },
            { path: 'variant', component: VariantSelectorComponent },
            { path: 'form', component: EntryFormComponent },
            { path: 'review', component: ReviewListComponent },
            { path: 'summary', component: OrderSummaryComponent },
            { path: '', pathMatch: 'full', redirectTo: 'select' }
        ]
    }
];