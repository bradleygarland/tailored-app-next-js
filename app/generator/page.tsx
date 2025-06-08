'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Navbar from '@/components/Navbar';
import Editor from '@/components/Editor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'

const PLACEHOLDER_TEXT = "Your generated cover letter will appear here. Once generated, you can edit it directly in this editor.";

export default function Generator() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    jobDescription: ''
  });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [generationCount, setGenerationCount] = useState(0);
  const [maxUsage, setMaxUsage] = useState(3);

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasAcceptedTerms') === 'true';
    }
    return false;
  });

  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingGenerations = maxUsage - generationCount;
  const progressPercentage = (generationCount / maxUsage) * 100;

  useEffect(() => {
    if (!hasAcceptedTerms) {
      setShowTermsDialog(true);
    }
  }, [hasAcceptedTerms]);

  useEffect (() => {
    (async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const res = await fetch('/api/usage', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-forwarded-for': '123.456.789.0', // dev testing on localhost
          }
        });

        if (!res.ok) console.error('Failed to fetch usage.');
        const data = await res.json();
        setGenerationCount(data.usageCount);
        console.log(data.usageCount)

        if (isAuthenticated) {
          const res = await fetch('/api/subscription', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!res.ok) console.error('Failed to fetch subscription/plan details.');
          const subscriptionData = await res.json();
          setMaxUsage(subscriptionData.maxUsage);
        }
      } catch (err) {
        console.error('Failed to fetch generation usage.', err);
      }
    })();
  }, [isAuthenticated]);

  const handleAcceptTerms = () => {
    if (acceptTerms) {
      localStorage.setItem('hasAcceptedTerms', 'true');
      setHasAcceptedTerms(true);
      setShowTermsDialog(false);
    } else {
      toast({
        title: "Terms acceptance required",
        description: "Please accept the terms of service to continue.",
        variant: "destructive"
      });
    }
  };


  // Submit Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    if (!hasAcceptedTerms) {
      setShowTermsDialog(true);
      setLoading(false);
      return;
    }

    if (!isAuthenticated && generationCount >= maxUsage) {
      setShowAuthPrompt(true);
      setLoading(false);
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-forwarded-for': '123.456.789.0',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        toast({
          title: "Error generating cover letter",
          description: data.error || 'Please try again.',
          variant: "destructive"
        });
      } else {
        setGeneratedLetter(data.generatedLetter);
        setGenerationCount(data.newCount);
        toast({
          title: "Cover letter generated",
          description: "Your cover letter has been generated successfully.",
        });
      }
    } catch (error) {
      setError('An unexpected error occured.');
      toast({
        title: "Unexpected error",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleTransferToEditor = () => {
    if (!hasAcceptedTerms) {
      setShowTermsDialog(true);
      return;
    }

    if (generatedLetter.trim() === '') {
      toast({
        title: "No content to transfer",
        description: "Please generate a cover letter first.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('transferredLetter', generatedLetter);
    toast({
      title: "Transferring to editor",
      description: "Your cover letter has been transferred to the editor."
    });
    router.push('/editor');
  };



  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <h3 className="font-semibold mb-2">
                    {remainingGenerations > 0
                      ? `${remainingGenerations} free generations remaining`
                      : "Free generations limit reached"}
                  </h3>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign up for unlimited access</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Cover Letter Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                      className="h-32"
                      placeholder="Paste the job description here..."
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!isAuthenticated && generationCount >= maxUsage}
                  >
                    Generate Cover Letter
                  </Button>

                  {!isAuthenticated && generationCount >= maxUsage && (
                    <p className="text-sm text-muted-foreground text-center">
                      You&#39;ve reached the limit for free generations.{' '}
                      <Link href="/signup" className="text-primary hover:underline">
                        Sign up
                      </Link>
                      {' '}to continue.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Right side - Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Generated Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <Editor
                  content={generatedLetter}
                  onChange={setGeneratedLetter}
                  placeholder={PLACEHOLDER_TEXT}
                />
                <div className="mt-4">
                  <Button 
                    onClick={handleTransferToEditor}
                    disabled={!generatedLetter.trim()}
                    className="w-full"
                  >
                    Continue Editing in Full Editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free Generation Limit Reached</DialogTitle>
            <DialogDescription>
              You&#39;ve used all your free generations. Sign up for unlimited access to our AI-powered cover letter generator.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">Log in</Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="w-full">Sign up now</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              Please read and accept our terms of service to continue using the cover letter generator.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto my-4">
            <div className="prose prose-sm">
              <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing and using CoverAI&#39;s services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>

              <h3 className="text-lg font-semibold mb-2">2. Use of Service</h3>
              <p className="mb-4">
                You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account information.
              </p>

              <h3 className="text-lg font-semibold mb-2">3. Content Generation</h3>
              <p className="mb-4">
                While we strive to provide accurate and high-quality content, you acknowledge that the AI-generated content may require review and modification. You are responsible for ensuring the accuracy and appropriateness of the final content.
              </p>

              <h3 className="text-lg font-semibold mb-2">4. Privacy</h3>
              <p className="mb-4">
                Your use of the service is also governed by our Privacy Policy. By using CoverAI, you consent to the collection and use of information as detailed in our Privacy Policy.
              </p>

              <h3 className="text-lg font-semibold mb-2">5. Limitations</h3>
              <p className="mb-4">
                CoverAI reserves the right to modify, suspend, or discontinue the service at any time without notice. We shall not be liable for any modification, suspension, or discontinuation of the service.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the terms of service
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <Button onClick={handleAcceptTerms} disabled={!acceptTerms}>
              Accept & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}