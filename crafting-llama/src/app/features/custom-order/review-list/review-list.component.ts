import { Component, computed, inject } from '@angular/core';

import { Router } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { DesignService } from '@core/catalog/design.service';
import { OrderFormService } from '@services/order-form.service';
import { getImage, getDesignName, getVariantName } from '@core/utils/entry-utils';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: []
})
export class ReviewListComponent {
    private draft = inject(OrderDraftService);
    private designs = inject(DesignService).designs;
    private form = inject(OrderFormService);
    private router = inject(Router);

    readonly entries = computed(() => this.draft.entries());
    readonly designsList = computed(() => this.designs());

    getImage = getImage;
    getDesignName = getDesignName;
    getVariantName = getVariantName;

    getVisibleFields(entry: any) {
        return this.form.getFields(entry, this.designsList()).filter(f => !f.disabled);
    }

    getLabel(entry: any, key: string) {
        return this.form.getFieldLabel(entry, key, this.designsList());
    }

    getValue(entry: any, key: string) {
        const val = entry.values[key];
        return typeof val === 'string' ? val : (val?.name ?? '—');
    }

    edit(id: string) {
        this.draft.select(id);
        this.router.navigate(['/custom', 'form']);
    }

    remove(id: string) {
        this.draft.removeEntry(id);
    }

    goToSummary() {
        this.router.navigate(['/custom', 'summary']);
    }
}
