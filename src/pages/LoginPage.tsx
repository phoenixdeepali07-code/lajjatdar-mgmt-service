import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, ChefHat, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Check if keys are missing
      if (import.meta.env.VITE_FIREBASE_API_KEY === "missing" || !import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error('Firebase keys are missing. Please check your .env file (for local) or GitHub secrets (for live site).');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        // Fetch role immediately to decide where to go
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const role = userSnap.data().role;
          
          // If they were trying to go somewhere specific, let them (AuthGuard will double check)
          if (from) {
            navigate(from, { replace: true });
          } else {
            // Default redirects
            if (role === 'admin') navigate('/admin', { replace: true });
            else if (role === 'chef') navigate('/chef', { replace: true });
            else navigate('/waiter', { replace: true });
          }
        } else {
          // Logged in but no profile - redirect to waiter as fallback
          navigate('/waiter', { replace: true });
        }
        } catch (firestoreErr: any) {
        console.warn('Firestore role check failed:', firestoreErr);
        // If Firestore fails, still login but go to default station
        navigate('/waiter', { replace: true });
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      
      const errorMessage = err.message || '';
      const errorCode = err.code || '';
      
      if (errorMessage.includes('Firebase keys are missing')) {
        setError(err.message);
      } else if (errorMessage.includes('Cloud Firestore API has not been used') || errorMessage.includes('firestore.googleapis.com')) {
        setError('Firestore API is disabled. Ensure it is ENABLED in Google Cloud Console.');
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (errorCode === 'auth/unauthorized-domain') {
        setError('Domain not authorized! Add your GitHub Pages URL to "Authorized Domains" in Firebase Authentication settings.');
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection or Firebase configuration.');
      } else {
        // Show the actual raw error to help debugging
        setError(`Login failed: ${errorMessage || errorCode || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-zinc-950 to-zinc-950">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-orange-500 rounded-3xl shadow-2xl shadow-orange-500/20">
            <ChefHat size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">LAJJATDAR</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Management Portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black text-white">Sign In</h3>
            <p className="text-sm text-zinc-500 font-medium">Restricted access for authorized personnel</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-orange-500 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-orange-500 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                ENTER STATION
              </>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
          Secure connection • Encrypted access
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
