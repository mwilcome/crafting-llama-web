import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [CommonModule],
})
export class ReviewListComponent {
    readonly allDrafts;

    constructor(
        private readonly drafts: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        this.allDrafts = this.drafts.all;
    }

    edit(index: number): void {
        this.drafts.edit(index);
        this.flow.goTo('form');
    }

    remove(index: number): void {
        const updated = this.allDrafts().filter((_, i) => i !== index);
        this.drafts.reset(updated);
    }

    goToSummary(): void {
        this.flow.goTo('summary');
    }

    getDesignName(designId: string): string {
        return MOCK_DESIGNS.find((d) => d.id === designId)?.name ?? '??';
    }

    getImageUrl(entry: any): string | undefined {
        return this.drafts.getImageUrl(entry);
    }

    getKeys(obj: Record<string, any>): string[] {
        return Object.keys(obj);
    }
}
