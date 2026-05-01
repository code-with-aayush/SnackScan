import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const errors = _env.error.flatten().fieldErrors;
  const missingVars = Object.keys(errors).join(', ');
  
  console.error('❌ Missing or invalid environment variables:', missingVars);
  console.error('Full details:', JSON.stringify(errors, null, 2));
  
  throw new Error(`Invalid environment variables: ${missingVars}. Please check your .env file or deployment settings.`);
}

export const env = _env.data;
