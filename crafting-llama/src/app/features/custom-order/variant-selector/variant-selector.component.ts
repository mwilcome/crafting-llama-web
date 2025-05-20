import {Component, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';
import { Variant } from '@core/catalog/design.types';
import { getEntryDesign } from '@core/utils/entry-utils';
import {DesignService} from "@core/catalog/design.service";

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule],
})
export class VariantSelectorComponent {
    readonly designs = inject(DesignService).designs;
    readonly currentEntry;

    constructor(
        private draft: OrderDraftService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.currentEntry = this.draft.currentEntry;
    }

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
