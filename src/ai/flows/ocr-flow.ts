'use server';
/**
 * @fileOverview An OCR flow to extract text from a food label image.
 *
 * - ocr - A function that extracts the product name and ingredients from an image.
 * - OcrInput - The input type for the ocr function.
 * - OcrOutput - The return type for the ocr function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OcrInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food product label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OcrInput = z.infer<typeof OcrInputSchema>;

const OcrOutputSchema = z.object({
  productName: z.string().describe('The name of the food product.'),
  ingredients: z.string().describe('The list of ingredients from the food product.'),
  nutritionFacts: z.object({
    carbs: z.string().optional().describe('Carbohydrates in grams (e.g., "22g")'),
    sugar: z.string().optional().describe('Sugar in grams (e.g., "12g")'),
    protein: z.string().optional().describe('Protein in grams (e.g., "3g")'),
    saturatedFat: z.string().optional().describe('Saturated fat in grams (e_g., "0.5g")'),
    fiber: z.string().optional().describe('Fiber in grams (e.g., "3g")'),
    sodium: z.string().optional().describe('Sodium in milligrams (e.g., "190mg")'),
    calories: z.string().optional().describe('Calories (e.g., "110kcal" or "110")'),
  }).describe('The nutrition facts from the food product label.'),
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;

export async function ocr(input: OcrInput): Promise<OcrOutput> {
  return ocrFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: OcrInputSchema},
  output: {schema: OcrOutputSchema},
  prompt: `You are an expert at reading food labels. Analyze the provided image and extract the product name, the list of ingredients, and the nutrition facts.

Image: {{media url=photoDataUri}}

Your output must be in a valid JSON format that adheres to the following schema:`,
});

const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: OcrInputSchema,
    outputSchema: OcrOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
