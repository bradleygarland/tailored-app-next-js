import { SupabaseClient } from '@supabase/supabase-js';

// usage limit mapping table
export const PLAN_USAGE_LIMITS: Record<string, number> = {
  free: 3,
  starter: 15,
  pro: Number.MAX_SAFE_INTEGER,
};

export async function getUserSubscriptions(
  supabase: SupabaseClient,
): Promise<any[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Authentication failed');

  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id);

  if (subError) throw new Error(`Failed to fetch subscriptions: ${subError.message}`);

  return subscriptions; // array of subscriptions
}