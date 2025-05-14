import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftEntry } from './order-entry.model';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [CommonModule]
})
export class ReviewListComponent {
    @Input() drafts: OrderDraftEntry[] = [];

    /** ID of draft to edit */
    @Output() editDraft   = new EventEmitter<string>();
    /** ID of draft to remove */
    @Output() removeDraft = new EventEmitter<string>();
    /** create a new draft */
    @Output() addNew      = new EventEmitter<void>();

    onEdit(id: string): void {
        console.log('Review‑list emits editDraft →', id);
        this.editDraft.emit(id);
    }
    onRemove(id: string): void { this.removeDraft.emit(id); }
    onAdd(): void              { this.addNew.emit(); }

    formatValue(value: unknown): string {
        if (Array.isArray(value)) return value.join(', ');
        if (value === true)  return 'Yes';
        if (value === false) return 'No';
        return String(value ?? '');
    }
}
