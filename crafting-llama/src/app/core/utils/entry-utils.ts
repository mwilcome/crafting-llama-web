import { OrderDraftEntry, Design, Variant } from '@core/catalog/design.types';

export function getEntryDesign(entry: OrderDraftEntry, designs: Design[]): Design | undefined {
    return designs.find(d => d.id === entry.designId);
}

export function getEntryVariant(entry: OrderDraftEntry, designs: Design[]): Variant | undefined {
    return getEntryDesign(entry, designs)?.variants?.find(v => v.id === entry.variantId);
}

export function getImage(entry: OrderDraftEntry, designs: Design[]): string {
    const variant = getEntryVariant(entry, designs);
    const design = getEntryDesign(entry, designs);
    return variant?.heroImage ?? design?.heroImage ?? 'assets/images/placeholder.png';
}

export function getDesignName(entry: OrderDraftEntry, designs: Design[]): string {
    return getEntryDesign(entry, designs)?.name ?? entry.designId;
}

export function getVariantName(entry: OrderDraftEntry, designs: Design[]): string {
    return getEntryVariant(entry, designs)?.name ?? entry.variantId ?? '(default)';
}
