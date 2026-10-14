import React, { useState, useEffect, useCallback } from 'react';
import { User, MedicalCase, PaginationMeta } from './types/index.ts';
import { api, authStorage } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginView } from './components/LoginView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { CaseListView } from './components/CaseListView.tsx';
import { CaseFormView } from './components/CaseFormView.tsx';
import { CaseDetailsView } from './components/CaseDetailsView.tsx';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal.tsx';
import { TestSuiteModal } from './components/TestSuiteModal.tsx';
import { DocumentationModal } from './components/DocumentationModal.tsx';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'cases' | 'create' | 'edit' | 'case-details'
  >('dashboard');

  // Case data & list state
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [counts, setCounts] = useState({
    total: 25,
    draft: 3,
    planning: 6,
    in_review: 5,
    approved: 6,
    completed: 4,
    cancelled: 1,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 25,
    page: 1,
    per_page: 10,
    total_pages: 3,
  });

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Active / Selected cases
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<MedicalCase | null>(null);

  // Modals & Notifications
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Fetch Cases from Backend API
  const fetchCases = useCallback(async () => {
    if (!authStorage.getToken()) return;
    setLoading(true);

    try {
      const response = await api.getCases({
        page,
        per_page: 10,
        search,
        status: statusFilter,
        priority: priorityFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (response.success && response.data) {
        setCases(response.data.cases);
        setPagination(response.data.pagination);
        setCounts(response.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Load cases when user or filters change
  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user, fetchCases]);

  // Load single case details when selectedCaseId changes
  useEffect(() => {
    if (selectedCaseId && user) {
      api.getCase(selectedCaseId).then((res) => {
        if (res.success && res.data) {
          setSelectedCase(res.data);
        }
      });
    }
  }, [selectedCaseId, user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${loggedInUser.name}`);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setCurrentView('dashboard');
    setSelectedCaseId(null);
    setSelectedCase(null);
  };

  const handleResetData = async () => {
    const res = await api.resetData();
    if (res.success) {
      showToast('Database reset to initial 25 dummy medical cases');
      fetchCases();
    }
  };

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  // If not logged in, show Login view (Specification Section 4.1: "All case pages must be hidden from users who are not logged in")
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'cases') {
            handleClearFilters();
          }
          setCurrentView(view as any);
        }}
        onLogout={handleLogout}
        onOpenTests={() => setTestModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <DashboardView
            user={user}
            counts={counts}
            recentCases={cases}
            onNavigate={(view, filterStatus) => {
              if (filterStatus) {
                setStatusFilter(filterStatus);
                setPage(1);
              }
              setCurrentView(view as any);
            }}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setCurrentView('case-details');
            }}
          />
        )}

        {currentView === 'cases' && (
          <CaseListView
            user={user}
            cases={cases}
            pagination={pagination}
            loading={loading}
            search={search}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearchChange={(s) => {
              setSearch(s);
              setPage(1);
            }}
            onStatusChange={(st) => {
              setStatusFilter(st);
              setPage(1);
            }}
            onPriorityChange={(pr) => {
              setPriorityFilter(pr);
              setPage(1);
            }}
            onSortChange={handleSortChange}
            onPageChange={(p) => setPage(p)}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setCurrentView('case-details');
            }}
            onEditCase={(id) => {
              setSelectedCaseId(id);
              const found = cases.find((c) => c.id === id);
              setSelectedCase(found || null);
              setCurrentView('edit');
            }}
            onDeleteCase={(c) => setCaseToDelete(c)}
            onCreateCase={() => setCurrentView('create')}
            onClearFilters={handleClearFilters}
          />
        )}

        {currentView === 'create' && (
          <CaseFormView
            user={user}
            caseItem={null}
            onCancel={() => setCurrentView('cases')}
            onSuccess={(saved) => {
              showToast(`Case ${saved.case_number} created successfully`);
              fetchCases();
              setSelectedCaseId(saved.id);
              setSelectedCase(saved);
              setCurrentView('case-details');
            }}
          />
        )}

        {currentView === 'edit' && selectedCase && (
          <CaseFormView
            user={user}
            caseItem={selectedCase}
            onCancel={() => setCurrentView('case-details')}
            onSuccess={(saved) => {
              showToast(`Case ${saved.case_number} updated successfully`);
              fetchCases();
              setSelectedCase(saved);
              setCurrentView('case-details');
            }}
          />
        )}

        {currentView === 'case-details' && selectedCase && (
          <CaseDetailsView
            user={user}
            caseItem={selectedCase}
            onBack={() => setCurrentView('cases')}
            onEdit={() => setCurrentView('edit')}
            onDelete={() => setCaseToDelete(selectedCase)}
            onStatusUpdated={(updated) => {
              setSelectedCase(updated);
              fetchCases();
              showToast(`Status updated to ${updated.status}`);
            }}
          />
        )}
      </main>

      {/* Bottom Footer bar */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Jajal Medical</span>
            <span aria-hidden="true">·</span>
            <span>Software Developer Practical Assignment</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Oct 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTestModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Run Automated Tests
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setDocsModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Traceability & Docs
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              title="Reset sample data"
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Seed</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <DeleteConfirmationModal
          caseItem={caseToDelete}
          isOpen={!!caseToDelete}
          onClose={() => setCaseToDelete(null)}
          onDeleted={(deletedId) => {
            showToast('Case deleted successfully');
            setCaseToDelete(null);
            fetchCases();
            if (selectedCaseId === deletedId) {
              setSelectedCaseId(null);
              setSelectedCase(null);
              setCurrentView('cases');
            }
          }}
        />
      )}

      {/* Automated Tests Modal */}
      <TestSuiteModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />

      {/* Documentation & Traceability Modal */}
      <DocumentationModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />
    </div>
  );
}
