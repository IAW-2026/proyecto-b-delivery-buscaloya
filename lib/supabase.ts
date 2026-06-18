import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isMissingConfig = !supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'VALOR_ANON_KEY_DE_SUPABASE';

if (isMissingConfig && typeof window !== 'undefined') {
  console.warn(
    '⚠️ Supabase URL or Anon Key is missing or using placeholder in environment variables. Realtime features will not work.'
  );
}

// Fallback to placeholder if missing so it does not throw during import
export const supabase = createClient(
  supabaseUrl || 'https://hfpxvhydyjaqchwybese.supabase.co',
  supabaseAnonKey && supabaseAnonKey !== 'VALOR_ANON_KEY_DE_SUPABASE' ? supabaseAnonKey : 'placeholder'
);
