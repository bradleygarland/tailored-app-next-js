'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/stores/auth';

export default function HomeNavbar() {
  const { isLoggedIn } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);

      const sections = ['features', 'pricing', 'faq'];
      let currentSection = '';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.getBoundingClientRect().top <= window.innerHeight / 2) {
          currentSection = section;
        }
      }
      
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const getLinkClass = (section: string) => {
    return `transition-colors ${activeSection === section ? 'text-primary font-medium' : 'hover:text-primary'}`;
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-md mx-4 mt-4 rounded-full max-w-[calc(100%-2rem)]'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            CoverAI
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <button
                    className={`text-lg ${getLinkClass('features')}`}
                    onClick={() => {
                      scrollToSection('features');
                      setIsOpen(false);
                    }}
                  >
                    Features
                  </button>
                  <button
                    className={`text-lg ${getLinkClass('pricing')}`}
                    onClick={() => {
                      scrollToSection('pricing');
                      setIsOpen(false);
                    }}
                  >
                    Pricing
                  </button>
                  <button
                    className={`text-lg ${getLinkClass('faq')}`}
                    onClick={() => {
                      scrollToSection('faq');
                      setIsOpen(false);
                    }}
                  >
                    FAQ
                  </button>
                  <Link href="/generator" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              className={getLinkClass('features')}
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button
              className={getLinkClass('pricing')}
              onClick={() => scrollToSection('pricing')}
            >
              Pricing
            </button>
            <button
              className={getLinkClass('faq')}
              onClick={() => scrollToSection('faq')}
            >
              FAQ
            </button>
            <Link href="/generator">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}