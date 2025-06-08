import { SupabaseClient } from '@supabase/supabase-js';

interface UsageResponse {
  usageCount: number;
}

export async function getUserOrAnonUsage(
  supabase: SupabaseClient,
  token: string | null,
  ip: string | null
): Promise<UsageResponse> {
  // Get the user from the token (client should be initialized with token)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const userId = user?.id || null;
  const identifier = userId || ip;

  if (!identifier) {
    throw new Error('Missing user ID and IP address');
  }

  // Try to find existing usage record
  const {data: existingRow, error: fetchError} = await supabase
    .from('generation_usage')
    .select('count')
    .eq(userId ? 'user_id' : 'ip_address', identifier)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Error fetching generation usage: ${fetchError.message}`);
  }

  // If no record, create a new one with count = 0
  if (!existingRow) {
    const { error: insertError } = await supabase
      .from('generation_usage')
      .insert([
        {
          user_id: userId,
          ip_address: userId ? null : ip,
          count: 0,
          last_generated_at: null
        },
      ]).single();

    if (insertError) {
      throw new Error(`Error inserting generation usage: ${insertError.message}`);
    }

    return { usageCount: 0 };
  }

  return { usageCount: existingRow.count || 0 };
}

export async function updateUserOrAnonUsage(
  supabase: SupabaseClient,
  token: string | null,
  ip: string | null,
  newCount: number
): Promise<void> {
  console.log(`Updating user or anon usage to ${newCount}`);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const userId = user?.id || null;
  const identifier = userId || ip;

  if (!identifier) {
    throw new Error('Missing user ID and IP address');
  }

  const matchField = userId ? 'user_id' : 'ip_address';

  const { error: updateError } = await supabase
    .from('generation_usage')
    .update({
      count: newCount,
      last_generated_at: new Date()
    })
    .eq(matchField, identifier);

  if (updateError) {
    throw new Error(`Error updating usage count: ${updateError.message}`);
  }
}