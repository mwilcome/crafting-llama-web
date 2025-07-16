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
import { ColorService } from '@core/catalog/color.service';

import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import {DesignSidebarComponent} from "@shared/layout/design-sidebar/design-sidebar.component";

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [ReactiveFormsModule, FieldRendererComponent, DesignSidebarComponent],
})
export class EntryFormComponent {
    private formSvc = inject(OrderFormService);
    private draft = inject(OrderDraftService);
    private flow = inject(OrderFlowService);
    private designs = inject(DesignService).designs;
    private colorService = inject(ColorService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    title() {
        return this.design()?.name ?? '';
    }

    form: FormGroup = this.fb.group({});
    readonly ready = signal(false);

    private _selectedVariantId = signal<string | undefined>(undefined);

    readonly selectedVariant = computed(() => {
        const id = this._selectedVariantId();
        const d = this.design();
        return d?.variants?.find(v => v.id === id) ?? null;
    });

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
            if (!stub || this.ready()) return;

            const visibleFields = fields.filter(f => f.type !== 'hidden');

            const init = async () => {
                await this.colorService.loadColors();
                if (visibleFields.length === 0) {
                    queueMicrotask(() => this.submit());
                } else {
                    this.form = this.formSvc.buildForm(fields, stub);
                    this.form.valueChanges.subscribe(() => this.updateSelectedVariantId());
                    this.updateSelectedVariantId();
                    queueMicrotask(() => this.ready.set(true));
                }
            };

            init();
        });
    }

    private updateSelectedVariantId() {
        const d = this.design();
        if (!d) return;

        const fields = this.allFields();
        const formValues = this.form.value ?? {};

        const variantField = fields.find(f =>
            (f.type === 'dropdown' || f.type === 'radio') &&
            f.options &&
            d.variants &&
            f.options.length === d.variants.length &&
            f.options.every(o => d.variants!.some(v => v.id === o.value))
        );

        let selId: string | undefined;
        if (variantField) {
            selId = formValues[variantField.key];
        }

        if (!selId && d.variants?.length) {
            selId = d.variants[0].id;
        }

        this._selectedVariantId.set(selId);
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
            variantId: this._selectedVariantId() ?? d.variants?.[0]?.id ?? undefined,
            quantity: this.form.get('quantity')?.value ?? 1,
            values: this.form.getRawValue(),
            createdAt: new Date(),
        });

        this.draft.clearPendingDesign();
        this.flow.goTo('review');
        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
