import { OrderDraftEntry } from '@models/order-entry.model';
import { MOCK_DESIGNS } from '@core/catalog/designs';

export function getImageUrl(entry: OrderDraftEntry): string {
    return entry.heroImage || '/assets/images/placeholder/default.png';
}

export function getFieldLabel(designId: string, key: string): string {
    const variantFields = MOCK_DESIGNS.find(d => d.id === designId)
        ?.variants.flatMap(v => v.fields);
    return variantFields?.find(f => f.key === key)?.label ?? key;
}