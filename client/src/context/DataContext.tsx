import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

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
    try {
      const [cSnap, fSnap, vSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'), orderBy('level', 'asc'))),
        getDocs(query(collection(db, 'video_folders'), orderBy('order', 'asc'))),
        getDocs(query(collection(db, 'videos'), orderBy('order', 'asc')))
      ]);

      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setVideoFolders(fSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setVideos(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching global data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
