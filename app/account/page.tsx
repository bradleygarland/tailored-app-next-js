'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/stores/auth';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {CreditCard, FileText, AlertTriangle, X, Calendar, Globe, Check, Zap, Crown, Shield, Star} from 'lucide-react';
import { plans, Plan } from '@/lib/subscription'

interface Subscription {
  id: string | null;
  plan: string | 'free';
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string | 'unknown';
  current_period_end: string | 'unknown';
  cancelAtPeriodEnd: boolean | 'unknown';
  next_billing_date: string | 'unknown';
  paymentMethod: {
    type: 'card' | 'unknown';
    last4: string | 'unknown';
    brand: string | 'unknown';
  };
}

// Mock current subscription data
const mockSubscription: Subscription = {
  id: 'sub_123456789',
  plan: 'pro',
  status: 'cancelled',
  current_period_start: '2024-01-15',
  current_period_end: '2025-01-15',
  cancelAtPeriodEnd: false,
  next_billing_date: '2025-01-15',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa'
  }
};

export default function Account() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    location: '',
    timezone: '',
    language: '',
    linkedin: '',
    github: '',
    twitter: ''
  });

  const [autofillData, setAutofillData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    skills: '',
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  const [currentSubscription, setCurrentSubscription] = useState<Subscription>(mockSubscription);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const currentPlan = plans.find(plan => plan.id === currentSubscription.plan);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelSubscription = async () => {
    const res = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id,
      })
    })

    const data = await res.json();
    console.log('CANCEL DATA:', data);

    if (data.success) {
      console.log('Subscription cancelled successfully');
      setRefreshKey(prev => prev + 1);
    }


    setShowCancelConfirmation(false);
  };

  const handleResumeSubscription = async () => {
    const res = await fetch('/api/stripe/resume-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id,
      })
    })

    const data = await res.json();

    if (data.success) {
      console.log('Subscription resumed successfully');
      setRefreshKey(prev => prev + 1);
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap className="w-6 h-6" />;
      case 'pro': return <Crown className="w-6 h-6" />;
      case 'enterprise': return <Shield className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: HeadersInit = {};

      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/profile/get', {
        headers,
      });

      const data = await res.json()

      if (!res.ok) console.log(data.error);

      setProfileData(data.data);

      // END HERE
    };

    const fetchSubscription = async () => {
      if (!user) return;

      setIsLoadingSubscription(true);
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const headers: HeadersInit = {};

        if  (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/subscription', {
          headers,
        })

        if (!res.ok) {
          console.error('Failed to fetch subscription/plan details.');
        } else {

          const subscriptionData = await res.json();
          const rawSubData = subscriptionData.data;
          console.log('Subscription fetch success', subscriptionData);
          setCurrentSubscription({
            ...rawSubData,
            paymentMethod: rawSubData.paymentMethod || {
              type: 'unknown',
              last4: 'unknown',
              brand: 'unknown',
            }
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchUserInfo();
    fetchSubscription();
  }, [user, refreshKey]);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: HeadersInit = {};

      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/autofill/get', {
        headers,
      });

      const data = await res.json()

      if (!res.ok) console.log(data.error);

      setAutofillData(data.data);
    })();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          timezone: profileData.timezone || '',
          language: profileData.language || '',
          bio: profileData.bio || '',
          website: profileData.website || '',
          linkedin: profileData.linkedin || '',
          github: profileData.github || '',
          twitter: profileData.twitter || '',
        })
      })

      const data = await res.json()

      if (!res.ok) console.error('Failed to update profile:', data.error);

    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("autofillData:", autofillData);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/autofill/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: autofillData.full_name || '',
          email: autofillData.email || '',
          phone: autofillData.phone || '',
          address: autofillData.address || '',
          city: autofillData.city || '',
          state: autofillData.state || '',
          zip_code: autofillData.zip_code || '',
          skills: autofillData.skills || '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn("Failed to update autofill data:", data.error);
      }

    } catch (error) {
      console.error('account/page fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 gap-4 bg-muted p-1 w-full max-w-md">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="autofill">Auto-fill</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={profileData.timezone}
                          onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="language">Preferred Language</Label>
                        <Input
                          id="language"
                          value={profileData.language}
                          onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={isLoading}
                        className="h-32"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={profileData.github}
                          onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={profileData.twitter}
                          onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Details Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle className="ml-6">Subscription Details</CardTitle>
                  <CardDescription className="ml-6">Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isLoadingSubscription ? (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      {/* Current Subscription Overview */}
                      <div className="bg-muted backdrop-blur-md rounded-xl border border-gray-300 p-6 mb-8 shadow">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${currentPlan?.id === 'pro' ? 'from-purple-500 to-pink-500' : 'from-cyan-500 to-blue-500'} rounded-lg flex items-center justify-center`}>
                              {getPlanIcon(currentPlan?.id || 'starter')}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold">{currentPlan?.name} Plan</h2>
                              <p className="text-muted-foreground">${currentPlan?.price}/month</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentSubscription.status === 'active'
                              ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                              : 'bg-red-500/20 text-red-500 border border-red-500/30'
                          }`}>
                            {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-gray-200 rounded-lg p-4 border border-white/5">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-5 h-5" />
                              <span className="text-sm text-gray-400">Next Billing</span>
                            </div>
                            <p className="text-lg font-semibold">{formatDate(currentSubscription.next_billing_date)}</p>
                          </div>

                          <div className="bg-gray-200 rounded-lg p-4 border border-white/5">
                            <div className="flex items-center space-x-2 mb-2">
                              <CreditCard className="w-5 h-5" />
                              <span className="text-sm text-gray-400">Payment Method</span>
                            </div>
                            <p className="text-lg font-semibold">
                              {currentSubscription.paymentMethod.brand} •••• {currentSubscription.paymentMethod.last4}
                            </p>
                          </div>

                          <div className="bg-gray-200 rounded-lg p-4 border border-muted/5">
                            <div className="flex items-center space-x-2 mb-2">
                              <Globe className="w-5 h-5" />
                              <span className="text-sm text-gray-400">Current Period</span>
                            </div>
                            <p className="text-lg font-semibold">
                              {formatDate(currentSubscription.current_period_start)} - {formatDate(currentSubscription.current_period_end)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => router.push('/upgrade')}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
                          >
                            Upgrade Plan
                          </button>
                          {currentSubscription.status === 'active' ? (
                          <button
                            onClick={() => setShowCancelConfirmation(true)}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                          >
                            Cancel Subscription
                          </button>
                          ) : (
                            <button
                              onClick={handleResumeSubscription}
                              className="px-6 py-3 bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                            >
                              Resume Subscription
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Current Plan Benefits */}
                      <div className="bg-muted backdrop-blur-md rounded-xl border border-gray-300 p-6 mb-8 shadow">
                        <h3 className="text-xl font-bold mb-4">Your Current Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentPlan?.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    ) : (
                      <h3>Loading subscription...</h3>
                    )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No transactions</p>
                    <p className="text-muted-foreground">
                      Your transaction history will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="autofill">
              <Card>
                <CardHeader>
                  <CardTitle>Autofill Information</CardTitle>
                  <CardDescription>This information will be used to automatically fill in forms when generating cover letters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleAutofillUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={autofillData.full_name}
                        onChange={(e) => setAutofillData({ ...autofillData, full_name: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={autofillData.email}
                        onChange={(e) => setAutofillData({ ...autofillData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={autofillData.phone}
                        onChange={(e) => setAutofillData({ ...autofillData, phone: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={autofillData.address}
                        onChange={(e) => setAutofillData({ ...autofillData, address: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={autofillData.city}
                        onChange={(e) => setAutofillData({ ...autofillData, city: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={autofillData.state}
                        onChange={(e) => setAutofillData({ ...autofillData, state: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="zip_code">Zip Code</Label>
                      <Input
                        id="zip_code"
                        value={autofillData.zip_code}
                        onChange={(e) => setAutofillData({ ...autofillData, zip_code: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="skills">Skills</Label>
                      <Input
                        id="skills"
                        value={autofillData.skills}
                        onChange={(e) => setAutofillData({ ...autofillData, skills: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md rounded-xl border border-red-400/40 p-6 max-w-md w-full animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h4 className="text-lg font-semibold text-red-300">Cancel Subscription</h4>
                </div>
                <button
                  onClick={() => setShowCancelConfirmation(false)}
                  className="text-red-300 hover:text-red-200 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You&#39;ll lose access to all premium features at the end of your current billing period.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}