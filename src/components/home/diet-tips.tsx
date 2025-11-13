'use client';

import { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDietTipsAction } from '@/app/actions';
import { getUserProfile, getScanHistory } from '@/lib/data';

export default function DietTips() {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTips = async () => {
    setLoading(true);
    setTips([]);
    
    // In a real app, this data would come from the authenticated user's profile and scan history in Firestore.
    // For now, we use mock data.
    const userProfile = getUserProfile();
    const scanHistory = getScanHistory();

    const healthProfileString = `Allergies: ${userProfile.allergies.join(', ') || 'None'}. Conditions: ${userProfile.healthConditions.join(', ') || 'None'}. Preferences: ${userProfile.dietaryPreferences.join(', ') || 'None'}.`;
    const scanHistoryString = scanHistory.map(s => `${s.productName} (${s.verdict})`).join('; ');
    
    const result = await getDietTipsAction(healthProfileString, scanHistoryString);
    setLoading(false);

    if (result.success && result.tips) {
      setTips(result.tips);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Diet Tips</CardTitle>
        <CardDescription>
          Get AI-powered tips based on your profile and scan history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {tips.length > 0 && (
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
        {!loading && tips.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Click the button below to generate your personalized diet tips.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetTips} disabled={loading} className="w-full">
          {loading ? 'Generating...' : 'Generate Tips'}
        </Button>
      </CardFooter>
    </Card>
  );
}
