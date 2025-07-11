import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { PriceDisclaimerService } from './price-disclaimer.service';

@Component({
    selector: 'app-price-disclaimer',
    standalone: true,
    imports: [NgIf],
    templateUrl: './price-disclaimer.component.html',
    styleUrls: ['./price-disclaimer.component.scss'],
})
export class PriceDisclaimerComponent {
    private service = inject(PriceDisclaimerService);
    readonly visible = this.service.visible;

    dismiss(): void {
        this.service.dismiss();
    }
}
