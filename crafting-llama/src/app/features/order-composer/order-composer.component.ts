import { Component, effect, inject, signal } from '@angular/core';
import { DesignService } from '@core/catalog/design.service';
import { DesignMeta } from '@core/catalog/design.types';
import { OrderContextService } from './order-context.service';
import { VariantSelectorComponent } from '@features/order-composer/variant-selector.component';
import { EntryFormComponent } from '@features/order-composer/entry-form.component';
import { ReviewListComponent } from '@features/order-composer/review-list.component';
import { DesignSelectorComponent } from '@features/order-composer/design-selector.component';
import { NgIf } from '@angular/common';

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

    readonly step = this.context.stepSignal;
    readonly draft = this.context.draftSignal;
    readonly drafts = signal(this.context.getAllDrafts());

    readonly designs = signal<DesignMeta[]>([]);

    constructor() {
        this.designService.getDesigns().subscribe(designs => {
            this.designs.set(designs);
        });

        effect(() => {
            this.drafts.set(this.context.getAllDrafts());
        });
    }

    onDesignSelected(design: DesignMeta) {
        this.context.selectDesign(design);

        if (design.variants && design.variants.length > 0) {
            this.context.setStep('variant');
        } else {
            this.context.setStep('form');
        }
    }

    onVariantSelected(variantId: string) {
        this.context.selectVariant(variantId);
        this.context.setStep('form');
    }

    onFormReady(form: any) {
        this.context.saveForm(form);
        this.context.setStep('review');
    }

    onEditDraft(id: string) {
        this.context.editDraft(id);
        this.context.setStep('form');
    }

    onRemoveDraft(id: string) {
        this.context.removeDraft(id);
    }

    onAddNewDraft() {
        this.context.addNewDraft();
    }
}
