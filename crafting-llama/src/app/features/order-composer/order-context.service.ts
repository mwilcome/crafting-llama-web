import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderEntry, OrderDraftEntry } from './order-entry.model';
import {Design} from "@core/catalog/design.types";

@Injectable({ providedIn: 'root' })
export class OrderContextService {
    private entries = new BehaviorSubject<OrderEntry[]>([]);
    private draft = new BehaviorSubject<OrderDraftEntry | null>(null);
    private step = new BehaviorSubject<'select' | 'variant' | 'form' | 'review'>('select');

    entries$: Observable<OrderEntry[]> = this.entries.asObservable();
    draft$: Observable<OrderDraftEntry | null> = this.draft.asObservable();
    step$: Observable<'select' | 'variant' | 'form' | 'review'> = this.step.asObservable();

    initialize(): void {
        this.entries.next([]);
        this.draft.next(null);
        this.step.next('select');
    }

    selectDesign(design: Design): void {
        const hasVariants = !!design.variants?.length;

        this.draft.next({
            design,
            variant: hasVariants ? undefined : {
                id: design.id + '-default',
                name: design.name,
                fields: design.fields ?? []
            },
            form: {} as any // will be overwritten
        });

        this.step.next(hasVariants ? 'variant' : 'form');
    }

}
