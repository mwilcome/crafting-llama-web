import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { OrderFlowService } from '@services/order-flow.service';
import { DesignService } from '@core/catalog/design.service';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
})
export class EntryFormComponent implements OnInit {
    private formService = inject(OrderFormService);
    private draft = inject(OrderDraftService);
    private flow = inject(OrderFlowService);
    private designs = inject(DesignService).designs;
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    form: FormGroup = this.fb.group({});
    readonly optionalVisible = signal(false);

    readonly entry = computed(() => this.draft.currentEntry());
    readonly designList = computed(() => this.designs());
    readonly allFields = computed(() =>
        this.entry() ? this.formService.getFields(this.entry()!, this.designList()) : []
    );

    readonly requiredFields = computed(() =>
        this.allFields().filter(f => f.required)
    );

    readonly optionalFields = computed(() =>
        this.allFields().filter(f => !f.required)
    );

    ngOnInit(): void {
        if (this.entry()) {
            this.form = this.formService.buildForm(this.allFields());
        }
    }

    showErrors = (fieldKey: string): boolean => {
        const control = this.form.get(fieldKey);
        return !!control && control.invalid && (control.dirty || control.touched);
    };

    submit(): void {
        const entry = this.entry();
        if (!entry) return;

        if (!this.form.valid) {
            const firstInvalid = document.querySelector('.ng-invalid[formcontrolname]') as HTMLElement;
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.classList.add('field-shake');
                setTimeout(() => firstInvalid.classList.remove('field-shake'), 500);
                firstInvalid.focus({ preventScroll: true });
            }
            this.form.markAllAsTouched();
            return;
        }

        this.draft.updateEntry(entry.id, {
            quantity: this.form.get('quantity')?.value ?? 1,
            values: this.form.value,
        });

        this.flow.goTo('review');
        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
