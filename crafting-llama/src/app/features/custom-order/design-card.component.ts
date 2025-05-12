import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignMeta } from '@core/design/design.service';

@Component({
    selector: 'app-design-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.css']
})
export class DesignCardComponent {
    @Input({ required: true }) design!: DesignMeta;
    @Output() select = new EventEmitter<DesignMeta>();

    click() {
        this.select.emit(this.design);
    }
}
