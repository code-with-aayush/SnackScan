'use client';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AppLayoutController from '@/components/layout/app-layout-controller';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { ScanResult } from '@/lib/types';


const verdictStyles: { [key: string]: string } = {
  Safe: 'bg-primary/10 text-primary border-primary/20',
  'Not Safe': 'bg-destructive/10 text-destructive border-destructive/20',
  Moderate: 'bg-accent/10 text-accent border-accent/20',
};

export default function ScanResultPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();

  const scanRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'scanHistory', params.id);
  }, [firestore, user, params.id]);

  const { data: scan, isLoading } = useDoc<ScanResult>(scanRef);

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
    notFound();
  }

  const productImage = placeholderImages.find(p => p.id === scan.imageId);

  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 animate-in fade-in-0 duration-500">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                {productImage && (
                  <Image
                    src={productImage.imageUrl}
                    alt={scan.productName}
                    data-ai-hint={productImage.imageHint}
                    width={400}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover aspect-square"
                  />
                )}
                <div className="mt-4 text-center">
                  <h1 className="text-2xl font-bold">{scan.productName}</h1>
                  <Badge className={`mt-2 text-base px-4 py-1 ${verdictStyles[scan.verdict]}`}>
                    {scan.verdict}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>{scan.analysis.reasoning}</p>
                {scan.analysis.warnings && scan.analysis.warnings.length > 0 && (
                  <>
                    <h4>Potential Concerns:</h4>
                    <ul>
                      {scan.analysis.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Alternative Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {scan.alternatives && scan.alternatives.length > 0 ? (
                    <ul className="space-y-2">
                    {scan.alternatives.map((alt, index) => (
                        <li key={index} className="p-3 bg-secondary rounded-md">
                        <p className="font-semibold">{alt.name}</p>
                        <p className="text-sm text-muted-foreground">{alt.reason}</p>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No alternatives suggested for this product.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayoutController>
  );
}
