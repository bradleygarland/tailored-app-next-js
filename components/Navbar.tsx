'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const getLinkClass = (path: string) => {
    return `transition-colors ${isActive(path) ? 'text-primary font-medium' : 'hover:text-primary'}`;
  };

  const getMobileLinkClass = (path: string) => {
    return `w-full p-3 rounded-lg transition-colors ${
      isActive(path) 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'hover:bg-primary/5 text-foreground/80 hover:text-primary'
    }`;
  };

  const handleLogout = async () => {
    await logout();
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
          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={0}>
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history">Cover Letter History</Link>
                  </DropdownMenuItem>
                  {!user?.isPremium && (
                    <DropdownMenuItem asChild>
                      <Link href="/upgrade">Upgrade</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                <div className="flex flex-col gap-2 mt-8">
                  <Link 
                    href="/generator" 
                    className={getMobileLinkClass('/generator')}
                    onClick={() => setIsOpen(false)}
                  >
                    Generator
                  </Link>
                  <Link 
                    href="/editor" 
                    className={getMobileLinkClass('/editor')}
                    onClick={() => setIsOpen(false)}
                  >
                    Editor
                  </Link>
                  {/*<Link
                    href="/history" 
                    className={getMobileLinkClass('/history')}
                    onClick={() => setIsOpen(false)}
                  >
                    History
                  </Link>*/}
                  {!isAuthenticated && (
                    <div className="mt-4">
                      <Link 
                        href="/login"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button className="w-full">Log in</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/generator" className={getLinkClass('/generator')}>
              Generator
            </Link>
            <Link href="/editor" className={getLinkClass('/editor')}>
              Editor
            </Link>
            {/*<Link href="/history" className={getLinkClass('/history')}>
              History
            </Link>*/}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={0}>
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history">Cover Letter History</Link>
                  </DropdownMenuItem>
                  {!user?.isPremium && (
                    <DropdownMenuItem asChild>
                      <Link href="/upgrade">Upgrade</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button>Log in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}