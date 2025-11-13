import type { UserProfile, ScanResult } from './types';

const mockUserProfile: UserProfile = {
  id: 'user-123',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  allergies: ['Peanuts', 'Soy'],
  healthConditions: ['Lactose Intolerance'],
  dietaryPreferences: ['Vegetarian'],
};

const mockScanHistory: ScanResult[] = [
  {
    id: 'chips-123',
    userId: 'user-123',
    productName: 'Spicy Nacho Chips',
    verdict: 'Moderate',
    scanDate: '2023-10-26T10:00:00Z',
    imageId: 'chips',
    analysis: {
      reasoning: "This product is rated as 'Moderate' due to its high sodium content and the presence of artificial flavors. While it does not contain your specified allergens, consuming it frequently may not align with a heart-healthy diet.",
      warnings: ["High in Sodium", "Contains Artificial Flavors (Monosodium Glutamate)"],
    },
    alternatives: [
      { name: "Baked Veggie Crisps", reason: "Lower in sodium and made with real vegetables." },
      { name: "Lightly Salted Popcorn", reason: "A whole-grain option with minimal processing." },
    ],
  },
  {
    id: 'cereal-456',
    userId: 'user-123',
    productName: 'Honey Nut Cereal',
    verdict: 'Not Safe',
    scanDate: '2023-10-25T09:00:00Z',
    imageId: 'cereal',
    analysis: {
      reasoning: "This product is 'Not Safe' because it contains peanuts, which is one of your listed allergens. Additionally, it has a very high sugar content.",
      warnings: ["Contains Peanuts", "High in Added Sugar"],
    },
    alternatives: [
      { name: "Plain Shredded Wheat", reason: "No added sugar and allergen-free." },
      { name: "Rice Chex Cereal", reason: "Gluten-free and typically free of nuts." },
    ],
  },
  {
    id: 'soda-789',
    userId: 'user-123',
    productName: 'Diet Cola',
    verdict: 'Safe',
    scanDate: '2023-10-24T18:30:00Z',
    imageId: 'soda',
    analysis: {
      reasoning: "This product is considered 'Safe' as it does not contain any of your listed allergens or conflicting ingredients. It is sugar-free and has zero calories.",
      warnings: [],
    },
    alternatives: [
      { name: "Sparkling Water with Lemon", reason: "A natural alternative with no artificial sweeteners." },
      { name: "Unsweetened Iced Tea", reason: "Contains antioxidants and no artificial ingredients." },
    ],
  },
];

export function getUserProfile(): UserProfile {
  return mockUserProfile;
}

export function getScanHistory(): ScanResult[] {
  return mockScanHistory;
}

export function getScanById(id: string): ScanResult | undefined {
  return mockScanHistory.find(scan => scan.id === id);
}
