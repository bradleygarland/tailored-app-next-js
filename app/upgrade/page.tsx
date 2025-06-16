'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

export default function Upgrade() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const { toast } = useToast();
  const { user } = useAuth();

  const calculatePrice = (basePrice: number) => {
    return isAnnual ? (basePrice * 12 * 0.8).toFixed(0) : basePrice;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Invalid promo code",
        description: "Please enter a valid promo code.",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingPromo(true);
    try {
      // Here you would validate the promo code with your backend
      toast({
        title: "Invalid promo code",
        description: "The entered promo code is invalid or has expired.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCheckout = async (plan: 'starter' | 'pro', interval: 'monthly' | 'yearly') => {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user?.email,
        plan: plan,
        interval: interval,
        userId: user?.id,
        customerId: user?.customerId,
      }),
    });

    const data: { url?: string; error?: string } = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error('Checkout failed: ' + (data.error ?? 'Unknown error'));
    }
  };

  useEffect(() => {
    (async () => {
      if (!user) return;

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('plan, interval')
        .eq('user_id', user?.id)
        .single();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        setCurrentPlan('free');
        return;
      }

      setCurrentPlan(`${subscription?.plan}_${subscription?.interval}`);
    })();
  }, [user])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h1>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <Label htmlFor="billing-toggle">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle">Annual (20% off)</Label>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect for job seekers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${calculatePrice(5)}{isAnnual ? '/year' : '/month'}
                </div>
                <ul className="space-y-2 mb-14">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    15 cover letters per month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Basic templates
                  </li>
                </ul>
                {isAnnual ? (
                  currentPlan === 'starter_yearly' ? (
                    <Button className="w-full bg-muted text-muted-foreground" disabled>
                      Current
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout('starter', 'yearly')}
                    >
                      Select Starter
                    </Button>
                )) : (
                  currentPlan === 'starter_monthly' ? (
                    <Button className="w-full bg-muted text-muted-foreground" disabled>
                      Current
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout('starter', 'monthly')}
                    >
                      Select Starter
                    </Button>
                ))}
                </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For active job hunters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${calculatePrice(15)}{isAnnual ? '/year' : '/month'}
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Unlimited cover letters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Premium templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    AI optimization
                  </li>
                </ul>
                {isAnnual ? (
                  currentPlan === 'pro_yearly' ? (
                    <Button className="w-full bg-muted text-muted-foreground" disabled>
                      Current
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout('pro', 'yearly')}
                    >
                      Select Pro
                    </Button>
                  )) : (
                  currentPlan === 'pro_yearly' ? (
                    <Button className="w-full bg-muted text-muted-foreground" disabled>
                      Current
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout('pro', 'monthly')}
                    >
                      Select Pro
                    </Button>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">Contact Sales</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Custom solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Dedicated support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    API access
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Have a Promo Code?</CardTitle>
                <CardDescription>Enter your promo code to get a discount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button 
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode.trim()}
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}