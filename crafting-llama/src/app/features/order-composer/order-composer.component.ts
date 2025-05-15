import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderContextService } from './order-context.service';
import { Design, Variant } from '@core/catalog/design.types';
import { OrderEntry } from './order-entry.model';
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
        ReactiveFormsModule,
        DesignSelectorComponent,
        VariantSelectorComponent,
        EntryFormComponent,
        ReviewListComponent
    ]
})
export class OrderComposerComponent {
    readonly ctx = inject(OrderContextService);

    readonly draft = this.ctx.draft;
    readonly drafts = this.ctx.drafts;
    readonly designs = this.ctx.designs;

    step = signal<'select' | 'variant' | 'form' | 'review'>('select');
    isEditing = false;

    onDesignSelected(design: Design): void {
        this.ctx.setDesign(design);
        const hasVariants = (design.variants?.length ?? 0) > 0;
        this.step.set(hasVariants ? 'variant' : 'form');
    }

    onVariantSelected(variant: Variant): void {
        this.ctx.setVariant(variant);
        this.step.set('form');
    }

    onFormReady(form: FormGroup): void {
        this.ctx.setForm(form);
    }

    onFormCompleted(form: FormGroup): void {
        this.ctx.setForm(form);
        this.ctx.finalizeDraft();
        this.step.set('review');
        this.isEditing = false;
    }

    onBack(): void {
        const d = this.ctx.draft();
        if (this.step() === 'form') {
            this.step.set(d.variant ? 'variant' : 'select');
        } else if (this.step() === 'variant') {
            this.step.set('select');
        }
    }

    onEditDraft(entry: OrderEntry): void {
        this.ctx.loadDraft(entry);
        this.isEditing = true;
        setTimeout(() => this.step.set('form'), 0);
    }

    onRemoveDraft(id: string): void {
        this.ctx.removeDraft(id);
    }

    onAddNewDraft(): void {
        this.ctx.resetDraft();
        this.isEditing = false;
        this.step.set('select');
    }
}
