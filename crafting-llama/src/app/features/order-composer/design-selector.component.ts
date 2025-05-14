import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { Design } from '@core/catalog/design.types';
import { DesignCardComponent } from '@shared/ui/card/design-card.component';

@Component({
    selector: 'app-design-selector',
    standalone: true,
    imports: [NgFor, DesignCardComponent],
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss']
})
export class DesignSelectorComponent {
    @Input() designs: Design[] = [];
    @Output() select = new EventEmitter<Design>();

    onClick(design: Design): void {
        this.select.emit(design);
    }
}
