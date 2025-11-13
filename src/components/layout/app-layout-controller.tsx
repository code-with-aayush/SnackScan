'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import MainNav from './main-nav';
import Header from './header';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import ProfileSetupPage from '@/app/profile/setup/page';


function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'profile');
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    } else if (!isUserLoading && user && !isProfileLoading) {
       setInitialLoad(false);
    }
  }, [user, isUserLoading, router, isProfileLoading, userProfile]);

  if (initialLoad || isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userProfile?.name) {
    return <ProfileSetupPage />;
  }


  return (
    <div className="min-h-screen w-full">
      <div className="md:pl-16 lg:pl-60">
        <Header />
        <main className="bg-background">
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
  const isSetupPage = pathname === '/profile/setup';

  if (isAuthPage) {
    return <AuthLayout>{children}</AuthLayout>;
  }
  
  if (isSetupPage) {
     return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
