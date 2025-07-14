import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderDraftService } from '@services/order-draft.service';
import { DesignService } from '@core/catalog/design.service';
import { OrderFormService } from '@services/order-form.service';
import { OrderFlowService } from '@services/order-flow.service';
import { Design } from '@core/catalog/design.types';

import { DesignCardComponent } from '@shared/ui/card/design-card.component';
import {PriceDisclaimerService} from "@features/custom-order/price-disclaimer/price-disclaimer.service";
import {PriceDisclaimerComponent} from "@features/custom-order/price-disclaimer/price-disclaimer.component";

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [CommonModule, RouterModule, DesignCardComponent, PriceDisclaimerComponent, FormsModule],
})
export class DesignSelectorComponent {
    private designsSvc = inject(DesignService);
    private designs = this.designsSvc.designs;
    private formSvc = inject(OrderFormService);
    private draft = inject(OrderDraftService);
    private flow = inject(OrderFlowService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private priceNotice = inject(PriceDisclaimerService);

    readonly uniqueTags = computed(() => [...new Set(this.designs().flatMap(design => design.tags ?? []))].sort());
    readonly selectedTags = signal<Set<string>>(new Set());
    readonly searchTerm = signal('');

    readonly filteredDesigns = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const activeTags = this.selectedTags();

        return this.designs().filter(design => {
            const matchesSearch =
                design.name.toLowerCase().includes(term) ||
                design.description?.toLowerCase().includes(term) ||
                design.tags?.some(tag => tag.toLowerCase().includes(term));

            const matchesTags =
                activeTags.size === 0 ||
                design.tags?.some(tag => activeTags.has(tag));

            return matchesSearch && matchesTags;
        });
    });

    private initialTag: string | null = null;

    constructor() {
        effect(() => {
            const tags = this.uniqueTags();
            if (this.initialTag && tags.includes(this.initialTag) && this.searchTerm() === '') {
                this.searchTerm.set(this.initialTag);
                this.initialTag = null; // Prevent re-application
            }
        });
    }

    ngOnInit(): void {
        this.initialTag = this.route.snapshot.queryParams['tag'] || null;
        if (this.initialTag) {
            // Clear the query param from the URL
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { tag: null },
                queryParamsHandling: 'merge',
                replaceUrl: true // Avoid adding to history
            });
        }
    }

    toggleTag(tag: string): void {
        const tags = new Set(this.selectedTags());
        tags.has(tag) ? tags.delete(tag) : tags.add(tag);
        this.selectedTags.set(tags);
    }

    clearSearch(): void {
        this.searchTerm.set('');
    }

    select(design: Design): void {
        this.draft.setPendingDesign(design);

        const stub = {
            id: 'stub',
            designId: design.id,
            variantId: undefined,
            quantity: 1,
            values: {},
            createdAt: new Date(),
        };

        const fields = this.formSvc.getFields(stub, this.designs());
        const visibleFields = fields.filter(f => f.type !== 'hidden');

        if (Array.isArray(design.variants) && design.variants.length > 0) {
            this.router.navigate(['../variant'], { relativeTo: this.route });
        } else if (visibleFields.length === 0) {
            this.draft.addEntry({
                id: crypto.randomUUID(),
                designId: design.id,
                variantId: undefined,
                quantity: 1,
                values: {},
                createdAt: new Date(),
            });
            this.draft.clearPendingDesign();
            this.flow.goTo('review');
            this.router.navigate(['../review'], { relativeTo: this.route });
        } else {
            this.router.navigate(['../form'], { relativeTo: this.route });
        }
    }
}