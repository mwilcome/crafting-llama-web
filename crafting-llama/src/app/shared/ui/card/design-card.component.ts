import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Design } from '@core/catalog/design.types';

@Component({
    selector: 'app-design-card',
    standalone: true,
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.scss']
})
export class DesignCardComponent {
    @Input() design!: Design;
    @Input() selected = false;

    @Output() click = new EventEmitter<void>();

    onClick(): void {
        this.click.emit();
    }
}
