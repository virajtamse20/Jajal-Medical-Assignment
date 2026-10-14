import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';
import { ShieldCheck, UserCheck, Wrench, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@jajalmedical.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await api.login(email, password);
      if (response.success && response.data?.user) {
        onLoginSuccess(response.data.user);
      } else {
        setErrorMessage(response.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm">
            J
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Jajal Medical Case Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Surgical implant case management from draft to completion
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-xl shadow-xs">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 tracking-wider uppercase mb-1.5"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@jajalmedical.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 tracking-wider uppercase mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Switcher for Assignment Reviewers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Reviewer Test Accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@jajalmedical.com', '123456')}
                className="p-2.5 text-left border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Admin</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">Full CRUD & Delete</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('viewer@jajalmedical.com', 'viewer123')}
                className="p-2.5 text-left border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Viewer</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">Read-Only Access</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('engineer@jajalmedical.com', 'engineer123')}
                className="p-2.5 text-left border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Engineer</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">Create & Edit (Bonus)</div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Medical Device Case Management Specification &copy; 2026 Jajal Medical
        </p>
      </div>
    </div>
  );
};
