import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {env} from '@/lib/env';

export const ai = genkit({
  plugins: [googleAI({apiKey: env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
