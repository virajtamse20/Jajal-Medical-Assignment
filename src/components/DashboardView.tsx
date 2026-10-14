import React from 'react';
import { User, MedicalCase, CaseStatus } from '../types/index.ts';
import {
  FolderKanban,
  Clock,
  Eye,
  CheckCircle,
  CheckCheck,
  Plus,
  ArrowRight,
  Shield,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  counts: {
    total: number;
    draft: number;
    planning: number;
    in_review: number;
    approved: number;
    completed: number;
    cancelled: number;
  };
  recentCases: MedicalCase[];
  onNavigate: (view: string, filterStatus?: string) => void;
  onSelectCase: (caseId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  counts,
  recentCases,
  onNavigate,
  onSelectCase,
}) => {
  const metricCards = [
    {
      title: 'Total Cases',
      value: counts.total,
      filter: 'All',
      icon: <FolderKanban className="w-5 h-5 text-slate-700" />,
      bg: 'bg-white',
      border: 'border-slate-200',
      description: 'Active registry implants',
    },
    {
      title: 'Planning',
      value: counts.planning,
      filter: 'Planning',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-white',
      border: 'border-amber-200',
      description: 'Design & pre-op planning',
    },
    {
      title: 'In Review',
      value: counts.in_review,
      filter: 'In Review',
      icon: <Eye className="w-5 h-5 text-blue-600" />,
      bg: 'bg-white',
      border: 'border-blue-200',
      description: 'Surgeon clinical review',
    },
    {
      title: 'Approved',
      value: counts.approved,
      filter: 'Approved',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-white',
      border: 'border-emerald-200',
      description: 'Cleared for surgical manufacture',
    },
    {
      title: 'Completed',
      value: counts.completed,
      filter: 'Completed',
      icon: <CheckCheck className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-white',
      border: 'border-indigo-200',
      description: 'Implanted & closed cases',
    },
  ];

  const getStatusColor = (status: CaseStatus) => {
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
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-rose-600 font-semibold';
      case 'Medium':
        return 'text-amber-600 font-medium';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Implant Case Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time status tracking for custom surgical implants and prosthetics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user.role === 'admin' || user.role === 'engineer') && (
            <button
              onClick={() => onNavigate('create')}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('cases')}
            className="py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards (Section 4.2 of assignment specification) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((card) => (
          <button
            key={card.title}
            onClick={() => onNavigate('cases', card.filter)}
            className={`p-5 rounded-xl border ${card.border} ${card.bg} text-left transition-all hover:shadow-xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">{card.description}</p>
          </button>
        ))}
      </div>

      {/* Secondary Status Strip (Draft & Cancelled) */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-white p-3.5 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-700">Secondary Statuses:</span>
        <button
          onClick={() => onNavigate('cases', 'Draft')}
          className="hover:text-blue-600 transition-colors"
        >
          Draft: <span className="font-mono font-semibold text-slate-800">{counts.draft}</span>
        </button>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <button
          onClick={() => onNavigate('cases', 'Cancelled')}
          className="hover:text-rose-600 transition-colors"
        >
          Cancelled: <span className="font-mono font-semibold text-slate-800">{counts.cancelled}</span>
        </button>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="text-slate-400">
          User Role: <span className="font-semibold text-slate-700 capitalize">{user.role}</span>
        </span>
      </div>

      {/* Recent Cases Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Cases</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest surgical implant cases registered in the system
            </p>
          </div>
          <button
            onClick={() => onNavigate('cases')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>See full registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Case Number</th>
                <th scope="col" className="px-6 py-3">Patient Code</th>
                <th scope="col" className="px-6 py-3">Surgeon</th>
                <th scope="col" className="px-6 py-3">Implant Type</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Priority</th>
                <th scope="col" className="px-6 py-3">Surgery Date</th>
                <th scope="col" className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentCases.slice(0, 6).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3.5 font-mono text-xs font-semibold text-blue-600">
                    {c.case_number}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-700">
                    {c.patient_reference}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    {c.surgeon_name}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 text-xs max-w-xs truncate" title={c.implant_type}>
                    {c.implant_type}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs">
                    <span className={getPriorityColor(c.priority)}>{c.priority}</span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">
                    {c.surgery_date || <span className="text-slate-300">Unscheduled</span>}
                  </td>
                  <td className="px-6 py-3.5 text-right text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                    View &rarr;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
