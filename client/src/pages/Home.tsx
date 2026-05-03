import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Target, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 animate-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium">The #1 Medical Question Bank</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-100">
            Master Medical Exams <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">With Confidence</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            Access thousands of high-yield questions, detailed explanations, and advanced performance analytics designed for medical students and professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            {user ? (
              <Link 
                to="/dashboard" 
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/25"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/25"
                >
                  Start for Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 rounded-xl bg-card text-foreground border border-border hover:border-primary/50 font-semibold text-lg hover:bg-secondary/20 transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Our platform is built to optimize your study time and maximize retention.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Brain className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">High-Yield Questions</h3>
              <p className="text-muted-foreground">Expertly crafted questions that mirror the difficulty and format of real medical board exams.</p>
            </div>
            
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-secondary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/5 group">
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <TrendingUp className="w-7 h-7 text-secondary group-hover:text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">Identify your weak areas with detailed performance charts and subject-wise accuracy tracking.</p>
            </div>
            
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 group">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <Target className="w-7 h-7 text-accent group-hover:text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exam Simulation</h3>
              <p className="text-muted-foreground">Practice in a timed, anti-cheat environment that perfectly simulates test day conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the plan that fits your study needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card p-8 rounded-3xl border border-border flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Basic Plan</h3>
              <p className="text-muted-foreground mb-6">Perfect for getting started.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold">$0</span>
                <span className="text-muted-foreground"> / forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Access to 50 sample questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Basic performance tracking</span>
                </li>
              </ul>
              {user ? (
                <Link to="/dashboard" className="w-full py-3 text-center rounded-xl border border-border hover:bg-secondary/20 font-medium transition-colors">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="w-full py-3 text-center rounded-xl border border-border hover:bg-secondary/20 font-medium transition-colors">
                  Sign Up Free
                </Link>
              )}
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-primary/10 to-transparent p-8 rounded-3xl border border-primary relative flex flex-col shadow-2xl shadow-primary/10 scale-100 md:scale-105">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
              <p className="text-muted-foreground mb-6">Unlock your full potential.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold">$19.99</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">Unlimited access to all questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Detailed explanations & references</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Advanced charting & analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Timed exam simulations</span>
                </li>
              </ul>
              {user ? (
                <Link to="/dashboard" className="w-full py-3 text-center rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  Upgrade Now
                </Link>
              ) : (
                <Link to="/register" className="w-full py-3 text-center rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  Get Premium
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Brain className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">MedPrep</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} MedPrep. All rights reserved. Built for medical excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
