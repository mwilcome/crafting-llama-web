import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Design, Variant } from '@core/catalog/design.types';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule]
})
export class VariantSelectorComponent {
    @Input() design!: Design;
    @Input() selected: string | null = null;

    @Output() select = new EventEmitter<Variant>();

    onClick(variant: Variant) {
        this.select.emit(variant);
    }

    isSelected(v: Variant): boolean {
        return this.selected === v.id;
    }
}
