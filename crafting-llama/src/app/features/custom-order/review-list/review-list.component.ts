import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { OrderDraftEntry } from '@models/order-entry.model';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [CommonModule],
})
export class ReviewListComponent {
    readonly drafts: OrderDraftEntry[];

    constructor(
        private readonly draftService: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        this.drafts = this.draftService.all();
    }

    getImageUrl(entry: OrderDraftEntry): string | null {
        const design = MOCK_DESIGNS.find(d => d.id === entry.designId);
        const variant = design?.variants?.find(v => v.id === entry.variantId);
        return variant?.heroImage ?? null;
    }

    getDesignName(entry: OrderDraftEntry): string {
        return MOCK_DESIGNS.find(d => d.id === entry.designId)?.name ?? 'Unknown Design';
    }

    getKeys(obj: Record<string, any>): string[] {
        return Object.keys(obj ?? {});
    }

    edit(index: number): void {
        this.draftService.edit(index);
        this.flow.goTo('form');
    }

    remove(index: number): void {
        const updated = this.drafts.filter((_, i) => i !== index);
        this.draftService.reset(updated);
    }

    goToSummary(): void {
        this.flow.goTo('summary');
    }
}
