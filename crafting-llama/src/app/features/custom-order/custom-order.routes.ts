import { Routes } from '@angular/router';
import {DesignSelectorComponent} from "@features/custom-order/design-selector/design-selector.component";
import {VariantSelectorComponent} from "@features/custom-order/variant-selector/variant-selector.component";
import {EntryFormComponent} from "@features/custom-order/entry-form/entry-form.component";
import {ReviewListComponent} from "@features/custom-order/review-list/review-list.component";
import {OrderSummaryComponent} from "@features/custom-order/order-summary/order-summary.component";

export const CUSTOM_ORDER_ROUTES: Routes = [
    {
        path: '',
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
