import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qddjuqcsatijwensgyjm.supabase.co';
const supabaseAnonKey = 'sb_publishable_C69w2i7gvJ5JJXy9UfbCUQ_FAqQydlO';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram configuradas no arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);