import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';
import { Subscription } from 'rxjs';
import {OrderFlowService} from "@services/order-flow.service";

@Component({
    selector: 'app-field-renderer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './field-renderer.component.html',
    styleUrls: ['./field-renderer.component.scss'],
})
export class FieldRendererComponent implements OnInit, OnDestroy {
    @Input({ required: true }) field!: FieldDef;
    @Input({ required: true }) form!: FormGroup;

    private readonly flow = inject(OrderFlowService);
    private sub?: Subscription;

    ngOnInit(): void {
        const control = this.form.get(this.field.key);
        if (control) {
            this.sub = control.valueChanges.subscribe(val => {
                this.flow.updateInProgressField(this.field.key, val);
            });
        }
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    onCheckboxChange(event: Event, value: string): void {
        const input = event.target as HTMLInputElement;
        const existing = this.form.get(this.field.key)?.value ?? [];
        const updated = input.checked
            ? [...existing, value]
            : existing.filter((v: string) => v !== value);
        this.form.get(this.field.key)?.setValue(updated);
        this.flow.updateInProgressField(this.field.key, updated);
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0] ?? null;
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                this.form.get(this.field.key)?.setValue(base64);
                this.flow.updateInProgressField(this.field.key, base64);
            };
            reader.readAsDataURL(file);
        }
    }

    onImagePreviewChange(event: Event, key: string): void {
        this.onFileChange(event);
    }
}
