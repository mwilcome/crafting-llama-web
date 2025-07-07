import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { DesignService } from '@core/catalog/design.service';
import { OrderFormService } from '@services/order-form.service';
import { getImage, getDesignName, getVariantName } from '@core/utils/entry-utils';
import { storageUrl } from '@core/storage/storage-url';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [],
})
export class ReviewListComponent {
    private draft   = inject(OrderDraftService);
    private designs = inject(DesignService).designs;
    private formSvc = inject(OrderFormService);
    private router  = inject(Router);

    readonly entries      = computed(() => this.draft.entries());
    readonly designsList  = computed(() => this.designs());

    getImage       = getImage;
    getDesignName  = getDesignName;
    getVariantName = getVariantName;
    protected readonly storageUrl = storageUrl;

    getVisibleFields(entry: any) {
        return this.formSvc.getFields(entry, this.designsList()).filter(f => {
            if (f.disabled) return false;
            const val = entry.values?.[f.key];
            return !(
                val === null ||
                val === undefined ||
                (typeof val === 'string' && val.trim() === '') ||
                (Array.isArray(val) && val.length === 0)
            );
        });
    }

    getLabel(entry: any, key: string) {
        return this.formSvc.getFieldLabel(entry, key, this.designsList());
    }

    getValue(entry: any, key: string) {
        const val = entry.values[key];
        if (Array.isArray(val)) return val.join(', ');
        return typeof val === 'string' ? val : val?.name ?? null;
    }

    asFile(val: string | File | null): File | null {
        return val instanceof File ? val : null;
    }

    isHexColor(val: string | File | null): boolean {
        return typeof val === 'string' && /^#[0-9A-F]{6}$/i.test(val);
    }

    isImageFile(val: string | File | null): boolean {
        const file = this.asFile(val);
        return !!file?.type.startsWith('image/');
    }

    getImagePreview(file: File): string {
        return URL.createObjectURL(file);
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

    trackByField = (_: number, field: any) => field.key;
}
