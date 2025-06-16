import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: string;
  customerId: string;
}

interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<User>;
  upgradeAccount: () => Promise<User>;
  cancelSubscription: () => Promise<User>;
}

export const useAuth = create<AuthState>((set, get) => ({
  initialized: false,
  isAuthenticated: false,
  user: null,
  
  login: async (email: string, password: string) => {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!user) throw new Error('No user returned from login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('No profile found');

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) throw new Error('No subscription found');

    const userData: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name || undefined,
      plan: subscription.plan || 'free',
      customerId: profile.stripe_customer_id,
    };

    set({ user: userData, isAuthenticated: true });
    return userData;
  },
  
  register: async (email: string, password: string, name: string) => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!user) throw new Error('No user returned from registration');

    // Profile is created automatically via database trigger
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('No profile found');

    // Create new stripe user
    const res = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.error);
    }

    const customerId = data?.stripe_customer_id;

    // Update the profile with the name and customer id
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ name: name, stripe_customer_id: customerId })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedProfile) throw new Error('Failed to update profile');

    // Base subscription row created automatically via database trigger
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) throw new Error('register: No user subscription found');

    const userData: User = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name || undefined,
      plan: subscription.plan || 'free',
      customerId: updatedProfile.stripe_customer_id,
    };

    set({ user: userData, isAuthenticated: true });
    return userData;
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        email: updates.email,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedProfile) throw new Error('Failed to update profile');

    const userData: User = {
      ...user,
      ...updates,
    };

    set({ user: userData });
    return userData;
  },
  
  upgradeAccount: async () => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedProfile) throw new Error('Failed to upgrade account');

    /*
    * Upgrade subscription:
    *   Must remove old subscription
    *   Add new subscription
    *   Add check for single subscription
    *   Add check for valid subscription
    */

    const userData: User = {
      ...user,
      plan: 'free',
    };

    set({ user: userData });
    return userData;
  },

  cancelSubscription: async () => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedProfile) throw new Error('Failed to cancel subscription');

    const userData: User = {
      ...user,
      plan: 'free',
    };

    set({ user: userData });
    return userData;
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Fetch user profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data: profile }) => {
        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name || undefined,
            plan: 'free', // DEV const given to plan (change later)
            customerId: profile.stripe_customer_id,
          };
          useAuth.setState({ user: userData, isAuthenticated: true, initialized: true });
        } else {
          console.warn('No profile found');
        }
      });
  } else if (event === 'SIGNED_OUT') {
    useAuth.setState({ user: null, isAuthenticated: false, initialized: true });
  } else {
    useAuth.setState({ initialized: true });
  }
});