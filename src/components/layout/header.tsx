'use client';

import { usePathname } from 'next/navigation';
import { LogOut, User, ScanLine, History, Menu, LayoutDashboard } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Link from 'next/link';

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/': 'Scan Product',
  '/history': 'Scan History',
  '/scan': 'Scan Product',
  '/profile': 'Profile',
  '/result': 'Scan Result',
};

export default function Header() {
  const pathname = usePathname();
  const { user, isUserLoading, auth } = useFirebase();

  const signOut = () => {
    if (auth) {
      firebaseSignOut(auth);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return names[0].substring(0, 2);
  };

  const findTitle = (path: string) => {
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/scan/')) return "Scan Details";
    return 'SnackScan';
  }

  const title = findTitle(pathname);
  
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/', icon: ScanLine, label: 'Scan' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:hidden">
       <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium mt-8">
              {navItems.map(item => (
                 <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <h1 className="text-xl font-semibold md:text-2xl flex-1">{title}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
              <AvatarFallback>
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild className='cursor-pointer'>
             <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={signOut}
            disabled={isUserLoading}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
