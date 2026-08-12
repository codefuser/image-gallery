import React, { useState } from 'react';
import { Grid, KeyRound, Mail, User as UserIcon, X, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { INITIAL_USER } from '../services/sampleData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      setSuccessMsg('Reset password instructions sent to local browser session.');
      return;
    }

    if (mode === 'login') {
      if (!emailOrUsername.trim()) {
        setErrorMsg('Please enter your email or username');
        return;
      }
      const user = await authService.login(emailOrUsername);
      onAuthSuccess(user);
      onClose();
    } else {
      if (!emailOrUsername.trim() || !displayName.trim()) {
        setErrorMsg('Please complete all required fields');
        return;
      }
      const user = await authService.register(
        emailOrUsername.toLowerCase(),
        emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@pinscape.local`,
        displayName
      );
      onAuthSuccess(user);
      onClose();
    }
  };

  const handleDemoLogin = async () => {
    const user = await authService.login(INITIAL_USER.username);
    onAuthSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Grid className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {mode === 'login' && 'Welcome to Pinscape'}
            {mode === 'register' && 'Create Pinscape Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Local browser-first image discovery platform
          </p>
        </div>

        {/* Quick Demo Login Option */}
        <button
          onClick={handleDemoLogin}
          className="w-full mb-5 py-3 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Quick Sign In as Demo Creator (Alex Morgan)
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 text-xs rounded-xl mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-600 text-xs rounded-xl mb-4 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full / Display Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="alex.morgan@pinscape.local"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white rounded-full font-bold text-sm shadow-md transition-all cursor-pointer mt-2"
          >
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Request'}
          </button>
        </form>

        {/* Footer switch tabs */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
