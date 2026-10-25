import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-electric-purple to-electric-cyan p-0.5 shadow-glow">
          <div className="w-full h-full bg-primary-bg rounded-[22px] flex items-center justify-center">
            <Compass className="w-10 h-10 text-electric-cyan animate-spin-slow" />
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <span className="text-4xl sm:text-6xl font-black text-electric-purple">404</span>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-xs text-content-secondary leading-relaxed">
            The pathway you navigated to does not exist or has been relocated within the ELEYSORA ecosystem.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </main>

      <Footer />
    </div>
  );
};
