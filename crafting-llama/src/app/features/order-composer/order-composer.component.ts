import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { Design, Variant } from '@core/catalog/design.types';
import { OrderEntry } from './order-entry.model';
import { OrderContextService } from './order-context.service';

import { DesignSelectorComponent } from './design-selector.component';
import { VariantSelectorComponent } from './variant-selector.component';
import { EntryFormComponent } from './entry-form.component';
import { ReviewListComponent } from './review-list.component';

import designsJson from '../../../assets/placeholder/designs.json';

@Component({
    selector: 'app-order-composer',
    standalone: true,
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DesignSelectorComponent,
        VariantSelectorComponent,
        EntryFormComponent,
        ReviewListComponent
    ]
})
export class OrderComposerComponent {
    private ctx = inject(OrderContextService);
    private isEditing = false;

    step = signal<'select' | 'variant' | 'form' | 'review'>('select');
    draft = this.ctx.draft$;
    drafts = this.ctx.drafts$;
    designs = signal<Design[]>(designsJson as Design[]);

    onDesignSelected(design: Design) {
        this.ctx.setDesign(design);
        const hasVariants = Array.isArray(design.variants) && design.variants.length > 0;
        this.step.set(hasVariants ? 'variant' : 'form');
    }

    onVariantSelected(variant: Variant) {
        this.ctx.setVariant(variant);
        this.step.set('form');
    }

    onFormReady(form: FormGroup) {
        this.ctx.setForm(form);

        if (this.isEditing) {
            // Do not finalize or move forward yet — let user submit
            return;
        }

        this.ctx.finalizeDraft();
        this.step.set('review');
    }


    onEditDraft(entry: OrderEntry) {
        this.isEditing = true;
        this.ctx.loadDraft(entry);
        setTimeout(() => this.step.set('form'), 0);
    }


    onRemoveDraft(id: string) {
        this.ctx.removeDraft(id);
    }

    onAddNewDraft() {
        this.ctx.resetDraft();
        this.isEditing = false;
        this.step.set('select');
    }

}
