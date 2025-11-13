# **App Name**: SnackScan

## Core Features:

- User Authentication: Secure user login/signup using Email/Password and Google Sign-in, managed via Firebase Auth.
- Profile Management: Users can create and modify their profiles, including health conditions, allergies, and dietary preferences, stored securely in Firestore.
- Food Label Scanning & Ingredient Extraction: Capture food label images using the camera and extract ingredients and nutritional information using OCR (Google ML Kit or Firebase Vision OCR).
- AI-Based Safety Assessment Tool: An AI tool to evaluate food safety based on user health profiles and provide a verdict (Safe/Not Safe/Moderate) along with reasoning and alternative suggestions. The tool checks for allergens, harmful ingredients, and nutrition levels.
- Personalized Diet Tips: Get diet tips tailored to the user based on their health profile and scanned food history.
- Product Scan History: Store and display previously scanned products with details like product name, verdict, and scan date.
- Firestore Integration: Utilize Firestore for storing user profiles, ingredient risk data, and product scan history, ensuring real-time data synchronization and secure access.

## Style Guidelines:

- Primary color: Green (#2DBE72) for a natural, safe, and healthy feel, reflecting the core purpose of the app.
- Background color: Very light green (#E0F8E9), a desaturated tint of the primary, providing a soft and clean backdrop for content.
- Accent color: Blue (#2D72BE), which provides a contrasting and calming presence.
- Body and headline font: 'Inter', a sans-serif typeface chosen for its modern, neutral appearance suitable for both headlines and body text.
- Use clear, minimalist icons to represent different food categories, health conditions, and dietary preferences.
- Clean, user-friendly layout with a bottom navigation bar for easy access to Home, Scan, and Profile screens.
- Smooth animations for transitions, scanning feedback, and data loading to enhance the user experience.