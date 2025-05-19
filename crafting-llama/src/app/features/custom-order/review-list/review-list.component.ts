import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { getFieldLabel, getImageUrl } from '@core/utils/entry-utils';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Component({
    selector: 'app-review-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent {
    private drafts = inject(OrderDraftService);
    private flow = inject(OrderFlowService);

    readonly entries = this.drafts.allDrafts;

    edit(id: string) {
        const entry = this.drafts.getEntryById(id);
        if (!entry) return;

        const design = MOCK_DESIGNS.find(d => d.id === entry.designId);
        const variant = design?.variants.find(v => v.id === entry.variantId);

        if (!design || !variant) return;

        this.flow.startNewEntry(design, variant);

        Object.entries(entry.fields).forEach(([key, val]) => {
            this.flow.updateInProgressField(key, val);
        });

        this.flow.updateQuantity(entry.quantity);
        this.drafts.deleteEntry(id);
        this.flow.goTo('form');
    }

    remove(id: string) {
        this.drafts.deleteEntry(id);
    }

    getImageUrl = getImageUrl;

    getFieldLabel(entry: any, key: string): string {
        return getFieldLabel(entry.designId, key);
    }

    protected readonly Object = Object;
}
