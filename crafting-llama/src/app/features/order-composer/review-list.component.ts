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

    @Output() edit = new EventEmitter<string>();
    @Output() remove = new EventEmitter<string>();
    @Output() addNew = new EventEmitter<void>();

    onEdit(id: string): void {
        this.edit.emit(id);
    }

    onRemove(id: string): void {
        this.remove.emit(id);
    }

    onAdd(): void {
        this.addNew.emit();
    }

    formatValue(value: any): string {
        if (value && typeof value === 'object' && 'name' in value) {
            return value.name;
        }
        return String(value ?? '');
    }

}
