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
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const dietaryPreferences = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
] as const;

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  allergies: z.string().optional(),
  healthConditions: z.string().optional(),
  dietaryPreferences: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({ isOnboarding = false }: { isOnboarding?: boolean }) {
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);


  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

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
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || user?.displayName || '',
        allergies: (userProfile.allergies || []).join(', '),
        healthConditions: (userProfile.healthConditions || []).join(', '),
        dietaryPreferences: userProfile.dietaryPreferences || [],
      });
    } else if (user) {
       form.reset({
        name: user.displayName || '',
        allergies: '',
        healthConditions: '',
        dietaryPreferences: [],
      });
    }
  }, [userProfile, user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!profileRef || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }
    
    setIsSaving(true);
    
    const profileData: UserProfile = {
      id: user.uid,
      email: user.email || '',
      name: data.name,
      allergies: data.allergies?.split(',').map(s => s.trim()).filter(Boolean) || [],
      healthConditions: data.healthConditions?.split(',').map(s => s.trim()).filter(Boolean) || [],
      dietaryPreferences: data.dietaryPreferences || [],
    };

    try {
        await setDoc(profileRef, profileData, { merge: true });
        toast({
          title: 'Profile Saved',
          description: isOnboarding ? 'Welcome! You can now start scanning.' : 'Your health profile has been updated.',
        });

        if (isOnboarding) {
          router.push('/dashboard');
        }
    } catch(e: any) {
         toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: e.message || "Could not save your profile.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Peanuts, Shellfish, Soy"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any food allergies, separated by commas.
              </FormDescription>
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
              <FormControl>
                <Textarea
                  placeholder="e.g., Diabetes, High Blood Pressure"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any relevant health conditions, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dietaryPreferences"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Dietary Preferences</FormLabel>
                <FormDescription>
                  Select any dietary preferences that apply.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
              {dietaryPreferences.map(item => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={checked => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      value => value !== item.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-4 pt-4">
           <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isOnboarding ? 'Continue' : 'Save Changes'}
          </Button>
          {!isOnboarding && (
            <Button
              type="button"
              variant="destructive"
              onClick={signOut}
              disabled={isUserLoading}
            >
              Log Out
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
