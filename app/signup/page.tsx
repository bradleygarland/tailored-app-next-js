'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Linkedin } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();
  const register = useAuth((state) => state.register);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast({
        title: "Terms acceptance required",
        description: "Please accept the terms of service to continue.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (formData.fullName && formData.email && formData.password) {
        await register(formData.email, formData.password, formData.fullName);
        toast({
          title: "Account created",
          description: "Welcome to CoverAI!"
        });
        router.push('/generator');
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      console.log("Signup failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Terms acceptance required",
        description: "Please accept the terms of service to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingGoogle(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/generator`
        }
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setIsLoadingGoogle(false);
    }
  };

  const handleLinkedInSignUp = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Terms acceptance required",
        description: "Please accept the terms of service to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingLinkedIn(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/generator`
        }
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setIsLoadingLinkedIn(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-md mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground"
                  >
                    I accept the{' '}
                    <Link href="/terms" className="text-primary hover:underline" target="_blank">
                      terms of service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                      privacy policy
                    </Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignUp}
                    disabled={isLoadingGoogle}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    {isLoadingGoogle ? 'Connecting...' : 'Continue with Google'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleLinkedInSignUp}
                    disabled={isLoadingLinkedIn}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    {isLoadingLinkedIn ? 'Connecting...' : 'Continue with LinkedIn'}
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:text-primary/80">
                    Log in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}