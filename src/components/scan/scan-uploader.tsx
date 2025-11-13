'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, collection } from 'firebase/firestore';
import type { UserProfile, ScanResult } from '@/lib/types';
import { assessFoodSafety } from '@/ai/ai-safety-assessment';
import { useToast } from '@/hooks/use-toast';
import { ocr } from '@/ai/flows/ocr-flow';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ScanUploader() {
  const [loading, setLoading] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState('Analyzing your product...');
  const [dragging, setDragging] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, firestore } = useFirebase();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (!user || !firestore || !userProfile) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in and have a profile to scan products.',
        });
        return;
    }

    setLoading(true);

    try {
      // 1. Convert file to data URI and perform OCR
      setAnalysisMessage('Reading ingredients from image...');
      const photoDataUri = await fileToDataUri(file);
      const { ingredients, productName, nutritionFacts } = await ocr({ photoDataUri });

      if (!ingredients || !productName) {
        throw new Error('AI could not identify the product or its ingredients. Please try another image.');
      }

      // 2. AI Safety Assessment
      setAnalysisMessage('Assessing product safety with AI...');
      const healthProfileString = `Allergies: ${userProfile.allergies.join(', ') || 'None'}. Conditions: ${userProfile.healthConditions.join(', ') || 'None'}. Preferences: ${userProfile.dietaryPreferences.join(', ') || 'None'}.`;
      
      const assessment = await assessFoodSafety({
        ingredients,
        healthProfile: healthProfileString,
      });

      // 3. Save to Firestore
      setAnalysisMessage('Saving scan results...');
      const scanHistoryRef = collection(firestore, 'users', user.uid, 'scanHistory');
      
      let imageId = 'chips';
      if (productName.toLowerCase().includes('cereal')) imageId = 'cereal';
      if (productName.toLowerCase().includes('soda')) imageId = 'soda';
      if (productName.toLowerCase().includes('chocolate')) imageId = 'chocolate';


      const newScanData: Omit<ScanResult, 'id'> = {
        userId: user.uid,
        productName: productName,
        scanDate: new Date().toISOString(),
        verdict: assessment.verdict,
        imageId,
        analysis: {
          reasoning: assessment.reasoning,
          warnings: assessment.warnings || [],
        },
        alternatives: assessment.alternatives || [],
        ingredients: ingredients,
        nutritionFacts: nutritionFacts,
      };
      
      const docRef = await addDoc(scanHistoryRef, newScanData);
      
      const finalScanResult: ScanResult = {
        ...newScanData,
        id: docRef.id,
        scannedImage: photoDataUri,
      };

      // 4. Store result in sessionStorage and redirect
      sessionStorage.setItem('latestScanResult', JSON.stringify(finalScanResult));
      setAnalysisMessage('Done!');
      router.push('/result');

    } catch (error: any) {
      console.error("Scan failed:", error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message || 'Something went wrong during the analysis. Please try again.',
      });
      setLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">{analysisMessage}</p>
        <p className="text-sm text-muted-foreground">This may take a moment.</p>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ${
        dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)}
      />
      <div className="flex flex-col items-center">
        <UploadCloud className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 font-semibold">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-muted-foreground">
          PNG, JPG, or GIF (max. 10MB)
        </p>
      </div>
    </div>
  );
}
