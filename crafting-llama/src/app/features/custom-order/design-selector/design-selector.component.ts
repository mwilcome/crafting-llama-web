import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderDraftService } from '@services/order-draft.service';
import { DesignService } from '@core/catalog/design.service';
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
    private designs = inject(DesignService).designs;
    private draft = inject(OrderDraftService);
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
        this.draft.addEntry({
            id: crypto.randomUUID(),
            designId: design.id,
            quantity: 1,
            values: {},
            createdAt: new Date(),
        });

        const nextStep = Array.isArray(design.variants) && design.variants.length > 0 ? 'variant' : 'form';
        this.router.navigate(['../' + nextStep], { relativeTo: this.route });
    }
}