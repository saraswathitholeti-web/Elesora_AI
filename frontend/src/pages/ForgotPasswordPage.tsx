import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border-primary-border/50 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Reset Password</h2>
            <p className="text-xs text-content-secondary">
              Enter your email address and we will generate instructions to recover your account.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-status-success/15 border border-status-success/30 text-xs text-content-primary space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-status-success mx-auto" />
              <p className="font-semibold text-white">Password Recovery Initiated</p>
              <p className="text-content-secondary">
                If an account exists for <strong>{email}</strong>, a recovery link will be dispatched shortly.
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 text-electric-cyan font-bold hover:underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Your Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all"
              >
                Send Password Reset Link
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-content-muted hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
