import { Component, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { OrderFlowService } from '@services/order-flow.service';
import { DesignService } from '@core/catalog/design.service';
import { Variant } from '@core/catalog/design.types';
import { storageUrl } from '@core/storage/storage-url';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [],
})
export class VariantSelectorComponent {
    private draft = inject(OrderDraftService);
    private formSvc = inject(OrderFormService);
    private flow = inject(OrderFlowService);
    private designs = inject(DesignService).designs;
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    readonly design = computed(() => this.draft.pendingDesign());
    readonly variants = computed(() => this.design()?.variants ?? []);

    select(variant: Variant): void {
        const design = this.design();
        if (!design) return;

        const stub = {
            id: 'stub',
            designId: design.id,
            variantId: variant.id,
            quantity: 1,
            values: {},
            createdAt: new Date(),
        };

        const fields = this.formSvc.getFields(stub, this.designs());
        const visibleFields = fields.filter(f => f.type !== 'hidden');

        if (visibleFields.length === 0) {
            this.draft.addEntry({
                id: crypto.randomUUID(),
                designId: design.id,
                variantId: variant.id,
                quantity: 1,
                values: {},
                createdAt: new Date(),
            });
            this.draft.clearPendingDesign();
            this.flow.goTo('review');
            this.router.navigate(['../review'], { relativeTo: this.route });
        } else {
            this.draft.setPendingDesign({ ...design, variants: [variant] });
            this.router.navigate(['../form'], { relativeTo: this.route });
        }
    }

    protected readonly storageUrl = storageUrl;
}