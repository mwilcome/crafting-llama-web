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
    private formSvc = inject(OrderFormService);
    private draft = inject(OrderDraftService);
    private flow = inject(OrderFlowService);
    private designs = inject(DesignService).designs;
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    form: FormGroup = this.fb.group({});
    readonly ready = signal(false);

    readonly design = computed(() => this.draft.pendingDesign());
    readonly stubEntry = computed(() => {
        const d = this.design();
        return d
            ? {
                id: 'stub',
                designId: d.id,
                variantId: d.variants?.[0]?.id ?? undefined,
                quantity: 1,
                values: {},
                createdAt: new Date(),
            }
            : null;
    });

    readonly allFields = computed(() =>
        this.stubEntry() ? this.formSvc.getFields(this.stubEntry()!, this.designs()) : []
    );

    constructor() {
        effect(() => {
            if (!this.design()) {
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });

        effect(() => {
            const stub = this.stubEntry();
            const fields = this.allFields();
            if (!stub || fields.length === 0 || this.ready()) return;

            this.form = this.formSvc.buildForm(fields, stub);
            queueMicrotask(() => this.ready.set(true));
        });
    }

    showErrors = (key: string) => {
        const c = this.form.get(key);
        return !!c && c.invalid && (c.dirty || c.touched);
    };

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            queueMicrotask(() => {
                const first = document.querySelector('.ng-invalid[formcontrolname]') as HTMLElement | null;
                if (first) {
                    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    first.classList.add('field-shake');
                    setTimeout(() => first.classList.remove('field-shake'), 500);
                    first.focus({ preventScroll: true });
                }
            });
            return;
        }

        const d = this.design();
        if (!d) return;

        this.draft.addEntry({
            id: crypto.randomUUID(),
            designId: d.id,
            variantId: d.variants?.[0]?.id ?? undefined,
            quantity: this.form.get('quantity')?.value ?? 1,
            values: this.form.getRawValue(),
            createdAt: new Date(),
        });

        this.draft.clearPendingDesign();
        this.flow.goTo('review');
        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
