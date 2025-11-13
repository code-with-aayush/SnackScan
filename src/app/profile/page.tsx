import AppLayoutController from '@/components/layout/app-layout-controller';
import ProfileForm from '@/components/profile/profile-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 animate-in fade-in-0 duration-500">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Profile</h1>
        <p className="text-muted-foreground mb-8">Manage your health profile and preferences.</p>
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
            <CardDescription>
              This information helps us provide personalized food safety advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
      </div>
    </AppLayoutController>
  );
}
