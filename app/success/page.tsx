'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, ArrowRight, FileText, Sparkles, Download } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Success() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, upgradeAccount } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [planName, setPlanName] = useState('Pro');

  useEffect(() => {
    // Simulate processing the payment and upgrading the account
    const processPayment = async () => {
      try {
        // In a real implementation, you would verify the session with Stripe
        // and then upgrade the user's account
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user?.id)
          .single();

        if (subError) {
          console.error('Error fetching subscription data:', subError);
        }

        console.log(subscription);
        const plan = subscription?.plan;

        if (plan) {
          setPlanName(plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan');
        }

        setIsProcessing(false);

        toast({
          title: "Payment successful!",
          description: `Welcome to ${planName}! Your account has been upgraded.`
        });
      } catch (error) {
        console.error('Error processing payment:', error);
        toast({
          title: "Processing error",
          description: "There was an issue processing your payment. Please contact support.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, user, upgradeAccount, toast, planName]);

  const features = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Unlimited Cover Letters",
      description: "Generate as many cover letters as you need"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI Optimization",
      description: "Advanced AI to perfect your applications"
    },
    {
      icon: <Download className="h-6 w-6 text-primary" />,
      title: "Premium Downloads",
      description: "Export to PDF and DOCX formats"
    }
  ];

  if (isProcessing) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-24 pb-8">
          <div className="max-w-2xl mx-auto px-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <Sparkles className="h-12 w-12 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-4">Processing your payment...</h1>
                <p className="text-muted-foreground text-center">
                  Please wait while we confirm your subscription and upgrade your account.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="mb-8">
              <CardContent className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    Welcome to CoverAI {planName}! Your account has been upgraded.
                  </p>
                  <p className="text-muted-foreground">
                    You now have access to all premium features and can start creating unlimited cover letters.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">What&#39;s Next?</CardTitle>
                <CardDescription>
                  Here are some things you can do now with your {planName} subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Link href="/generator" className="group">
                    <Card className="h-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg border-2 border-transparent group-hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Start Creating</h3>
                            <p className="text-sm text-muted-foreground">Generate your first cover letter</p>
                          </div>
                        </div>
                        <div className="flex items-center text-primary font-medium">
                          <span>Get Started</span>
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/account" className="group">
                    <Card className="h-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg border-2 border-transparent group-hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Setup Profile</h3>
                            <p className="text-sm text-muted-foreground">Complete your profile for better results</p>
                          </div>
                        </div>
                        <div className="flex items-center text-primary font-medium">
                          <span>Setup Now</span>
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Your {planName} Features</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        {feature.icon}
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center"
          >
            <Card>
              <CardContent className="py-8">
                <h3 className="text-lg font-semibold mb-4">Need Help Getting Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Our support team is here to help you make the most of your subscription.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/help">
                      View Help Center
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/generator">
                      Create Your First Cover Letter
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}