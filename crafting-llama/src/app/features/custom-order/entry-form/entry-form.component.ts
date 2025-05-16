import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderFormService } from '@services/order-form.service';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import { ToastService } from '@shared/services/toast/toast.service';
import { signal } from '@angular/core';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    imports: [CommonModule, FieldRendererComponent, ReactiveFormsModule],
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
})
export class EntryFormComponent {
    private readonly formService = inject(OrderFormService);
    private readonly drafts = inject(OrderDraftService);
    private readonly flow = inject(OrderFlowService);
    private readonly toast = inject(ToastService);

    readonly draft = this.drafts.active();
    readonly form = signal<FormGroup>(this.formService.build(this.draft?.fields ?? []));

    constructor() {
        if (this.draft?.fields?.length === 0) {
            this.drafts.hydrateFieldsFromVariant(this.draft);
        }
    }

    onSubmit(): void {
        if (!this.form().valid || !this.draft) return;

        const updatedEntry = {
            ...this.draft,
            formData: this.form().value,
            quantity: this.form().get('quantity')?.value ?? 1,
        };

        this.drafts.add(updatedEntry);
        this.toast.show('Item added to order!', { type: 'success' });
        this.flow.goTo('review');
    }
}
