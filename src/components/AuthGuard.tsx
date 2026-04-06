import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Navigate, useLocation } from 'react-router-dom';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setProfile({ uid: user.uid, email: user.email!, ...userSnap.data() } as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {loading ? (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireRole({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const { user, profile, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins can access all roles
  if (profile?.role === 'admin') {
    return children;
  }

  if (!profile || profile.role !== role) {
    // If user is logged in but doesn't have the right role, redirect to their default station
    if (profile?.role === 'chef') return <Navigate to="/chef" replace />;
    if (profile?.role === 'waiter') return <Navigate to="/waiter" replace />;
    
    // If no role found at all, show access denied or logout
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-white mb-2">ACCESS DENIED</h2>
        <p className="text-zinc-500 mb-6">You do not have permission to view this page. Contact your administrator.</p>
        <button 
          onClick={logout}
          className="bg-orange-500 text-white font-black px-6 py-3 rounded-2xl"
        >
          LOGOUT
        </button>
      </div>
    );
  }

  return children;
}
