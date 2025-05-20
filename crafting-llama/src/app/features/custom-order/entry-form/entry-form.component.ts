import {Component, OnInit, computed, signal, inject} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { DesignService } from '@core/catalog/design.service';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
})
export class EntryFormComponent implements OnInit {
    private draft = inject(OrderDraftService);
    private formService = inject(OrderFormService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private designs = inject(DesignService).designs;

    form!: FormGroup;
    optionalVisible = signal(false);

    readonly fields = computed(() => {
        const entry = this.draft.currentEntry();
        return entry ? this.formService.getFields(entry, this.designs()) : [];
    });

    readonly requiredFields = computed(() =>
        this.fields().filter(f => f.required)
    );

    readonly optionalFields = computed(() =>
        this.fields().filter(f => !f.required)
    );

    ngOnInit(): void {
        this.form = this.formService.buildForm(this.fields());
    }

    showErrors(field: string): boolean {
        const control = this.form.get(field);
        return !!control && control.invalid && (control.dirty || control.touched);
    }

    submit(): void {
        if (!this.form.valid) {
            // scroll to the first invalid control
            const firstInvalid = document.querySelector(
                '.ng-invalid[formcontrolname]'
            ) as HTMLElement;

            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus({ preventScroll: true });
            }

            this.form.markAllAsTouched();
            return;
        }

        const entry = this.draft.currentEntry();
        if (!entry) return;

        this.draft.updateEntry(entry.id, {
            quantity: this.form.get('quantity')?.value ?? 1,
            values: this.form.value
        });

        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
