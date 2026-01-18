import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@taleify/supabase';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

export async function isAdmin(): Promise<boolean> {
  // Bypass admin check in development if ADMIN_BYPASS is set
  if (process.env.NODE_ENV === 'development' && process.env.ADMIN_BYPASS === 'true') {
    console.log('[Admin] Bypassing admin check in development mode');
    return true;
  }

  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.log('[Admin] Auth error:', authError.message);
    return false;
  }
  
  if (!user) {
    console.log('[Admin] No user logged in');
    return false;
  }

  console.log('[Admin] Checking admin role for user:', user.id);

  const { data: profile, error: profileError } = await (supabase
    .from('user_profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.log('[Admin] Profile error:', profileError.message);
    return false;
  }

  console.log('[Admin] User role:', profile?.role);
  return profile?.role === 'admin';
}
