import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { OrderContextService } from './order-context.service';
import { OrderEntry, Variant, Design } from './order-entry.model';
import { DesignSelectorComponent } from './design-selector.component';
import { VariantSelectorComponent } from './variant-selector.component';
import { EntryFormComponent } from './entry-form.component';
import { ReviewListComponent } from './review-list.component';

@Component({
    selector: 'app-order-composer',
    standalone: true,
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss'],
    imports: [
        CommonModule,
        DesignSelectorComponent,
        VariantSelectorComponent,
        EntryFormComponent,
        ReviewListComponent,
    ],
})
export class OrderComposerComponent {
    get draft() {
        return this.ctx.draft;
    }

    get drafts() {
        return this.ctx.drafts;
    }

    get designs() {
        return this.ctx.designs;
    }

    isEditing = false;

    private stepState = ['select', 'variant', 'form', 'review'] as const;
    private currentStepIndex = 0;

    constructor(private ctx: OrderContextService) {}

    step(): string {
        return this.stepState[this.currentStepIndex];
    }

    setStep(name: string): void {
        const index = this.stepState.indexOf(name as any);
        if (index >= 0) this.currentStepIndex = index;
    }

    onDesignSelected(design: Design): void {
        this.ctx.setDesign(design);
        const hasVariants = Array.isArray(design.variants) && design.variants.length > 0;
        this.setStep(hasVariants ? 'variant' : 'form');
    }

    onVariantSelected(variant: Variant): void {
        this.ctx.setVariant(variant);
        this.setStep('form');
    }

    onFormReady(form: FormGroup): void {
        this.ctx.setForm(form);
    }

    onFormCompleted(form: FormGroup): void {
        this.ctx.setForm(form);

        if (this.isEditing) {
            const d = this.draft();
            this.ctx.resumeDraft({
                id: d.id,
                design: d.design!,
                variant: d.variant ?? undefined,
                form
            });
        } else {
            this.ctx.finalizeDraft();
        }

        this.setStep('review');
        this.isEditing = false;
    }

    onBack(): void {
        if (this.step() === 'form') {
            this.setStep(this.draft().variant ? 'variant' : 'select');
        } else if (this.step() === 'variant') {
            this.setStep('select');
        }
    }

    onEditDraft(entry: OrderEntry): void {
        this.ctx.resumeDraft(entry);

        const hasVariants = Array.isArray(entry.design.variants) && entry.design.variants.length > 0;
        const hasVariantSet = !!entry.variant;

        this.setStep(hasVariants && !hasVariantSet ? 'variant' : 'form');
        this.isEditing = true;
    }

    onRemoveDraft(id: string): void {
        this.ctx.removeDraft(id);
    }

    onAddNewDraft(): void {
        this.ctx.resetDraft();
        this.setStep('select');
    }
}
