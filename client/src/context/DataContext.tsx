import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  courses: any[];
  videoFolders: any[];
  videos: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [videoFolders, setVideoFolders] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let fetchedCourses: any[] = [];
      try {
        const cSnap = await getDocs(query(collection(db, 'courses'), orderBy('level', 'asc')));
        fetchedCourses = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (coursesErr) {
        console.error('Failed to fetch courses from Firestore, using fallback:', coursesErr);
      }

      let fetchedFolders: any[] = [];
      try {
        const fSnap = await getDocs(query(collection(db, 'video_folders'), orderBy('order', 'asc')));
        fetchedFolders = fSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (foldersErr) {
        console.error('Failed to fetch video folders:', foldersErr);
      }

      let fetchedVideos: any[] = [];
      try {
        const vSnap = await getDocs(query(collection(db, 'videos'), orderBy('order', 'asc')));
        fetchedVideos = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (videosErr) {
        console.error('Failed to fetch videos:', videosErr);
      }

      const staticCourses = [
        {
          id: 'clinical_nutrition_course',
          name: 'التغذية الإكلينيكية (Clinical Nutrition)',
          description: 'بنك أسئلة مادة التغذية الإكلينيكية الشامل مقسم إلى شباتر الكتاب الأصلية.',
          level: 'fifth',
          price: '0',
          details: 'أكثر من 170 سؤال MCQ\nمقسمة حسب شباتر الكتاب الأصلية (8 شباتر)\nشرح تفصيلي لكل سؤال\nمتابعة مستوى ونظام تكرار متباعد SRS'
        },
        {
          id: 'pediatrics_flash_space',
          name: 'طب الأطفال (Pediatrics)',
          description: 'Flash Space - مساحة دراسة تفاعلية وحصرية لكورس الأطفال. مدعومة بتقنيات متقدمة.',
          level: 'fifth',
          price: '0',
          details: 'مساحة دراسة بصرية تفاعلية (Flash Space)\nشرح وحفظ الصور الطبية بطريقة سهلة\nمئات البطاقات وأسئلة بنظام SRS\nحفظ وتدوين ملاحظات مخصصة',
          isFlashSpace: true,
          trending: true,
        }
      ];

      const allCourses = [...fetchedCourses];
      staticCourses.forEach(sc => {
        if (!allCourses.some(c => c.id === sc.id)) {
          allCourses.push(sc);
        }
      });

      setCourses(allCourses);
      setVideoFolders(fetchedFolders);
      setVideos(fetchedVideos);
    } catch (err) {
      console.error('Error fetching global data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Listen for auth state changes to re-fetch when user logs in/out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User logged in, refreshing global data...');
        fetchData();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <DataContext.Provider value={{ courses, videoFolders, videos, loading, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

