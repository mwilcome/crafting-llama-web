import { FieldDef } from '@core/catalog/design.types';

export function coerceFields(raw: any[]): FieldDef[] {
    return raw.map((f): FieldDef => ({
        ...f,
        required: !!f.required,
        type: f.type ?? 'text'
    }));
}