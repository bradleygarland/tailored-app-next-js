'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/stores/auth';

interface PlanDetails {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

const plans: Record<string, PlanDetails> = {
  starter: {
    name: 'Starter',
    monthlyPrice: 5,
    yearlyPrice: 48,
    features: [
      '5 cover letters per month',
      'Basic templates',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 15,
    yearlyPrice: 144,
    features: [
      'Unlimited cover letters',
      'Premium templates',
      'AI optimization',
      'Priority support',
      'Custom branding'
    ]
  }
};

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { upgradeAccount } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'starter');
  const [billingCycle, setBillingCycle] = useState(searchParams.get('billing') || 'monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const newUrl = `/checkout?plan=${value}&billing=${billingCycle}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleBillingChange = (value: string) => {
    setBillingCycle(value);
    const newUrl = `/checkout?plan=${selectedPlan}&billing=${value}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await upgradeAccount();
      toast({
        title: "Upgrade successful!",
        description: `You've been upgraded to the ${plans[selectedPlan].name} plan.`
      });
      router.push('/generator');
    } catch (error) {
      toast({
        title: "Error processing payment",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPrice = billingCycle === 'annual' 
    ? plans[selectedPlan].yearlyPrice 
    : plans[selectedPlan].monthlyPrice;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Selection</CardTitle>
                <CardDescription>Choose your plan and billing cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Plan</Label>
                  <Select value={selectedPlan} onValueChange={handlePlanChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Select value={billingCycle} onValueChange={handleBillingChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual (20% off)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">{plans[selectedPlan].name} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">
                      ${currentPrice}
                      <span className="text-sm text-muted-foreground">
                        /{billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {plans[selectedPlan].features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay $${currentPrice}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}