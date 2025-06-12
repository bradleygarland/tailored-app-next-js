'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/stores/auth';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CreditCard, FileText } from 'lucide-react';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
}

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

  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

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
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // No rows returned
            console.error('Error fetching subscription:', error);
          }
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchUserInfo();
    fetchSubscription();
  }, [user]);

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
            <TabsList className="grid grid-cols-4 gap-4 bg-muted p-1 w-full max-w-md">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
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

            <TabsContent value="billing">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No payment methods</p>
                      <p className="text-muted-foreground mb-4">
                        You haven&#39;t added any payment methods yet
                      </p>
                      <Link href="/account/payment-method">
                        <Button>Add Payment Method</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
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
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingSubscription ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Loading subscription details...</p>
                    </div>
                  ) : subscription ? (
                    <>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{subscription.plan}</p>
                            <p className="text-sm text-muted-foreground">
                              Active until {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <Link href="/account/manage-subscription">
                            <Button variant="outline">
                              Manage Subscription
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Next billing date:</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <p className="text-muted-foreground">No active subscription</p>
                      <Link href="/upgrade">
                        <Button>Upgrade Now</Button>
                      </Link>
                    </div>
                  )}
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
      </main>
    </>
  );
}