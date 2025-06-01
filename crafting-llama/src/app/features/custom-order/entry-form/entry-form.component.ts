import {
    Component,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { OrderFlowService } from '@services/order-flow.service';
import { DesignService } from '@core/catalog/design.service';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [ReactiveFormsModule, FieldRendererComponent]
})
export class EntryFormComponent {
    private formService = inject(OrderFormService);
    private draft = inject(OrderDraftService);
    private flow = inject(OrderFlowService);
    private designs = inject(DesignService).designs;
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    form: FormGroup = this.fb.group({});
    readonly optionalVisible = signal(false);
    readonly ready = signal(false);

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

    readonly hydrateForm = effect(() => {
        const entry = this.entry();
        const fields = this.allFields();
        if (!entry || fields.length === 0) return;

        this.form = this.formService.buildForm(fields, entry);
        queueMicrotask(() => this.ready.set(true));
    });

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

        const mergedValues = {
            ...entry.values,
            ...this.form.value
        };

        if ('quantity' in mergedValues) delete mergedValues['quantity'];

        this.draft.updateEntry(entry.id, {
            quantity: this.form.get('quantity')?.value ?? 1,
            values: mergedValues
        });

        this.flow.goTo('review');
        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
