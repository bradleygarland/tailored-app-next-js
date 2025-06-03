'use client';

import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using CoverAI's services, you agree to be bound by these Terms of Service
                and all applicable laws and regulations. If you do not agree with any of these terms, you
                are prohibited from using or accessing this site.
              </p>

              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials (information or software) on
                CoverAI's website for personal, non-commercial transitory viewing only.
              </p>

              <h2>3. User Accounts</h2>
              <p>
                To access certain features of the Service, you must register for an account. You agree
                to provide accurate, current, and complete information during the registration process
                and to update such information to keep it accurate, current, and complete.
              </p>

              <h2>4. Content Generation</h2>
              <p>
                While we strive to provide accurate and high-quality content through our AI-powered
                services, you acknowledge that the generated content may require review and modification.
                You are solely responsible for ensuring the accuracy and appropriateness of the final content.
              </p>

              <h2>5. Subscription and Payments</h2>
              <p>
                Some features of the Service require a paid subscription. You agree to pay all fees
                charged to your account based on our fees, charges, and billing terms in effect at
                the time a fee or charge is due and payable.
              </p>

              <h2>6. Limitations</h2>
              <p>
                CoverAI reserves the right to modify, suspend, or discontinue the service at any time
                without notice. We shall not be liable for any modification, suspension, or
                discontinuation of the service.
              </p>

              <h2>7. Disclaimer</h2>
              <p>
                The materials on CoverAI's website are provided on an 'as is' basis. CoverAI makes no
                warranties, expressed or implied, and hereby disclaims and negates all other warranties
                including, without limitation, implied warranties or conditions of merchantability,
                fitness for a particular purpose, or non-infringement of intellectual property or
                other violation of rights.
              </p>

              <h2>8. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws
                and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}