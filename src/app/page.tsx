'use client';
import { useMemo } from 'react';
import AppLayoutController from '@/components/layout/app-layout-controller';
import DietTips from '@/components/home/diet-tips';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { ScanResult, UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, CircleAlert, BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
  const { firestore, user } = useFirebase();

  const scanHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scanHistory');
  }, [firestore, user]);

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const { data: scanHistory, isLoading } = useCollection<ScanResult>(scanHistoryQuery);
  
  const stats = useMemo(() => {
    const defaultLimits = {
      sugarLimit: userProfile?.healthGoals?.dailySugarLimit || 50,
      sodiumLimit: userProfile?.healthGoals?.dailySodiumLimit || 2300
    };

    if (!scanHistory) return { 
      total: 0, 
      safe: 0, 
      moderate: 0, 
      notSafe: 0, 
      chartData: [], 
      dailySugar: 0, 
      dailySodium: 0,
      ...defaultLimits
    };
    
    const safeCount = scanHistory.filter(s => s.verdict === 'Safe').length;
    const moderateCount = scanHistory.filter(s => s.verdict === 'Moderate').length;
    const notSafeCount = scanHistory.filter(s => s.verdict === 'Not Safe').length;

    // Nutri-Limit Tracker Logic (Simulated for today)
    const today = new Date().toISOString().split('T')[0];
    const todayScans = scanHistory.filter(s => s.scanDate?.startsWith(today));
    
    let totalSugar = 0;
    let totalSodium = 0;

    todayScans.forEach(s => {
        if (s.nutritionFacts?.sugar) {
            totalSugar += parseFloat(s.nutritionFacts.sugar) || 0;
        }
        if (s.nutritionFacts?.sodium) {
            totalSodium += parseFloat(s.nutritionFacts.sodium) || 0;
        }
    });

    const { sugarLimit, sodiumLimit } = defaultLimits;

    return {
      total: scanHistory.length,
      safe: safeCount,
      moderate: moderateCount,
      notSafe: notSafeCount,
      dailySugar: totalSugar,
      dailySodium: totalSodium,
      sugarLimit,
      sodiumLimit,
      chartData: [
        { name: 'Safe', value: safeCount, color: '#2DBE72' },
        { name: 'Moderate', value: moderateCount, color: '#F59E0B' },
        { name: 'Not Safe', value: notSafeCount, color: '#EF4444' },
      ]
    };
  }, [scanHistory, userProfile]);

  const COLORS = ['#2DBE72', '#F59E0B', '#EF4444'];

  return (
    <AppLayoutController>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
        >
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
            <p className="text-muted-foreground mt-2">Here's your health snapshot for today.</p>
        </motion.div>
        
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {/* Bento Item 1: Summary Chart */}
            <motion.div variants={item} className="lg:col-span-2 xl:col-span-2">
                <Card className="h-full border-none bg-primary/5 shadow-none overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5 text-primary" />
                            Safety Overview
                        </CardTitle>
                        <CardDescription>Distribution of your scanned items</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bento Item 2: Nutri-Limit Tracker */}
            <motion.div variants={item} className="lg:col-span-1 xl:col-span-2">
                <Card className="h-full border-none bg-accent/5 shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="size-5 text-accent" />
                            Daily Nutri-Limits
                        </CardTitle>
                        <CardDescription>Track sugar and sodium intake today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Sugar Intake</span>
                                <span className="font-medium">{stats.dailySugar}g / {stats.sugarLimit}g</span>
                            </div>
                            <Progress value={(stats.dailySugar / stats.sugarLimit) * 100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Sodium Intake</span>
                                <span className="font-medium">{stats.dailySodium}mg / {stats.sodiumLimit}mg</span>
                            </div>
                            <Progress value={(stats.dailySodium / stats.sodiumLimit) * 100} className="h-2" />
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            *Limits customized based on your profile.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bento Item 3: Quick Stats */}
            <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:col-span-2 xl:col-span-4">
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <BarChart3 className="size-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Scans</div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <ShieldCheck className="size-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">{stats.safe}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Safe Choices</div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <CircleAlert className="size-8 text-orange-500 mb-2" />
                        <div className="text-2xl font-bold">{stats.moderate}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Moderation</div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <ShieldAlert className="size-8 text-destructive mb-2" />
                        <div className="text-2xl font-bold">{stats.notSafe}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Avoided</div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bento Item 4: Diet Tips */}
            <motion.div variants={item} className="lg:col-span-2 xl:col-span-4 mt-4">
                <DietTips />
            </motion.div>
        </motion.div>
      </div>
    </AppLayoutController>
  );
}
