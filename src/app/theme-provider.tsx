'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { user, firestore } = useFirebase();
  const { theme, setTheme } = useTheme();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(profileRef);
  
  // Effect 1: Set theme from user profile on load
  React.useEffect(() => {
    if (userProfile?.theme) {
      setTheme(userProfile.theme);
    }
  }, [userProfile, setTheme]);
  
  // Effect 2: Save theme to Firestore on change
  React.useEffect(() => {
    const saveTheme = async () => {
       if (userProfile && theme && userProfile.theme !== theme) {
         try {
           await setDoc(profileRef, { theme: theme }, { merge: true });
         } catch (error) {
           console.error("Failed to save theme preference:", error);
         }
       }
    };
    
    // Only save if there's a user and the theme is not the initial one from the profile
    if(user && userProfile) {
       saveTheme();
    }

  }, [theme, user, userProfile, profileRef]);

  return <>{children}</>;
}


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}
