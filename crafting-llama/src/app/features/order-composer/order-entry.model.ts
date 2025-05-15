import { FormGroup } from '@angular/forms';
import { Design, Variant } from '@core/catalog/design.types';

export type StepName = 'select' | 'variant' | 'form' | 'review';

export interface OrderDraftEntry {
    id: string;
    design: Design | undefined;
    variant: Variant | null | undefined;
    form: FormGroup | null | undefined;
    imagePreviews: Record<string, string>;
}

export interface OrderEntry {
    id: string;
    design: Design;
    variant?: Variant;
    form: Record<string, any>;
}
