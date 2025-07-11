import { Component, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
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
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    readonly design = computed(() => this.draft.pendingDesign());
    readonly variants = computed(() => this.design()?.variants ?? []);

    select(variant: Variant): void {
        const design = this.design();
        if (!design) return;

        this.draft.setPendingDesign({ ...design, variants: [variant] });

        this.router.navigate(['../form'], { relativeTo: this.route });
    }

    protected readonly storageUrl = storageUrl;
}
