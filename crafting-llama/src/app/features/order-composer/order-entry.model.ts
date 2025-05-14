import { FormGroup } from '@angular/forms';
import { DesignMeta, VariantMeta } from '@core/catalog/design.types';

export type StepName = 'select' | 'variant' | 'form' | 'review';

export interface OrderDraftEntry {
    id: string;
    design: DesignMeta;
    variant?: VariantMeta;
    form: FormGroup;
    imagePreviews: Record<string, string>;
}
