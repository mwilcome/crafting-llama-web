import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Design, Variant } from '@core/catalog/design.types';
import { getEntryDesign } from '@core/utils/entry-utils';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule],
})
export class VariantSelectorComponent {
    readonly designs = signal<Design[]>(MOCK_DESIGNS);

    constructor(
        private draft: OrderDraftService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    readonly variants = computed(() => {
        const entry = this.draft.currentEntry();
        const design = entry ? getEntryDesign(entry, this.designs()) : undefined;
        return design?.variants ?? [];
    });

    select(variant: Variant): void {
        const entry = this.draft.currentEntry();
        if (!entry) return;
        this.draft.updateEntry(entry.id, { variantId: variant.id });
        this.router.navigate(['../form'], { relativeTo: this.route });
    }
}
