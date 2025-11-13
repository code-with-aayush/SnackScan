import AppLayoutController from '@/components/layout/app-layout-controller';
import ProfileForm from '@/components/profile/profile-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ProfileSetupPage() {
  return (
      <div className="flex min-h-screen w-full items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to SnackScan!</CardTitle>
            <CardDescription>
              Let&apos;s set up your health profile to get personalized food safety advice. You can change this information at any time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm isOnboarding={true} />
          </CardContent>
        </Card>
      </div>
  );
}
