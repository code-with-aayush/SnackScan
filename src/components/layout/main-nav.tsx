
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScanLine, UserCircle, History, Salad, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/scan', icon: ScanLine, label: 'Scan' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function MainNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      // Show navbar if scrolling up or at the top
      if (window.scrollY < lastScrollY || window.scrollY <= 10) {
        setIsVisible(true);
      } else { // Hide navbar if scrolling down
        setIsVisible(false);
      }
      // remember current scroll position
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);


  const isRouteActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav 
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-40 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out",
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex justify-around items-center h-full pb-safe">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full transition-colors rounded-lg',
                isRouteActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
       <aside className="hidden md:flex fixed top-0 left-0 h-full z-40">
        <div className="flex flex-col items-center lg:items-start w-16 lg:w-60 border-r bg-card transition-all duration-300">
           <Link
            href="/"
            className="flex items-center justify-center lg:justify-start lg:pl-5 gap-2 h-14"
          >
            <Salad className="h-8 w-8 text-primary" />
            <span className="hidden lg:inline text-xl font-bold tracking-tight">SnackScan</span>
          </Link>
          <TooltipProvider>
            <nav className="flex-1 mt-4 flex flex-col items-center lg:items-stretch gap-2 w-full px-2 lg:px-4">
              {navItems.map(item => (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center lg:justify-start gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                         isRouteActive(item.href) &&
                          'text-primary bg-primary/10 font-semibold'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="lg:hidden"
                    sideOffset={5}
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </TooltipProvider>
        </div>
      </aside>
    </>
  );
}
