'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Loader2, User, Heart, Settings, LogOut, Target, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const dietaryPreferences = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
] as const;

const personas = [
  { id: 'balanced', label: 'Balanced', description: 'General healthy eating', icon: '🥗' },
  { id: 'fitness', label: 'Fitness', description: 'High protein, low carb', icon: '💪' },
  { id: 'medical', label: 'Medical Focus', description: 'Strict allergy & limit monitoring', icon: '🏥' },
  { id: 'eco', label: 'Eco-Conscious', description: 'Plant-based & sustainable', icon: '🌍' },
] as const;

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  allergies: z.string().optional(),
  healthConditions: z.string().optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  dietaryPersona: z.enum(['balanced', 'fitness', 'medical', 'eco']).optional(),
  dailySugarLimit: z.coerce.number().min(0),
  dailySodiumLimit: z.coerce.number().min(0),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const signOut = () => {
    if (auth) {
      firebaseSignOut(auth);
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      allergies: '',
      healthConditions: '',
      dietaryPreferences: [],
      dietaryPersona: 'balanced',
      dailySugarLimit: 50,
      dailySodiumLimit: 2300,
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || user?.displayName || '',
        allergies: (userProfile.allergies || []).join(', '),
        healthConditions: (userProfile.healthConditions || []).join(', '),
        dietaryPreferences: userProfile.dietaryPreferences || [],
        dietaryPersona: userProfile.dietaryPersona || 'balanced',
        dailySugarLimit: userProfile.healthGoals?.dailySugarLimit ?? 50,
        dailySodiumLimit: userProfile.healthGoals?.dailySodiumLimit ?? 2300,
      });
    }
  }, [userProfile, user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!profileRef || !user) return;
    setIsSaving(true);
    
    const profileData: Partial<UserProfile> = {
      email: user.email || '',
      name: data.name,
      allergies: data.allergies?.split(',').map(s => s.trim()).filter(Boolean) || [],
      healthConditions: data.healthConditions?.split(',').map(s => s.trim()).filter(Boolean) || [],
      dietaryPreferences: data.dietaryPreferences || [],
      dietaryPersona: data.dietaryPersona,
      healthGoals: {
        dailySugarLimit: data.dailySugarLimit,
        dailySodiumLimit: data.dailySodiumLimit,
      },
      theme: theme as 'light' | 'dark' | 'system',
    };

    try {
        await setDoc(profileRef, profileData, { merge: true });
        toast({ title: 'Profile Updated', description: 'Your settings have been synced successfully.' });
    } catch(e: any) {
         toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="size-4" /> <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="size-4" /> <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="size-4" /> <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-none bg-muted/30 shadow-none">
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <FormLabel className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Select Your Dietary Persona
              </FormLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                {personas.map((persona) => (
                  <motion.div
                    key={persona.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <label
                      className={cn(
                        "flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200",
                        form.watch('dietaryPersona') === persona.id 
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "hover:bg-muted"
                      )}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        {...form.register('dietaryPersona')}
                        value={persona.id}
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{persona.icon}</span>
                        <span className="font-bold">{persona.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{persona.description}</p>
                    </label>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Allergies</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Peanuts, Soy, Shellfish" {...field} /></FormControl>
                    <FormDescription>The AI will use this to flag ingredients.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Conditions</FormLabel>              
                    <FormControl><Textarea placeholder="e.g., Type 2 Diabetes, Hypertension" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base">Quick Restrictions</FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {dietaryPreferences.map(item => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="dietaryPreferences"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={checked => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(field.value?.filter(v => v !== item.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dailySugarLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Sugar Limit (g)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>WHO recommends &lt; 50g/day.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dailySodiumLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Sodium Limit (mg)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>CDC recommends &lt; 2,300mg/day.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
            Save Health Profile
          </Button>
          <Button type="button" variant="outline" onClick={signOut} disabled={isUserLoading}>
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </form>
    </Form>
  );
}
