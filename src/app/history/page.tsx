'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayoutController from '@/components/layout/app-layout-controller';
import type { ScanResult } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, Search, AlertTriangle, ShieldCheck, ShieldAlert, CircleAlert, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { buttonVariants } from '@/components/ui/button';


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

function ScanHistoryCard({ scan, onDelete, onView }: { scan: ScanResult, onDelete: (scanId: string) => void, onView: (scan: ScanResult) => void }) {
  const currentVerdict = verdictConfig[scan.verdict] || verdictConfig['Moderate'];
  
  return (
      <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/50">
        <div className="relative p-4">
          <div className="pr-12">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onView(scan)}>
              <currentVerdict.icon className={cn("size-6", currentVerdict.style.split(' ')[1])} />
              <div className='flex flex-col'>
                <h3 className="font-semibold text-lg leading-tight">{scan.productName}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(scan.scanDate).toLocaleDateString()}
                </p>
              </div>
            </div>
             <p className="text-sm text-muted-foreground line-clamp-2 mt-2 pl-9 cursor-pointer" onClick={() => onView(scan)}>
                {scan.analysis.reasoning}
            </p>
          </div>
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge className={cn("text-xs", currentVerdict.style)}>
              {currentVerdict.label}
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the scan for
                    <span className="font-semibold"> {scan.productName}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(scan.id)} className={cn(buttonVariants({variant: 'destructive'}))}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
  );
}

export default function HistoryPage() {
  const { firestore, user } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const scanHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scanHistory');
  }, [firestore, user]);

  const { data: scanHistory, isLoading } = useCollection<ScanResult>(scanHistoryQuery);

  const handleDelete = async (scanId: string) => {
    if (!firestore || !user) return;
    try {
        const docRef = doc(firestore, 'users', user.uid, 'scanHistory', scanId);
        await deleteDoc(docRef);
        toast({
            title: "Deleted",
            description: "The scan has been removed from your history.",
        });
    } catch (error) {
        console.error("Error deleting document: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete scan history. Please try again.",
        });
    }
  };
  
  const handleView = (scan: ScanResult) => {
    sessionStorage.setItem('latestScanResult', JSON.stringify(scan));
    router.push('/result');
  };


  const filteredHistory = useMemo(() => {
    if (!scanHistory) return [];
    return scanHistory.filter(
      scan =>
        scan.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime());
  }, [scanHistory, searchTerm]);
  

  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 animate-in fade-in-0 duration-500 min-h-[calc(100vh-56px)] md:min-h-0">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Scan History</h1>
          <p className="text-muted-foreground mb-8">Track and search all your food safety scans.</p>
        
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
                <ScanHistoryCard key={scan.id} scan={scan} onDelete={handleDelete} onView={handleView} />
              ))}
            </div>
          )}

          {!isLoading && (!filteredHistory || filteredHistory.length === 0) && (
            <div className="text-center py-12 bg-secondary/50 rounded-lg">
               <p className="font-semibold">
                {scanHistory && scanHistory.length > 0 ? 'No matching scans found' : "No Scans Yet"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {scanHistory && scanHistory.length > 0 ? 'Try searching for something else.' : "Your past scans will appear here."}
              </p>
               {(!scanHistory || scanHistory.length === 0) && (
                 <Button asChild className="mt-4">
                    <Link href="/scan">
                        Start scanning
                    </Link>
                 </Button>
               )}
            </div>
          )}
      </div>
    </AppLayoutController>
  );
}
