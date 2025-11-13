import AppLayoutController from '@/components/layout/app-layout-controller';
import DietTips from '@/components/home/diet-tips';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 animate-in fade-in-0 duration-500">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>
        <div className="grid gap-8">
            <DietTips />
        </div>
      </div>
    </AppLayoutController>
  );
}
