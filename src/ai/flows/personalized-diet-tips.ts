'use server';

/**
 * @fileOverview A personalized diet tips AI agent.
 *
 * - getPersonalizedDietTips - A function that retrieves personalized diet tips.
 * - PersonalizedDietTipsInput - The input type for the getPersonalizedDietTips function.
 * - PersonalizedDietTipsOutput - The return type for the getPersonalizedDietTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedDietTipsInputSchema = z.object({
  healthProfile: z
    .string()
    .describe('The user health profile including conditions and allergies.'),
  scannedFoodHistory: z
    .string()
    .describe('The history of scanned food products, including ingredients and nutritional information.'),
});
export type PersonalizedDietTipsInput = z.infer<typeof PersonalizedDietTipsInputSchema>;

const PersonalizedDietTipsOutputSchema = z.object({
  dietTips: z.array(z.string()).describe('A list of personalized diet tips.'),
});
export type PersonalizedDietTipsOutput = z.infer<typeof PersonalizedDietTipsOutputSchema>;

export async function getPersonalizedDietTips(
  input: PersonalizedDietTipsInput
): Promise<PersonalizedDietTipsOutput> {
  return personalizedDietTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedDietTipsPrompt',
  input: {schema: PersonalizedDietTipsInputSchema},
  output: {schema: PersonalizedDietTipsOutputSchema},
  prompt: `You are a personalized diet advisor. Based on the user's health profile and scanned food history, provide personalized diet tips.

Health Profile: {{{healthProfile}}}

Scanned Food History: {{{scannedFoodHistory}}}

Diet Tips:`,
});

const personalizedDietTipsFlow = ai.defineFlow(
  {
    name: 'personalizedDietTipsFlow',
    inputSchema: PersonalizedDietTipsInputSchema,
    outputSchema: PersonalizedDietTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
