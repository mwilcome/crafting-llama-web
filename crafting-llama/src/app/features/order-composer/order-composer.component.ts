import { Component, effect, inject, signal } from '@angular/core';
import { DesignService } from '@core/catalog/design.service';
import { DesignMeta } from '@core/catalog/design.types';
import { OrderContextService } from './order-context.service';
import { VariantSelectorComponent } from './variant-selector.component';
import { EntryFormComponent } from './entry-form.component';
import { ReviewListComponent } from './review-list.component';
import { DesignSelectorComponent } from './design-selector.component';
import { NgIf } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-order-composer',
    standalone: true,
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss'],
    imports: [
        VariantSelectorComponent,
        EntryFormComponent,
        ReviewListComponent,
        DesignSelectorComponent,
        NgIf
    ]
})
export class OrderComposerComponent {
    private readonly context = inject(OrderContextService);
    private readonly designService = inject(DesignService);

    readonly step   = this.context.stepSignal;
    readonly draft  = this.context.draftSignal;
    readonly drafts = signal(this.context.getAllDrafts());
    readonly designs = signal<DesignMeta[]>([]);

    constructor() {
        this.designService.getDesigns().subscribe(ds => this.designs.set(ds));
        effect(() => this.drafts.set(this.context.getAllDrafts()));
    }

    /* ───────── step handlers ───────── */

    onDesignSelected(design: DesignMeta) {
        this.context.selectDesign(design);
        this.context.setStep(design.variants?.length ? 'variant' : 'form');
    }

    onVariantSelected(variantId: string) {
        this.context.selectVariant(variantId);
        this.context.setStep('form');
    }

    onFormReady(form: FormGroup) {
        if (this.draft()?.form === form) return;
        const wasEmpty = !this.draft()?.form;
        this.context.saveForm(form);
        if (wasEmpty) this.context.setStep('review');
    }


    onEditDraft(id: string)   { this.context.editDraft(id);   this.context.setStep('form'); }
    onRemoveDraft(id: string) { this.context.removeDraft(id); }
    onAddNewDraft()           { this.context.addNewDraft();   }
}
