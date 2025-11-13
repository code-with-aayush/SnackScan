'use server';

import { getPersonalizedDietTips } from '@/ai/flows/personalized-diet-tips';

export async function getDietTipsAction(
  healthProfile: string,
  scannedFoodHistory: string
) {
  try {
    const result = await getPersonalizedDietTips({
      healthProfile,
      scannedFoodHistory,
    });
    return { success: true, tips: result.dietTips };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get personalized diet tips.' };
  }
}
