import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayoutController from '@/components/layout/app-layout-controller';
import { getScanHistory } from '@/lib/data';
import type { ScanResult } from '@/lib/types';
import DietTips from '@/components/home/diet-tips';
import { placeholderImages } from '@/lib/placeholder-images.json';

const verdictStyles: { [key: string]: string } = {
  Safe: 'bg-primary/10 text-primary border-primary/20',
  'Not Safe': 'bg-destructive/10 text-destructive border-destructive/20',
  Moderate: 'bg-accent/10 text-accent border-accent/20',
};

function ScanHistoryCard({ scan }: { scan: ScanResult }) {
  const productImage = placeholderImages.find(p => p.id === scan.imageId);
  return (
    <Link href={`/scan/${scan.id}`} className="block">
      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-4 flex items-start gap-4">
          {productImage && (
             <Image
              src={productImage.imageUrl}
              alt={productImage.description}
              data-ai-hint={productImage.imageHint}
              width={80}
              height={80}
              className="rounded-md object-cover aspect-square"
            />
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{scan.productName}</h3>
              <Badge className={verdictStyles[scan.verdict]}>
                {scan.verdict}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(scan.scanDate).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  const scanHistory = getScanHistory();

  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 animate-in fade-in-0 duration-500">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  Review your previously scanned products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanHistory.length > 0 ? (
                  <div className="space-y-4">
                    {scanHistory.map(scan => (
                      <ScanHistoryCard key={scan.id} scan={scan} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      You haven&apos;t scanned any products yet.
                    </p>
                    <Link href="/scan" className="text-primary hover:underline mt-2 inline-block">
                      Start scanning
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <DietTips />
          </div>
        </div>
      </div>
    </AppLayoutController>
  );
}
