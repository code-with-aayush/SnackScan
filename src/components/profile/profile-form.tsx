'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';

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
import { getUserProfile } from '@/lib/data';

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

export default function ProfileForm() {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  // Fetch mock user profile data
  const userProfile = getUserProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || userProfile.name,
      allergies: userProfile.allergies.join(', '),
      healthConditions: userProfile.healthConditions.join(', '),
      dietaryPreferences: userProfile.dietaryPreferences,
    },
  });

  function onSubmit(data: ProfileFormValues) {
    // In a real app, you would save this data to Firestore
    console.log(data);
    toast({
      title: 'Profile Updated',
      description: 'Your health profile has been saved successfully.',
    });
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
          <Button type="submit">Save Changes</Button>
          <Button
            type="button"
            variant="destructive"
            onClick={signOut}
            disabled={loading}
          >
            Log Out
          </Button>
        </div>
      </form>
    </Form>
  );
}
