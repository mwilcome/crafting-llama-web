import { inject } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import {SupabaseClient} from "@supabase/supabase-js";


/**
 * Returns a fully qualified URL for a Supabase-stored asset.
 * – If `path` is already an absolute http(s) URL (or data URI), return it unchanged.
 * – Otherwise treat it as a Storage path inside the “media” bucket.
 */
export function storageUrl(path: string): string {
    if (!path) return '';
    if (/^(https?:\/\/|data:)/i.test(path)) return path;

    const sb = inject(SUPABASE_CLIENT);
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

export function storageUrlInjected(client: SupabaseClient, path: string): string {
    if (!path) return '';
    if (/^(https?:\/\/|data:)/i.test(path)) return path;

    return client.storage.from('media').getPublicUrl(path).data.publicUrl;
}
