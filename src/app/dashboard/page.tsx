'use client';
import { useMemo } from 'react';
import AppLayoutController from '@/components/layout/app-layout-controller';
import DietTips from '@/components/home/diet-tips';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ScanResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, CircleAlert, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ label, value, icon: Icon, colorClass, loading }: { label: string; value: number; icon: React.ElementType, colorClass?: string, loading?: boolean }) => (
    <Card className='shadow-sm'>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={cn("size-4 text-muted-foreground", colorClass)} />
        </CardHeader>
        <CardContent>
             {loading ? <Skeleton className="h-7 w-1/2" /> : <div className={cn("text-2xl font-bold", colorClass)}>{value}</div> }
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const { firestore, user } = useFirebase();

  const scanHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scanHistory');
  }, [firestore, user]);

  const { data: scanHistory, isLoading } = useCollection<ScanResult>(scanHistoryQuery);
  
  const stats = useMemo(() => {
    if (!scanHistory) return { total: 0, safe: 0, moderate: 0, notSafe: 0 };
    return {
      total: scanHistory.length,
      safe: scanHistory.filter(s => s.verdict === 'Safe').length,
      moderate: scanHistory.filter(s => s.verdict === 'Moderate').length,
      notSafe: scanHistory.filter(s => s.verdict === 'Not Safe').length,
    };
  }, [scanHistory]);


  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 animate-in fade-in-0 duration-500">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
        <p className="text-muted-foreground mb-8">An overview of your scanning habits and personalized tips.</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard label="Total Scans" value={stats.total} icon={BarChart3} loading={isLoading} />
            <StatCard label="Safe Products" value={stats.safe} icon={ShieldCheck} colorClass="text-primary" loading={isLoading} />
            <StatCard label="Moderate Risk" value={stats.moderate} icon={CircleAlert} colorClass="text-accent" loading={isLoading} />
            <StatCard label="Not Safe" value={stats.notSafe} icon={ShieldAlert} colorClass="text-destructive" loading={isLoading} />
        </div>
        
        <div className="grid gap-8">
            <DietTips />
        </div>
      </div>
    </AppLayoutController>
  );
}
