import React from 'react';
import { User } from '../types/index.ts';
import { ShieldCheck, UserCheck, Wrench, LogOut, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onOpenTests: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onLogout,
  onOpenTests,
  onOpenDocs,
}) => {
  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'engineer':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  const roleLabel =
    user.role === 'admin'
      ? 'Administrator'
      : user.role === 'engineer'
      ? 'Biomedical Engineer'
      : 'Medical Viewer';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-left group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
            >
              <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg tracking-tight shadow-sm">
                J
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                  Jajal Medical
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                  Implant Case Portal
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentView === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('cases')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentView === 'cases' || currentView === 'case-details'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : ''
              }`}
            >
              Case Registry
            </button>
            {(user.role === 'admin' || user.role === 'engineer') && (
              <button
                onClick={() => onNavigate('create')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  currentView === 'create'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : ''
                }`}
              >
                Create Case
              </button>
            )}
            <button
              onClick={onOpenTests}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 text-slate-600"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automated Tests</span>
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 text-slate-600"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Docs & Traceability</span>
            </button>
          </nav>

          {/* Zone 3: User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 flex items-center justify-end gap-1.5">
                {getRoleIcon()}
                <span>{user.name}</span>
              </div>
              <div className="text-[11px] text-slate-500">{roleLabel}</div>
            </div>

            <button
              onClick={onLogout}
              title="Log out of session"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
