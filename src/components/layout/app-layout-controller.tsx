'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import MainNav from './main-nav';
import Header from './header';

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        setInitialLoad(false);
      }
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isUserLoading && user && pathname === '/dashboard') {
      router.replace('/');
    }
  }, [user, isUserLoading, router, pathname]);

  if (initialLoad) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full bg-secondary/30">
      <div className="md:pl-16 lg:pl-60">
        <Header />
        <main className="bg-background md:m-4 md:rounded-lg md:border md:shadow-sm">
          {children}
        </main>
      </div>
      <MainNav />
    </div>
  );
}


function AuthLayout({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.replace('/');
        }
    }, [user, isUserLoading, router]);

    if(isUserLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
    }
  
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-secondary p-4">
        {children}
      </div>
    );
  }

export default function AppLayoutController({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <AppShell>{children}</AppShell>;
}
