import { FieldDef, OrderDraftEntry, Design } from '@core/catalog/design.types';
import { getEntryDesign, getEntryVariant } from './entry-utils';

export function getFields(entry: OrderDraftEntry, designs: Design[]): FieldDef[] {
    const design = getEntryDesign(entry, designs);
    const variant = getEntryVariant(entry, designs);
    return variant?.fields ?? design?.fields ?? [];
}

export function getFieldLabel(entry: OrderDraftEntry, key: string, designs: Design[]): string {
    return getFields(entry, designs).find(f => f.key === key)?.label ?? key;
}
