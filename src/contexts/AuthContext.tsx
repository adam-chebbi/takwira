import * as React from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { User as UserProfile, UserRole } from '@/src/lib/schema';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isMaintenanceMode: boolean;
  maintenanceReturnTime: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = React.useState(false);
  const [maintenanceReturnTime, setMaintenanceReturnTime] = React.useState<string | null>(null);

  const fetchPlatformSettings = async () => {
    try {
      // Use getDocFromServer to ensure we get the latest status and satisfy the connection test constraint
      const docSnap = await getDocFromServer(doc(db, 'settings', 'platform'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsMaintenanceMode(data.maintenanceMode || false);
        setMaintenanceReturnTime(data.estimatedReturnTime || null);
      }
    } catch (error) {
      // If it's the expected 'offline' error on initial boot, handle it gracefully
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn("Firestore: The client is offline. Please check your Firebase configuration or network.");
      } else {
        console.error("Error fetching platform settings:", error);
      }
      
      // Fallback to local cache if possible for non-critical features
      try {
        const cachedSnap = await getDoc(doc(db, 'settings', 'platform'));
        if (cachedSnap.exists()) {
          const data = cachedSnap.data();
          setIsMaintenanceMode(data.maintenanceMode || false);
          setMaintenanceReturnTime(data.estimatedReturnTime || null);
        }
      } catch (e) {
        // Silent fail for fallback
      }
    }
  };

  const testConnection = async () => {
    try {
      // CRITICAL CONSTRAINT: Test connection on boot
      // This helps verify the Firebase config is working.
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firestore: Connection established successfully.");
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        // This is often transient on first boot in some environments
        console.warn("Firestore: Initial connection attempt failed (offline). SDK will retry automatically.");
      } else {
        console.error("Firestore: Unexpected connection error:", error);
      }
    }
  };

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  React.useEffect(() => {
    testConnection();
    fetchPlatformSettings();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    role: userProfile?.role || null,
    isLoading,
    isMaintenanceMode,
    maintenanceReturnTime,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
