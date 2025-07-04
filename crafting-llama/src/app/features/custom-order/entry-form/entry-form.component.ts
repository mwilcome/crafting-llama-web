import {
    Component,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
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
    imports: [ReactiveFormsModule, FieldRendererComponent],
})
export class EntryFormComponent {
    private formSvc  = inject(OrderFormService);
    private draft    = inject(OrderDraftService);
    private flow     = inject(OrderFlowService);
    private designs  = inject(DesignService).designs;
    private router   = inject(Router);
    private route    = inject(ActivatedRoute);
    private fb       = inject(FormBuilder);

    form: FormGroup = this.fb.group({});
    readonly ready  = signal(false);

    readonly entry       = computed(() => this.draft.currentEntry());
    readonly designList  = computed(() => this.designs());
    readonly allFields   = computed(() =>
        this.entry() ? this.formSvc.getFields(this.entry()!, this.designList()) : [],
    );

    constructor() {
        /* redirect if no active draft */
        effect(() => {
            if (!this.entry()) this.router.navigate(['../'], { relativeTo: this.route });
        });

        /* build / hydrate form exactly once */
        effect(() => {
            const e  = this.entry();
            const fs = this.allFields();
            if (!e || fs.length === 0 || this.ready()) return;

            this.form = this.formSvc.buildForm(fs, e);
            queueMicrotask(() => this.ready.set(true));
        });
    }

    showErrors = (key: string) => {
        const c = this.form.get(key);
        return !!c && c.invalid && (c.dirty || c.touched);
    };

    submit(): void {
        const e = this.entry();
        if (!e) return;

        if (this.form.invalid) {
            this.form.markAllAsTouched();

            queueMicrotask(() => {
                const first = document.querySelector(
                    '.ng-invalid[formcontrolname]',
                ) as HTMLElement | null;
                if (first) {
                    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    first.classList.add('field-shake');
                    setTimeout(() => first.classList.remove('field-shake'), 500);
                    first.focus({ preventScroll: true });
                }
            });
            return;
        }

        this.draft.updateEntry(e.id, {
            quantity: this.form.get('quantity')?.value ?? 1,
            values: { ...e.values, ...this.form.value },
        });

        this.flow.goTo('review');
        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
