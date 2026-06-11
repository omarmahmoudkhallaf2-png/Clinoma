import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithGoogleCredential } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Initialize Google One Tap for instant premium login (iOS/Android/Web friendly)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const initGoogleOneTap = () => {
      const google = (window as any).google;
      if (!google) return;
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
        console.warn("VITE_GOOGLE_CLIENT_ID is not configured. Google One Tap is disabled.");
        return;
      }
      
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setIsLoading(true);
            setError(null);
            try {
              await signInWithGoogleCredential(response.credential);
            } catch (err) {
              console.error("One Tap login error:", err);
              setError("Failed to sign in with Google One Tap. Please try the button below.");
            } finally {
              setIsLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Trigger Google One Tap UI
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.log("One Tap skipped:", notification.getSkippedReason());
          }
        });
      } catch (e) {
        console.error("Error initializing Google One Tap:", e);
      }
    };

    if ((window as any).google) {
      initGoogleOneTap();
    } else {
      interval = setInterval(() => {
        if ((window as any).google) {
          clearInterval(interval);
          initGoogleOneTap();
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [signInWithGoogleCredential]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // navigate handled by useEffect above after user state updates
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-10 text-center animate-in fade-in zoom-in-95 duration-500">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="group-hover:scale-110 transition-transform duration-500">
              <img src="/favicon.png" alt="Clinoma Logo" className="w-16 h-16 object-contain" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">CLINOMA</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-10">Sign in to access your personalized question bank</p>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-background border-2 border-border hover:border-primary/50 hover:bg-secondary/10 text-foreground font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="mt-8 text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}