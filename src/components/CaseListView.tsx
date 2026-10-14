import React from 'react';
import { User, MedicalCase, CaseStatus, PaginationMeta } from '../types/index.ts';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';

interface CaseListViewProps {
  user: User;
  cases: MedicalCase[];
  pagination: PaginationMeta;
  loading: boolean;
  search: string;
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onSortChange: (column: string) => void;
  onPageChange: (page: number) => void;
  onSelectCase: (caseId: number) => void;
  onEditCase: (caseId: number) => void;
  onDeleteCase: (caseItem: MedicalCase) => void;
  onCreateCase: () => void;
  onClearFilters: () => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  user,
  cases,
  pagination,
  loading,
  search,
  statusFilter,
  priorityFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onPageChange,
  onSelectCase,
  onEditCase,
  onDeleteCase,
  onCreateCase,
  onClearFilters,
}) => {
  const statuses = ['All', 'Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'Completed':
        return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
      case 'In Review':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'Planning':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'Draft':
        return 'text-slate-600 bg-slate-100 border border-slate-200';
      case 'Cancelled':
        return 'text-rose-700 bg-rose-50 border border-rose-200';
      default:
        return 'text-slate-600 bg-slate-100 border border-slate-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-rose-600 font-semibold';
      case 'Medium':
        return 'text-amber-600 font-medium';
      default:
        return 'text-slate-500';
    }
  };

  const canEdit = user.role === 'admin' || user.role === 'engineer';
  const canDelete = user.role === 'admin';
  const hasActiveFilters = search || statusFilter !== 'All' || priorityFilter !== 'All';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Implant Case Registry
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
              {pagination.total} cases
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter, and track surgical cases with role-enforced permissions
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onCreateCase}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Case</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search by Case Number or Surgeon Name */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Case Number or Surgeon Name..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option disabled>Filter by Status</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>

            {/* Bonus: Filter by Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option disabled>Filter by Priority</option>
              {priorities.map((pr) => (
                <option key={pr} value={pr}>
                  {pr === 'All' ? 'All Priorities' : `${pr} Priority`}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick status tab strip */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase mr-2 shrink-0">
            Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th
                  scope="col"
                  onClick={() => onSortChange('case_number')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Case #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => onSortChange('patient_reference')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Patient Ref</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => onSortChange('surgeon_name')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Surgeon</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => onSortChange('implant_type')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Implant Type</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => onSortChange('status')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => onSortChange('priority')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => onSortChange('surgery_date')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Surgery Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded-sm w-full"></div>
                    </td>
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No medical cases found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search filters or create a new implant case.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={onClearFilters}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td
                      onClick={() => onSelectCase(c.id)}
                      className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600 cursor-pointer"
                    >
                      {c.case_number}
                    </td>
                    <td
                      onClick={() => onSelectCase(c.id)}
                      className="px-5 py-3.5 font-mono text-xs text-slate-700 cursor-pointer"
                    >
                      {c.patient_reference}
                    </td>
                    <td
                      onClick={() => onSelectCase(c.id)}
                      className="px-5 py-3.5 font-medium text-slate-900 cursor-pointer"
                    >
                      {c.surgeon_name}
                    </td>
                    <td
                      onClick={() => onSelectCase(c.id)}
                      className="px-5 py-3.5 text-slate-600 text-xs max-w-xs truncate cursor-pointer"
                      title={c.implant_type}
                    >
                      {c.implant_type}
                    </td>
                    <td onClick={() => onSelectCase(c.id)} className="px-5 py-3.5 cursor-pointer">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td
                      onClick={() => onSelectCase(c.id)}
                      className="px-5 py-3.5 text-xs cursor-pointer"
                    >
                      <span className={getPriorityStyle(c.priority)}>{c.priority}</span>
                    </td>
                    <td
                      onClick={() => onSelectCase(c.id)}
                      className="px-5 py-3.5 text-xs text-slate-500 font-mono cursor-pointer"
                    >
                      {c.surgery_date || <span className="text-slate-300">Unscheduled</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Button - visible to all authenticated roles */}
                        <button
                          onClick={() => onSelectCase(c.id)}
                          title="View case details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View</span>
                        </button>

                        {/* Edit Button - shown only to roles allowed (Admin, Engineer) */}
                        {canEdit && (
                          <button
                            onClick={() => onEditCase(c.id)}
                            title="Edit case"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </button>
                        )}

                        {/* Delete Button - shown ONLY to Admin */}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteCase(c)}
                            title="Delete case (Admin only)"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (10 per page default) */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div className="tabular-nums">
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.per_page + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(pagination.page * pagination.per_page, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{pagination.total}</span> cases
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous Page</span>
            </button>

            <span className="px-3 py-1 font-mono font-medium text-slate-800">
              Page {pagination.page} of {pagination.total_pages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages || loading}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
