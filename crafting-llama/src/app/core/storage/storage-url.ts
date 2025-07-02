import { inject } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

/**
 * Turn a storage path like "gallery/2025-07/hoop.png"
 * into a full CDN URL served by Supabase Storage.
 */
export function storageUrl(path: string): string {
    const sb = inject(SUPABASE_CLIENT);
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}
