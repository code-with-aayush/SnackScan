'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertTriangle, ShieldCheck, ShieldAlert, CircleAlert, Leaf } from 'lucide-react';
import AppLayoutController from '@/components/layout/app-layout-controller';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ScanResult } from '@/lib/types';
import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

const AlternativeItem = ({ name, reason }: { name: string; reason: string }) => (
    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
                <Leaf className="size-5 text-primary" />
            </div>
            <div>
                <h4 className="font-semibold">{name}</h4>
                <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
        </div>
    </div>
)

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
          <div className="flex h-[calc(100vh-56px)] md:h-auto md:min-h-[500px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
       </AppLayoutController>
    );
  }

  if (!scan) {
    return (
      <AppLayoutController>
         <div className="flex h-[calc(100vh-56px)] md:h-auto md:min-h-[500px] w-full items-center justify-center flex-col gap-4">
           <p className="text-muted-foreground">No scan result found.</p>
           <Button onClick={() => router.push('/scan')}>Start a New Scan</Button>
         </div>
      </AppLayoutController>
   );
  }
  
  const currentVerdict = verdictConfig[scan.verdict];

  return (
    <AppLayoutController>
      <div className="p-4 md:p-6 animate-in fade-in-0 duration-500 max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground">
          <Link href="/scan">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Scan Another Product
          </Link>
        </Button>
        
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <div className={cn("size-16 mb-4 rounded-full flex items-center justify-center", currentVerdict.style)}>
                        <currentVerdict.icon className={cn("size-8", currentVerdict.style.split(' ')[1])} />
                    </div>
                    <Badge className={cn("mt-2 text-sm px-3 py-1", currentVerdict.style)}>
                        {scan.verdict}
                    </Badge>
                    <h1 className="text-3xl font-bold mt-2">{scan.productName}</h1>
                </div>
                
                <div className="mt-8 space-y-6">
                    <div>
                        <h2 className="font-semibold text-lg mb-2">Safety Analysis</h2>
                        <p className="text-sm text-muted-foreground">{scan.analysis.reasoning}</p>
                    </div>

                    <Separator />

                    {scan.analysis.warnings && scan.analysis.warnings.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg text-destructive mb-3 flex items-center gap-2"><AlertTriangle className="size-5" /> Critical Issues</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                {scan.analysis.warnings.map((warning, index) => (
                                    <li key={index} className="text-destructive font-medium">{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {scan.ingredients && (
                         <div>
                            <h2 className="font-semibold text-lg mb-2">Ingredients</h2>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-lg">{scan.ingredients}</p>
                        </div>
                    )}

                    {scan.nutritionFacts && Object.values(scan.nutritionFacts).some(v => v) && (
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Nutrition Facts</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <NutritionItem label="Calories" value={scan.nutritionFacts.calories} />
                                <NutritionItem label="Carbs" value={scan.nutritionFacts.carbs} />
                                <NutritionItem label="Sugar" value={scan.nutritionFacts.sugar} />
                                <NutritionItem label="Protein" value={scan.nutritionFacts.protein} />
                                <NutritionItem label="Saturated Fat" value={scan.nutritionFacts.saturatedFat} />
                                <NutritionItem label="Fiber" value={scan.nutritionFacts.fiber} />
                                <NutritionItem label="Sodium" value={scan.nutritionFacts.sodium} />
                            </div>
                        </div>
                    )}
                    
                    {scan.alternatives && scan.alternatives.length > 0 && (
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Safer Alternatives</h2>
                             <div className="space-y-3">
                                {scan.alternatives.map((alt, index) => (
                                    <AlternativeItem key={index} name={alt.name} reason={alt.reason} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="my-8" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={() => router.push('/scan')}>Scan Another Product</Button>
                    <Button variant="outline" onClick={() => router.push('/history')}>View History</Button>
                </div>

            </CardContent>
        </Card>
      </div>
    </AppLayoutController>
  );
}
