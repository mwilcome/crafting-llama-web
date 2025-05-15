import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderEntry } from './order-entry.model';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [CommonModule],
})
export class ReviewListComponent {
    @Input() drafts: OrderEntry[] = [];

    @Output() editDraft = new EventEmitter<OrderEntry>();
    @Output() removeDraft = new EventEmitter<string>();
    @Output() addNew = new EventEmitter<void>();

    edit(entry: OrderEntry): void {
        this.editDraft.emit(entry);
    }

    remove(id: string): void {
        this.removeDraft.emit(id);
    }

    add(): void {
        this.addNew.emit();
    }
}
