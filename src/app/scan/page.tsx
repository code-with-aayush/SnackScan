import AppLayoutController from '@/components/layout/app-layout-controller';
import ScanUploader from '@/components/scan/scan-uploader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ScanPage() {
  return (
    <AppLayoutController>
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-4 md:p-8 animate-in fade-in-0 duration-500">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Scan a New Product</CardTitle>
            <CardDescription>
              Upload a photo of a food label to get an instant safety analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScanUploader />
          </CardContent>
        </Card>
      </div>
    </AppLayoutController>
  );
}
