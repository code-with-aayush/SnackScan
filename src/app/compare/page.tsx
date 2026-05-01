'use client';
import { useState, useMemo } from 'react';
import AppLayoutController from '@/components/layout/app-layout-controller';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ScanResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, CircleAlert, Scale, ArrowLeftRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

const verdictConfig = {
  'Safe': { style: 'bg-primary/10 text-primary border-primary/20', icon: ShieldCheck },
  'Not Safe': { style: 'bg-destructive/10 text-destructive border-destructive/20', icon: ShieldAlert },
  'Moderate': { style: 'bg-accent/10 text-accent border-accent/20', icon: CircleAlert },
};

export default function ComparePage() {
  const { firestore, user } = useFirebase();
  const [productAId, setProductAId] = useState<string>('');
  const [productBId, setProductBId] = useState<string>('');

  const scanHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scanHistory');
  }, [firestore, user]);

  const { data: scanHistory } = useCollection<ScanResult>(scanHistoryQuery);

  const productA = useMemo(() => scanHistory?.find(s => s.id === productAId), [scanHistory, productAId]);
  const productB = useMemo(() => scanHistory?.find(s => s.id === productBId), [scanHistory, productBId]);

  const ComparisonRow = ({ label, valueA, valueB, highlightBetter }: { label: string; valueA?: string; valueB?: string; highlightBetter?: boolean }) => {
    return (
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-muted last:border-0">
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
            <div className="text-sm font-medium">{valueA || '-'}</div>
            <div className="text-sm font-medium">{valueB || '-'}</div>
        </div>
    )
  }

  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-3 rounded-xl">
                <Scale className="size-6 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold">Compare Products</h1>
                <p className="text-muted-foreground text-sm">Select two products to see which one is safer for you.</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
                <label className="text-sm font-medium">Product A</label>
                <Select value={productAId} onValueChange={setProductAId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                        {scanHistory?.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.productName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Product B</label>
                <Select value={productBId} onValueChange={setProductBId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                        {scanHistory?.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.productName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <AnimatePresence mode="wait">
            {productA && productB ? (
                <motion.div 
                    key="comparison"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-2 gap-px bg-muted border rounded-2xl overflow-hidden shadow-xl"
                >
                    {/* Header Cards */}
                    <div className="bg-background p-6 flex flex-col items-center text-center">
                        <div className={cn("size-12 mb-3 rounded-full flex items-center justify-center", verdictConfig[productA.verdict].style)}>
                            {(() => { const Icon = verdictConfig[productA.verdict].icon; return <Icon className="size-6" />; })()}
                        </div>
                        <Badge className={verdictConfig[productA.verdict].style}>{productA.verdict}</Badge>
                        <h3 className="text-lg font-bold mt-2">{productA.productName}</h3>
                    </div>
                    <div className="bg-background p-6 flex flex-col items-center text-center border-l">
                         <div className={cn("size-12 mb-3 rounded-full flex items-center justify-center", verdictConfig[productB.verdict].style)}>
                            {(() => { const Icon = verdictConfig[productB.verdict].icon; return <Icon className="size-6" />; })()}
                        </div>
                        <Badge className={verdictConfig[productB.verdict].style}>{productB.verdict}</Badge>
                        <h3 className="text-lg font-bold mt-2">{productB.productName}</h3>
                    </div>

                    {/* Comparison Data */}
                    <div className="col-span-2 bg-background p-6 border-t">
                        <h4 className="font-bold mb-4 flex items-center gap-2"><ArrowLeftRight className="size-4" /> Nutritional Comparison</h4>
                        <ComparisonRow label="Calories" valueA={productA.nutritionFacts?.calories} valueB={productB.nutritionFacts?.calories} />
                        <ComparisonRow label="Sugar" valueA={productA.nutritionFacts?.sugar} valueB={productB.nutritionFacts?.sugar} />
                        <ComparisonRow label="Sodium" valueA={productA.nutritionFacts?.sodium} valueB={productB.nutritionFacts?.sodium} />
                        <ComparisonRow label="Protein" valueA={productA.nutritionFacts?.protein} valueB={productB.nutritionFacts?.protein} />
                        <ComparisonRow label="Carbs" valueA={productA.nutritionFacts?.carbs} valueB={productB.nutritionFacts?.carbs} />
                        <ComparisonRow label="Saturated Fat" valueA={productA.nutritionFacts?.saturatedFat} valueB={productB.nutritionFacts?.saturatedFat} />
                    </div>

                    <div className="col-span-2 bg-background p-6 border-t">
                        <h4 className="font-bold mb-4">Reasoning</h4>
                        <div className="grid grid-cols-2 gap-8">
                            <p className="text-sm text-muted-foreground">{productA.analysis.reasoning}</p>
                            <p className="text-sm text-muted-foreground">{productB.analysis.reasoning}</p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <Scale className="size-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select two products to start comparing.</p>
                </div>
            )}
        </AnimatePresence>
      </div>
    </AppLayoutController>
  );
}
