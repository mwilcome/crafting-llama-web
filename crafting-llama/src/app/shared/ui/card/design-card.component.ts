import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DesignMeta } from '@core/catalog/design.types';

@Component({
    selector: 'app-design-card',
    standalone: true,
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.scss']
})
export class DesignCardComponent {
    @Input() design!: DesignMeta;
    @Input() selected = false;

    @Output() click = new EventEmitter<void>();

    onClick(): void {
        this.click.emit();
    }
}
