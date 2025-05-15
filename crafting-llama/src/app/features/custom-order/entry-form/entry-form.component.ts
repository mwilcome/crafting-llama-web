import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { OrderFlowService } from '@services/order-flow.service';
import { FieldDef } from '@models/order-entry.model';

@Component({
    standalone: true,
    selector: 'app-entry-form',
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class EntryFormComponent {
    private drafts = inject(OrderDraftService);
    private forms = inject(OrderFormService);
    private flow = inject(OrderFlowService);

    readonly draft = this.drafts.active;
    readonly form = signal<FormGroup | null>(null);

    ngOnInit(): void {
        const current = this.draft();
        if (current) {
            const fg = this.forms.build(current.fields);
            this.form.set(fg);
        }
    }

    get fields(): FieldDef[] {
        return this.draft()?.fields ?? [];
    }

    onSubmit(): void {
        const current = this.draft();
        const form = this.form();
        if (form?.valid && current) {
            current.formData = form.value;
            this.flow.goTo('review');
        }
    }

    getError(key: string): string | null {
        const form = this.form();
        return form ? this.forms.getError(form, key) : null;
    }
}
