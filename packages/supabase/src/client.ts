import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

export type TypedSupabaseClient = SupabaseClient<Database>;

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: Parameters<typeof createClient>[2]
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
}
