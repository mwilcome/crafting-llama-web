import { Routes } from '@angular/router';

import { DesignSelectorComponent } from './design-selector/design-selector.component';
import { VariantSelectorComponent } from './variant-selector/variant-selector.component';
import { EntryFormComponent } from './entry-form/entry-form.component';
import { ReviewListComponent } from './review-list/review-list.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import {OrderComposerComponent} from "@features/custom-order/composer/order-composer.component";

export const CUSTOM_ORDER_ROUTES: Routes = [
    {
        path: '',
        component: OrderComposerComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'select' },
            { path: 'select', component: DesignSelectorComponent },
            { path: 'variant', component: VariantSelectorComponent },
            { path: 'form', component: EntryFormComponent },
            { path: 'review', component: ReviewListComponent },
            { path: 'summary', component: OrderSummaryComponent }
        ]
    },
    {
        path: 'done', // thank-you screen lives OUTSIDE the layout
        component: ThankYouComponent
    }
];
