import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderFlowService } from '@services/order-flow.service';
import { OrderDraftService } from '@services/order-draft.service';
import { CommonModule } from '@angular/common';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import { computed } from '@angular/core';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
})
export class EntryFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private flow = inject(OrderFlowService);
    private drafts = inject(OrderDraftService);

    form!: FormGroup;

    readonly fieldDefs = computed(() => this.flow.inProgressEntry()?.fields ?? []);

    ngOnInit() {
        const entry = this.flow.inProgressEntry();
        const fields = entry?.fields ?? [];

        this.form = this.fb.group(
            Object.fromEntries(fields.map(field => [field.key, this.buildControl(field)]))
        );

        this.form.addControl('quantity', this.fb.control(entry?.quantity ?? 1));

        this.form.valueChanges.subscribe(value => {
            const { quantity, ...rest } = value as Record<string, string | number>;
            for (const [key, val] of Object.entries(rest)) {
                this.flow.updateInProgressField(key, val as string);
            }
            this.flow.updateQuantity(quantity as number);
        });
    }

    private buildControl(field: any) {
        return this.fb.control('', field.required ? { nonNullable: true } : undefined);
    }

    submit() {
        const entry = this.flow.inProgressEntry();
        if (!entry || this.form.invalid) return;

        this.drafts.addEntry({
            designId: entry.design.id,
            designName: entry.design.name,
            variantId: entry.variant.id,
            variantName: entry.variant.name,
            heroImage: entry.variant.heroImage,
            fields: entry.values,
            quantity: entry.quantity
        });

        this.flow.clearInProgress();
        this.flow.goTo('review');
    }
}
