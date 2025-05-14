import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { OrderContextService } from './order-context.service';
import {Observable} from "rxjs";
import {Design} from "@core/catalog/design.types";
import {DesignService} from "@core/catalog/design.service";
import {DesignSelectorComponent} from "@features/order-composer/design-selector.component";

@Component({
    selector: 'app-order-composer',
    standalone: true,
    imports: [NgIf, AsyncPipe, DesignSelectorComponent],
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss']
})
export class OrderComposerComponent implements OnInit {
    step$!: Observable<'select' | 'variant' | 'form' | 'review'>;
    designs: Design[] = [];


    constructor(
        protected ctx: OrderContextService,
        private designService: DesignService
    ) {}

    ngOnInit(): void {
        this.ctx.initialize();
        this.designService.getDesigns().subscribe(d => (this.designs = d));
        this.step$ = this.ctx.step$;
    }
}
