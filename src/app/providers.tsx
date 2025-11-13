'use client';

import { AuthProvider } from '@/hooks/use-auth';
import AppLayoutController from '@/components/layout/app-layout-controller';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        {children}
    </AuthProvider>
  );
}
