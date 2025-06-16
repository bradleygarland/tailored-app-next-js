'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, Sparkles, Brain, Clock } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FadeInSection from '@/components/FadeInSection';
import { useAuth } from '@/stores/auth';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Tech Solutions Inc.",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    content: "CoverAI helped me land my dream job! The AI-generated cover letters were perfectly tailored to each position I applied for. Highly recommended!"
  },
  {
    name: "Michael Chen",
    role: "Marketing Manager",
    company: "Digital Trends",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    content: "As someone who dreaded writing cover letters, this tool has been a game-changer. It saves me hours of time while producing better results than I could write myself."
  },
  {
    name: "Emily Rodriguez",
    role: "Product Designer",
    company: "Creative Studios",
    image: "https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg",
    content: "The customization options are fantastic. I can generate a base letter and then easily tweak it to match my voice. This tool has streamlined my job application process significantly."
  },
  {
    name: "David Thompson",
    role: "Business Analyst",
    company: "Finance Corp",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    content: "I was skeptical about AI-written cover letters, but the quality is impressive. Each letter feels personal and professional. Worth every penny!"
  }
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />,
      title: "AI-Powered Intelligence",
      description: "Our advanced AI doesn't just fill in templates – it understands your experience and the job requirements, crafting truly personalized cover letters that speak to your unique qualifications."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />,
      title: "Perfect Customization",
      description: "Every cover letter is uniquely tailored to match both your professional background and the specific role you're targeting, ensuring your application stands out from the crowd."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />,
      title: "Lightning-Fast Results",
      description: "What used to take hours now takes seconds. Get a professionally crafted cover letter in moments, giving you more time to focus on other aspects of your job search."
    }
  ];

  const faqs = [
    {
      question: 'How does the AI cover letter generator work?',
      answer: 'Our AI analyzes your input information and the job description to create a personalized cover letter that highlights your relevant skills and experience.'
    },
    {
      question: 'Can I edit the generated cover letter?',
      answer: 'Yes, you have full control to edit and customize the generated cover letter to match your preferences.'
    },
    {
      question: 'How many cover letters can I generate?',
      answer: 'The number of cover letters depends on your subscription plan. Starter allows 5 per month, Pro offers unlimited generation.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes, we use industry-standard encryption to protect your personal information and never share it with third parties.'
    },
    {
      question: 'What is the difference between free and paid plans?',
      answer: 'The difference is the access to better tools for generation and editing. Also, paid plans offer AI models with higher reasoning skills that can tailor your cover letter to a higher degree.'
    }
  ];

  const calculatePrice = (basePrice: number) => {
    return isAnnual ? (basePrice * 12 * 0.8).toFixed(0) : basePrice;
  };

  const getPricingLink = (plan: string) => {
    if (!isAuthenticated) {
      return '/signup';
    }
    return `/upgrade?plan=${plan.toLowerCase()}`;
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <FadeInSection className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Create Perfect Cover Letters with AI</h1>
          <p className="text-xl text-muted-foreground mb-8">Land your dream job with professionally crafted cover letters in seconds</p>
          <Link href="/generator">
            <Button size="lg" className="text-lg px-8">Get Started</Button>
          </Link>
        </div>
      </FadeInSection>

      <FadeInSection>
        <section id="features" className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Why Choose CoverAI?</h2>
            <div className="grid md:grid-cols-[300px,1fr] gap-12">
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`group flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                      activeFeature === index ? 'bg-white shadow-md' : 'hover:bg-white/50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                ))}
              </div>
              <div className="relative h-[200px]">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 left-0 w-full transition-opacity duration-300 ${
                      activeFeature === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="pricing" className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
            <div className="flex justify-center items-center gap-4 mb-8">
              <Label htmlFor="billing-toggle">Monthly</Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label htmlFor="billing-toggle">Annual (20% off)</Label>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>Perfect for job seekers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    ${calculatePrice(5)}{isAnnual ? '/year' : '/month'}
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      5 cover letters per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Basic templates
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={getPricingLink('starter')} className="w-full">
                    <Button className="w-full">
                      {isAuthenticated ? 'Upgrade to Starter' : 'Get Started'}
                    </Button>
                  </Link>
                </CardFooter>
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
                  <ul className="space-y-2">
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
                </CardContent>
                <CardFooter>
                  <Link href={getPricingLink('pro')} className="w-full">
                    <Button className="w-full" variant="default">
                      {isAuthenticated ? 'Upgrade to Pro' : 'Get Started'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">Contact Sales</div>
                  <ul className="space-y-2">
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
                </CardContent>
                <CardFooter>
                  <Link href={getPricingLink('enterprise')} className="w-full">
                    <Button className="w-full" variant="outline">Contact Sales</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="testimonials" className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="group">
                      <Card className="h-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:z-10 group-hover:bg-white/80">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-lg font-semibold">{testimonial.name}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                            </div>
                            <p className="text-muted-foreground">{testimonial.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="faq" className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </FadeInSection>
    </main>
  );
}