'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertTriangle, ShieldCheck, ShieldAlert, CircleAlert } from 'lucide-react';
import AppLayoutController from '@/components/layout/app-layout-controller';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ScanResult } from '@/lib/types';
import React from 'react';
import { cn } from '@/lib/utils';

const verdictConfig = {
  'Safe': {
    style: 'bg-primary/10 text-primary border-primary/20',
    icon: ShieldCheck,
  },
  'Not Safe': {
    style: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: ShieldAlert,
  },
  'Moderate': {
    style: 'bg-accent/10 text-accent border-accent/20',
    icon: CircleAlert,
  },
};

const NutritionItem = ({ label, value }: { label: string, value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-baseline p-3 bg-secondary/50 rounded-lg">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

export default function ResultPage() {
  const router = useRouter();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('latestScanResult');
    if (storedResult) {
      try {
        const resultData = JSON.parse(storedResult);
        setScan(resultData);
      } catch (error) {
        console.error("Failed to parse scan result from sessionStorage", error);
      } finally {
         setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);


  if (isLoading) {
    return (
       <AppLayoutController>
          <div className="flex h-[80vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
       </AppLayoutController>
    );
  }

  if (!scan) {
    return (
      <AppLayoutController>
         <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4">
           <p className="text-muted-foreground">No scan result found.</p>
           <Button onClick={() => router.push('/')}>Start a New Scan</Button>
         </div>
      </AppLayoutController>
   );
  }
  
  const currentVerdict = verdictConfig[scan.verdict];

  return (
    <AppLayoutController>
      <div className="p-4 md:p-6 animate-in fade-in-0 duration-500 max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-4 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Scan Another Product
          </Link>
        </Button>
        
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <currentVerdict.icon className={cn("size-10 mb-3", verdictConfig[scan.verdict].style.split(' ')[1])} />
                    <h1 className="text-2xl font-bold">{scan.productName}</h1>
                    <Badge className={cn("mt-2 text-sm px-3 py-1", currentVerdict.style)}>
                        {scan.verdict}
                    </Badge>
                </div>
                
                <div className="mt-6 space-y-5">
                    <div>
                        <h2 className="font-semibold mb-2">Safety Analysis</h2>
                        <p className="text-sm text-muted-foreground">{scan.analysis.reasoning}</p>
                    </div>

                    {scan.analysis.warnings && scan.analysis.warnings.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2"><AlertTriangle className="size-4" /> Critical Issues</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {scan.analysis.warnings.map((warning, index) => (
                                    <li key={index} className="text-destructive">{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {scan.ingredients && (
                         <div>
                            <h2 className="font-semibold mb-2">Ingredients</h2>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">{scan.ingredients}</p>
                        </div>
                    )}

                    {scan.nutritionFacts && (
                        <div>
                            <h2 className="font-semibold mb-2">Nutrition Facts</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <NutritionItem label="Carbs" value={scan.nutritionFacts.carbs} />
                                <NutritionItem label="Fiber" value={scan.nutritionFacts.fiber} />
                                <NutritionItem label="Sugar" value={scan.nutritionFacts.sugar} />
                                <NutritionItem label="Sodium" value={scan.nutritionFacts.sodium} />
                                <NutritionItem label="Protein" value={scan.nutritionFacts.protein} />
                                <NutritionItem label="Calories" value={scan.nutritionFacts.calories} />
                                <NutritionItem label="Saturated Fat" value={scan.nutritionFacts.saturatedFat} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={() => router.push('/')}>Scan Another Product</Button>
                    <Button variant="outline" onClick={() => router.push('/history')}>View History</Button>
                </div>

            </CardContent>
        </Card>
      </div>
    </AppLayoutController>
  );
}
