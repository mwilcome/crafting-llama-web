import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignMeta } from '@core/catalog/design.types';
import { OrderDraftEntry } from './order-entry.model';
import {DesignCardComponent} from "@shared/ui/card/design-card.component";

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [CommonModule, DesignCardComponent]
})
export class DesignSelectorComponent {
    @Input() designs: DesignMeta[] = [];
    @Input() draft: OrderDraftEntry | null = null;

    @Output() select = new EventEmitter<DesignMeta>();

    onClick(design: DesignMeta): void {
        this.select.emit(design);
    }
}
