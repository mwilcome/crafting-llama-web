import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DesignService } from '@core/catalog/design.service';
import {PricingExampleService} from "@core/catalog/pricing.service";
import {PricingExample} from "@core/catalog/pricing.types";

@Component({
    selector: 'app-price-guide',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './price-guide.component.html',
    styleUrls: ['./price-guide.component.scss'],
})
export class PriceGuideComponent implements OnInit {
    private designService = inject(DesignService);
    private pricingService = inject(PricingExampleService);

    pricingExamples = signal<PricingExample[]>([]);
    openSet = signal<Set<PricingExample>>(new Set());

    ngOnInit(): void {
        const designs = this.designService.designs();
        this.pricingService.fetchExamples().then(raw => {
            const hydrated = raw.map(ex => this.pricingService.hydrateExample(ex, designs));
            this.pricingExamples.set(hydrated);
        }).catch(err => {
            console.error('Error fetching pricing examples:', err);
            this.pricingExamples.set([]);
        });
    }

    toggle(ex: PricingExample) {
        const set = new Set(this.openSet());
        set.has(ex) ? set.delete(ex) : set.add(ex);
        this.openSet.set(set);
    }

    isOpen = (ex: PricingExample) => computed(() => this.openSet().has(ex));
}