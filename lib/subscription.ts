import { SupabaseClient } from '@supabase/supabase-js';

// usage limit mapping table
export const PLAN_USAGE_LIMITS: Record<string, number> = {
  free: 3,
  starter: 15,
  pro: Number.MAX_SAFE_INTEGER,
};

export async function getUserSubscription(
  supabase: SupabaseClient,
  token: string | null
): Promise<string> {
  let userId: string | null = null;

  if (token) {
    const {data: {user}, error: authError} = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.warn("getUserSubscription: Auth token provided but invalid:", authError.message);
    } else {
      userId = user?.id || null;
    }
  }

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (subError || !subscription) throw new Error(`Failed to fetch subscription: ${subError.message}`);

  return subscription.plan || 'free'; // array of subscriptions
}