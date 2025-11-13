export interface UserProfile {
  id: string;
  name: string;
  email: string;
  allergies: string[];
  healthConditions: string[];
  dietaryPreferences: string[];
}

export interface ScanResult {
  id: string;
  userId: string;
  productName: string;
  verdict: 'Safe' | 'Not Safe' | 'Moderate';
  scanDate: string;
  imageId: string;
  analysis: {
    reasoning: string;
    warnings: string[];
  };
  alternatives: {
    name: string;
    reason: string;
  }[];
}
