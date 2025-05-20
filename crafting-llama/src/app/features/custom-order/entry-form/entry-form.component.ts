import {Component, OnInit, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { Router, ActivatedRoute } from '@angular/router';
import { getFields } from '@core/utils/field-coercion';
import { FieldRendererComponent } from '../field-renderer/field-renderer.component';
import {DesignService} from "@core/catalog/design.service";

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
})
export class EntryFormComponent implements OnInit {
    readonly designs = inject(DesignService).designs;
    form!: FormGroup;

    constructor(
        private draft: OrderDraftService,
        private formService: OrderFormService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    readonly fields = computed(() => {
        const entry = this.draft.currentEntry();
        return entry ? getFields(entry, this.designs()) : [];
    });

    ngOnInit(): void {
        this.form = this.formService.buildForm(this.fields());
    }

    submit(): void {
        const entry = this.draft.currentEntry();
        if (!entry || !this.form.valid) return;

        this.draft.updateEntry(entry.id, {
            quantity: this.form.get('quantity')?.value ?? 1,
            values: this.form.value,
        });

        this.router.navigate(['../review'], { relativeTo: this.route });
    }
}
