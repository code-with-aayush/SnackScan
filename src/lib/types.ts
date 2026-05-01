export interface UserProfile {
  id: string;
  name: string;
  email: string;
  allergies: string[];
  healthConditions: string[];
  dietaryPreferences: string[];
  dietaryPersona?: 'balanced' | 'fitness' | 'medical' | 'eco';
  healthGoals?: {
    dailySugarLimit: number;
    dailySodiumLimit: number;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface NutritionFacts {
    carbs?: string;
    sugar?: string;
    protein?: string;
    saturatedFat?: string;
    fiber?: string;
    sodium?: string;
    calories?: string;
}

export interface ScanResult {
  id: string;
  userId: string;
  productName: string;
  verdict: 'Safe' | 'Not Safe' | 'Moderate';
  scanDate: string;
  timestamp: any; // Firestore Timestamp
  imageId: string;
  scannedImage?: string;
  analysis: {
    reasoning: string;
    warnings: string[];
  };
  alternatives: {
    name: string;
    reason: string;
  }[];
  ingredients?: string;
  nutritionFacts?: NutritionFacts;
}
