import { SupabaseClient } from '@supabase/supabase-js';

// usage limit mapping table
export const PLAN_USAGE_LIMITS: Record<string, number> = {
  free: 3,
  starter: 15,
  pro: Number.MAX_SAFE_INTEGER,
};

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  popular?: boolean;
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'lifetime',
    features: [
      '3 free monthly generations',
      'Basic Editing Capabilities',
      'Email support',
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 5,
    interval: 'monthly',
    features: [
      'Up to 5 projects',
      'Basic analytics',
      'Email support',
      '10GB storage',
      'Standard security'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 15,
    interval: 'monthly',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '100GB storage',
      'Enhanced security',
      'Team collaboration',
      'API access'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'monthly',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'Enterprise security',
      'Advanced team management',
      'SLA guarantee',
      'Custom branding'
    ]
  }
];

export async function getUserSubscription(
  supabase: SupabaseClient,
  token: string | null
) {
  let userId: string | null = null;

  if (token) {
    const {data: {user}, error: authError} = await supabase.auth.getUser(token);
    if (authError) {
      console.warn("getUserSubscription: Auth token provided but invalid:", authError.message);
    } else {
      userId = user?.id || null;
    }
  }

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subError || !subscription) throw new Error(`Failed to fetch subscription: ${subError?.message}`);

  return subscription; // array of subscriptions
}