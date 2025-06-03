'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@/stores/auth'

export default function History() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Generated Cover Letters</h1>
          <Card>
            { isAuthenticated ? (
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-center">No cover letters yet</p>
                <p className="text-muted-foreground text-center mb-6">
                  Your generated cover letters will appear here
                </p>
                <Link href="/generator">
                  <Button>Generate a Cover Letter</Button>
                </Link>
              </CardContent>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-center">You are not logged in</p>
              <p className="text-muted-foreground text-center mb-6">
                Log in or sign up to be able to access previous generations
              </p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </CardContent>
            )};
          </Card>
        </div>
      </main>
    </>
  );
}