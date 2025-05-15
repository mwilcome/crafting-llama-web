import { Component, computed, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { OrderFormService } from '@services/order-form.service';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import { OrderDraftEntry } from '@models/order-entry.model';
import {FieldDef} from "@core/catalog/design.types";

@Component({
    selector: 'app-entry-form',
    standalone: true,
    imports: [CommonModule, FieldRendererComponent, ReactiveFormsModule],
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
})
export class EntryFormComponent {
    readonly draft: OrderDraftEntry | null;
    readonly fields: FieldDef[];
    readonly form: WritableSignal<FormGroup>;

    constructor(
        private readonly formService: OrderFormService,
        private readonly drafts: OrderDraftService,
        private readonly flow: OrderFlowService,
        private readonly toast: ToastService
    ) {
        this.draft = this.drafts.active();
        this.fields = this.draft?.fields ?? [];

        // Hydrate draft from variant (if needed)
        if (this.draft) {
            this.drafts.hydrateFieldsFromVariant(this.draft);
        }

        this.form = signal(this.formService.build(this.fields));
    }

    onSubmit(): void {
        if (!this.form().valid || !this.draft) return;

        const updated: OrderDraftEntry = {
            ...this.draft,
            formData: this.form().value,
            quantity: this.form().get('quantity')?.value ?? 1,
        };

        this.drafts.add(updated);
        this.toast.show('Item added to order!', { type: 'success' });
        this.flow.goTo('review');
    }
}
