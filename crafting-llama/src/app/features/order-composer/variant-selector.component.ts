import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Variant, Design } from '@core/catalog/design.types';
import { CommonModule } from '@angular/common';
import { DesignCardComponent } from '@shared/ui/card/design-card.component';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule, DesignCardComponent],
})
export class VariantSelectorComponent {
    @Input() design!: Design;
    @Input() selected: string | null = null;
    @Output() select = new EventEmitter<Variant>();

    get variants(): Variant[] {
        return this.design.variants ?? [];
    }

    onClick(variant: Variant): void {
        this.select.emit(variant);
    }
}
