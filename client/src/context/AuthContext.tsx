import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { signInWithPopup, signInWithRedirect, signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, authExam, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  userRole: 'admin' | 'user' | null;
  userPlan: 'free' | 'premium' | null;
  needsProfileCompletion: boolean;
  updateUserStatus: (uid: string, updates: any) => Promise<void>;
  isSubscribed: (courseId: string) => boolean;
  enrollInCourse: (courseId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      
      // Update Streak Logic
      const now = new Date();
      const lastActive = data.lastActiveAt?.toDate() || null;
      let newStreak = data.streak || 0;

      if (lastActive) {
        const diffInHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        const lastActiveDate = new Date(lastActive).setHours(0,0,0,0);
        const todayDate = new Date(now).setHours(0,0,0,0);
        const isNextDay = (todayDate - lastActiveDate) === (1000 * 60 * 60 * 24);
        const isSameDay = todayDate === lastActiveDate;

        if (isNextDay) {
          newStreak += 1;
        } else if (!isSameDay) {
          // If more than 1 day difference, reset
          newStreak = 1; 
        }
      } else {
        newStreak = 1;
      }

      await updateDoc(userRef, { 
        lastActiveAt: serverTimestamp(),
        streak: newStreak
      });

      setUserData({ ...data, streak: newStreak });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      try {
        if (currentUser) {
          // Silent Login to Exam Project in the background to enable Security Rules (no await to prevent blocking iOS)
          signInAnonymously(authExam).catch((e) => {
            console.error("Exam Project Auth Error:", e);
          });

          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          const isAdmin = currentUser.email === 'clinomaofficial@gmail.com';
          
          if (!userSnap.exists()) {
            const initialData = {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: isAdmin ? 'admin' : 'user',
              plan: isAdmin ? 'premium' : 'free',
              profileCompleted: false,
              enrolledCourses: [],
              createdAt: new Date(),
            };
            await setDoc(userRef, initialData);
            setUserData(initialData);
          } else {
            let data = userSnap.data();
            if (isAdmin && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin', plan: 'premium' });
              data = { ...data, role: 'admin', plan: 'premium' };
            }
            setUserData(data);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Robust fallback: set basic user data if Firestore call fails so they aren't blocked from the app!
        if (currentUser) {
          const isAdmin = currentUser.email === 'clinomaofficial@gmail.com';
          setUserData({
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: isAdmin ? 'admin' : 'user',
            plan: isAdmin ? 'premium' : 'free',
            profileCompleted: true, // Bypass completion to prevent getting stuck
            enrolledCourses: [],
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const signInWithGoogleCredential = async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Error signing in with Google credential', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const updateUserStatus = async (uid: string, updates: any) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
      if (uid === user?.uid) {
        await fetchUserData(uid);
      }
    } catch (error) {
      console.error('Error updating user status', error);
      throw error;
    }
  };

  const isSubscribed = (courseId: string) => {
    if (courseId === 'clinical_nutrition_course') return true;
    if (!userData) return false;
    if (userData.role === 'admin') return true;
    return userData.enrolledCourses?.includes(courseId);
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
      });
      await fetchUserData(user.uid);
    } catch (error) {
      console.error('Error enrolling in course', error);
      throw error;
    }
  };

  const userRole = userData?.role || null;
  const userPlan = userData?.plan || 'free';
  const needsProfileCompletion = userData ? !userData.profileCompleted : false;

  return (
    <AuthContext.Provider value={{ 
      user, userData, loading, signInWithGoogle, signInWithGoogleCredential, logout, userRole, userPlan, 
      needsProfileCompletion, updateUserStatus, isSubscribed, enrollInCourse
    }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
