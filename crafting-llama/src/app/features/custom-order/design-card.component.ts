import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Design } from '@core/design/design.service';

@Component({
    selector: 'app-design-card',
    standalone: true,
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.scss']
})
export class DesignCardComponent {
    @Input() design!: Design;
    @Input() selected = false;
    @Output() select = new EventEmitter<void>();

    click(): void {
        this.select.emit();
    }
}
