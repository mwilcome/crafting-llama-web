import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignCardComponent } from '@shared/ui/card/design-card.component';
import { DesignMeta, VariantMeta } from '@core/catalog/design.types';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule, DesignCardComponent]
})
export class VariantSelectorComponent {
    @Input() design?: DesignMeta;
    @Input() selected: string | null = null;

    @Output() select = new EventEmitter<string>();

    get variants(): VariantMeta[] {
        return this.design?.variants ?? [];
    }

    onClick(variant: VariantMeta): void {
        this.select.emit(variant.id);
    }

    isSelected(variant: VariantMeta): boolean {
        return this.selected === variant.id;
    }
}
