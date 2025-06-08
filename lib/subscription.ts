import { SupabaseClient } from '@supabase/supabase-js';

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