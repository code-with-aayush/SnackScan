'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleSignIn: () => Promise<{ error: string | null }>;
  emailSignUp: (email: string, pass: string) => Promise<{ error: string | null }>;
  emailSignIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  googleSignIn: async () => ({ error: 'Auth provider not initialized' }),
  emailSignUp: async () => ({ error: 'Auth provider not initialized' }),
  emailSignIn: async () => ({ error: 'Auth provider not initialized' }),
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const googleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }, []);

  const emailSignUp = useCallback(async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }, []);

  const emailSignIn = useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
    }
  }, [router]);

  const value = {
    user,
    loading,
    googleSignIn,
    emailSignUp,
    emailSignIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
