'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayoutController from '@/components/layout/app-layout-controller';
import type { ScanResult } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, Search, AlertTriangle, ShieldCheck, ShieldAlert, CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const verdictConfig = {
  Safe: {
    style: 'bg-primary/10 text-primary border-primary/20',
    icon: ShieldCheck,
    label: 'Safe',
  },
  'Not Safe': {
    style: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: ShieldAlert,
    label: 'Not Safe',
  },
  Moderate: {
    style: 'bg-accent/10 text-accent border-accent/20',
    icon: CircleAlert,
    label: 'Moderate',
  },
};

function ScanHistoryCard({ scan }: { scan: ScanResult }) {
  const currentVerdict = verdictConfig[scan.verdict] || verdictConfig['Moderate'];
  
  return (
    <Link href={`/scan/${scan.id}`} className="block">
      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <currentVerdict.icon className={cn("size-5", currentVerdict.style.split(' ')[1])} />
              <h3 className="font-semibold text-lg">{scan.productName}</h3>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
               <Badge className={cn("text-xs", currentVerdict.style)}>
                  {currentVerdict.label}
                </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(scan.scanDate).toLocaleDateString()} {new Date(scan.scanDate).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className='pl-7'>
             <p className="text-sm font-medium">Safety Analysis:</p>
              <p className="text-sm text-muted-foreground mb-2">
                {scan.analysis.reasoning}
              </p>

              {scan.analysis.warnings && scan.analysis.warnings.length > 0 && (
                 <div>
                    <p className="text-sm font-medium">Recommendations:</p>
                    <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-500">
                        <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                        <p>
                        DO NOT CONSUME - This product contains allergens that could cause a serious allergic reaction. Look for alternatives without these allergens.
                        </p>
                    </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const StatCard = ({ label, value, colorClass }: { label: string; value: number; colorClass?: string }) => (
    <div className="text-center">
      <p className={cn("text-3xl font-bold", colorClass)}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);

export default function HistoryPage() {
  const { firestore, user } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  const scanHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scanHistory');
  }, [firestore, user]);

  const { data: scanHistory, isLoading } = useCollection<ScanResult>(scanHistoryQuery);

  const filteredHistory = useMemo(() => {
    if (!scanHistory) return [];
    return scanHistory.filter(
      scan =>
        scan.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scanHistory, searchTerm]);
  
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
      <div className="animate-in fade-in-0 duration-500 bg-secondary/20 min-h-[calc(100vh-56px)]">
         <div className="bg-primary text-primary-foreground p-8">
            <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
            <p className="text-primary-foreground/80 mt-1">Track all your food safety scans</p>
        </div>

        <div className="bg-background p-6 shadow-md">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Scans" value={stats.total} />
                <StatCard label="Safe Products" value={stats.safe} colorClass="text-primary" />
                <StatCard label="Moderate Risk" value={stats.moderate} colorClass="text-accent" />
                <StatCard label="Not Safe" value={stats.notSafe} colorClass="text-destructive" />
            </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products or ingredients..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && filteredHistory && filteredHistory.length > 0 && (
            <div className="space-y-4">
              {filteredHistory.map(scan => (
                <ScanHistoryCard key={scan.id} scan={scan} />
              ))}
            </div>
          )}

          {!isLoading && (!filteredHistory || filteredHistory.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {scanHistory && scanHistory.length > 0 ? 'No results found for your search.' : "You haven't scanned any products yet."}
              </p>
               {(!scanHistory || scanHistory.length === 0) && (
                 <Link href="/" className="text-primary hover:underline mt-2 inline-block">
                    Start scanning
                  </Link>
               )}
            </div>
          )}
        </div>
      </div>
    </AppLayoutController>
  );
}
