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
import { PriceDisclaimerService } from '@features/custom-order/price-disclaimer/price-disclaimer.service';
import { PriceDisclaimerComponent } from '@features/custom-order/price-disclaimer/price-disclaimer.component';

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        DesignCardComponent,
        PriceDisclaimerComponent,
        FormsModule,
    ],
})
export class DesignSelectorComponent {
    /* ───────── injections ───────── */
    private designsSvc   = inject(DesignService);
    private designs      = this.designsSvc.designs;
    private formSvc      = inject(OrderFormService);
    private draft        = inject(OrderDraftService);
    private flow         = inject(OrderFlowService);
    private router       = inject(Router);
    private route        = inject(ActivatedRoute);
    private priceNotice  = inject(PriceDisclaimerService);

    /* ───────── tag filters ───────── */
    readonly uniqueTags = computed(() =>
        [...new Set(this.designs().flatMap(d => d.tags ?? []))].sort(),
    );

    /** Active tag filters (chip selection) */
    readonly selectedTags = signal<Set<string>>(new Set());

    /** Search box input */
    readonly searchTerm = signal('');

    /* ───────── filtered list ─────── */
    readonly filteredDesigns = computed(() => {
        const term       = this.searchTerm().trim().toLowerCase();
        const activeTags = this.selectedTags();

        return this.designs().filter(design => {
            const matchesSearch =
                design.name.toLowerCase().includes(term) ||
                design.description?.toLowerCase().includes(term) ||
                design.tags?.some(t => t.toLowerCase().includes(term));

            const matchesTags =
                activeTags.size === 0 || design.tags?.some(t => activeTags.has(t));

            return matchesSearch && matchesTags;
        });
    });

    /* ───────── initial tag seeding ─ */
    private pendingTags: string[] = [];

    constructor() {
        /* Once the tag “universe” is known, apply any pending pre-selected tags */
        effect(() => {
            if (this.pendingTags.length === 0) return;

            const universe = this.uniqueTags();
            const next     = new Set(this.selectedTags());

            this.pendingTags.forEach(tag => {
                if (universe.includes(tag)) next.add(tag);
            });

            this.selectedTags.set(next);
            this.pendingTags = []; // run only once
        });
    }

    ngOnInit(): void {
        /* Accept either ?tags=a,b or repeated ?tag=a&tag=b */
        const paramTags: string[] = [
            ...this.route.snapshot.queryParamMap.getAll('tag'),
        ];
        const csv = this.route.snapshot.queryParamMap.get('tags');
        if (csv) paramTags.push(...csv.split(','));

        this.pendingTags = paramTags.map(t => t.trim()).filter(Boolean);

        /* Strip the query-params so reloads don’t re-seed */
        if (paramTags.length) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { tag: null, tags: null },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        }
    }

    /* ───────── ui actions ───────── */
    toggleTag(tag: string): void {
        const next = new Set(this.selectedTags());
        next.has(tag) ? next.delete(tag) : next.add(tag);
        this.selectedTags.set(next);
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

        const fields        = this.formSvc.getFields(stub, this.designs());
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
