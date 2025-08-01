import {
    Component,
    computed,
    effect,
    inject,
    signal,
    DestroyRef,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { OrderFlowService } from '@services/order-flow.service';
import { DesignService } from '@core/catalog/design.service';
import { ColorService } from '@core/catalog/color.service';

import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import { DesignSidebarComponent } from '@shared/layout/design-sidebar/design-sidebar.component';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [ReactiveFormsModule, FieldRendererComponent, DesignSidebarComponent],
})
export class EntryFormComponent {
    /* ───────── injections ───────── */
    private readonly draft   = inject(OrderDraftService);
    private readonly formSvc = inject(OrderFormService);
    private readonly flow    = inject(OrderFlowService);
    private readonly designs = inject(DesignService).designs;
    private readonly colors  = inject(ColorService);
    private readonly router  = inject(Router);
    private readonly route   = inject(ActivatedRoute);
    private readonly fb      = inject(FormBuilder);
    private readonly destroy = inject(DestroyRef);

    /* ───────── reactive state ───────── */
    readonly design       = computed(() => this.draft.pendingDesign());
    readonly currentEntry = computed(() => this.draft.currentEntry());

    /** edit → false  |  add → true */
    readonly isNewEntry = computed(() => {
        const d = this.design();
        const e = this.currentEntry();
        return !e || !d || e.designId !== d.id;
    });

    /** Seed entry for the form */
    readonly effectiveEntry = computed(() =>
        this.isNewEntry() ? this.stubEntry() : this.currentEntry()
    );

    /** Field definitions */
    readonly allFields = computed(() => {
        const entry = this.effectiveEntry();
        if (!entry) return [];
        return this.formSvc.getFields(entry, this.designs(), this.isNewEntry());
    });

    /** Stub for a brand-new entry */
    readonly stubEntry = computed(() => {
        const d = this.design();
        return d
            ? {
                id       : 'stub',
                designId : d.id,
                variantId: d.variants?.[0]?.id ?? undefined,
                quantity : 1,
                values   : {},
                createdAt: new Date(),
            }
            : null;
    });

    /* ───────── ui holders ───────── */
    form: FormGroup = this.fb.group({});
    readonly ready  = signal(false);

    private readonly _selVariantId = signal<string | undefined>(undefined);
    readonly selectedVariant = computed(() =>
        this.design()?.variants?.find(v => v.id === this._selVariantId()) ?? null
    );

    title() { return this.design()?.name ?? ''; }

    /* ───────── ctor ───────── */
    constructor() {
        /* Guard: no design ⇒ bounce back */
        effect(() => {
            if (!this.design()) {
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });

        /* Build / rebuild the form reactively */
        effect(() => {
            const entry  = this.effectiveEntry();
            const fields = this.allFields();
            if (!entry) return;

            console.debug(
                '[EntryForm] build',
                { entryId: entry.id, designId: entry.designId, new: this.isNewEntry() },
                fields.map(f => f.key)
            );

            this.form  = this.fb.group({});
            this.ready.set(false);

            const visible = fields.filter(f => f.type !== 'hidden');

            const init = async () => {
                await this.colors.loadColors();

                if (visible.length === 0) {
                    queueMicrotask(() => this.submit());
                    return;
                }

                this.form = this.formSvc.buildForm(fields, entry);
                this.form.patchValue(entry.values ?? {});
                this.form.get('quantity')?.patchValue(entry.quantity ?? 1);

                /* auto-cleanup via takeUntilDestroyed */
                this.form.valueChanges
                    .pipe(takeUntilDestroyed(this.destroy))
                    .subscribe(() => this.updateVariant());

                this.updateVariant();
                queueMicrotask(() => this.ready.set(true));
            };
            init();
        });
    }

    /* ───────── helpers ───────── */
    private updateVariant() {
        const d = this.design();
        if (!d) return;

        const fields = this.allFields();
        const vals   = this.form.value ?? {};

        const variantField = fields.find(
            f =>
                (f.type === 'dropdown' || f.type === 'radio') &&
                f.options &&
                d.variants &&
                f.options.length === d.variants.length &&
                f.options.every(o => d.variants!.some(v => v.id === o.value))
        );

        let id: string | undefined = variantField ? vals[variantField.key] : undefined;
        if (!id && d.variants?.length) id = d.variants[0].id;

        this._selVariantId.set(id);
    }

    showErrors = (key: string) => {
        const c = this.form.get(key);
        return !!c && c.invalid && (c.dirty || c.touched);
    };

    /* ───────── submit ───────── */
    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            queueMicrotask(() => {
                const first = document.querySelector(
                    '.ng-invalid[formcontrolname]'
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

        const d = this.design();
        if (!d) return;

        const payload = {
            variantId: this._selVariantId() ?? d.variants?.[0]?.id ?? undefined,
            quantity : this.form.get('quantity')?.value ?? 1,
            values   : this.form.getRawValue(),
        };

        if (this.isNewEntry()) {
            this.draft.addEntry({
                id: crypto.randomUUID(),
                designId: d.id,
                createdAt: new Date(),
                ...payload,
            });
        } else {
            this.draft.updateEntry(this.currentEntry()!.id, payload);
        }

        this.draft.clearSelect();
        this.draft.clearPendingDesign();

        this.flow.goTo('review');
        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
