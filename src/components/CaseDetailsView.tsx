import React, { useState } from 'react';
import { MedicalCase, User, CaseStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  User as UserIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface CaseDetailsViewProps {
  user: User;
  caseItem: MedicalCase;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusUpdated: (updatedCase: MedicalCase) => void;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({
  user,
  caseItem,
  onBack,
  onEdit,
  onDelete,
  onStatusUpdated,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const canEdit = user.role === 'admin' || user.role === 'engineer';
  const canDelete = user.role === 'admin';

  const statusWorkflow: CaseStatus[] = [
    'Draft',
    'Planning',
    'In Review',
    'Approved',
    'Completed',
  ];

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!canEdit) return;
    setUpdatingStatus(true);
    setStatusError(null);

    try {
      const response = await api.updateCase(caseItem.id, {
        case_number: caseItem.case_number,
        patient_reference: caseItem.patient_reference,
        surgeon_name: caseItem.surgeon_name,
        implant_type: caseItem.implant_type,
        status: newStatus,
        priority: caseItem.priority,
        surgery_date: caseItem.surgery_date,
      });

      if (response.success && response.data) {
        onStatusUpdated(response.data);
      } else {
        setStatusError(response.message || 'Failed to update status.');
      }
    } catch (err: any) {
      setStatusError(err.message || 'Error communicating with server.');
    } finally {
      setUpdatingStatus(false);
    }
  };

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
        return 'text-slate-600 bg-slate-100';
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Not recorded';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Registry</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {caseItem.case_number}
            </h1>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusBadge(
                caseItem.status
              )}`}
            >
              {caseItem.status}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {canEdit && (
            <button
              onClick={onEdit}
              className="py-2 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Case</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={onDelete}
              className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Case</span>
            </button>
          )}
        </div>
      </div>

      {statusError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Status Update Blocked</p>
            <p className="text-xs text-rose-700 mt-0.5">{statusError}</p>
          </div>
        </div>
      )}

      {/* Status Lifecycle Stepper */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Clinical Workflow Progression
          </span>
          {canEdit && (
            <span className="text-[11px] text-slate-400">
              Click any stage to advance or rewind status
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {statusWorkflow.map((st, index) => {
            const isCurrent = caseItem.status === st;
            const currentIndex = statusWorkflow.indexOf(caseItem.status);
            const isCompletedBefore = currentIndex > index && caseItem.status !== 'Cancelled';

            return (
              <button
                key={st}
                disabled={!canEdit || updatingStatus}
                onClick={() => handleStatusChange(st)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/70 font-semibold'
                    : isCompletedBefore
                    ? 'border-emerald-200 bg-emerald-50/40 text-slate-700'
                    : 'border-slate-200 bg-slate-50/50 text-slate-500'
                } ${canEdit ? 'hover:border-blue-300 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">Step 0{index + 1}</span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  {isCompletedBefore && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-xs font-medium truncate">{st}</div>
              </button>
            );
          })}
        </div>

        {caseItem.status === 'Cancelled' && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>This case was marked as Cancelled.</span>
            {canEdit && (
              <button
                onClick={() => handleStatusChange('Planning')}
                className="ml-auto underline font-semibold text-rose-900"
              >
                Reopen to Planning
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detailed Field Cards (All fields stored according to Section 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Case Information (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Implant Specifications</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Implant Type
              </span>
              <p className="text-sm font-semibold text-slate-900">{caseItem.implant_type}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Surgeon Name
              </span>
              <p className="text-sm font-semibold text-slate-900">{caseItem.surgeon_name}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Patient Reference
              </span>
              <p className="text-sm font-mono font-semibold text-slate-900">
                {caseItem.patient_reference}
              </p>
              <span className="text-[11px] text-slate-400">De-identified clinical dummy code</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Priority Level
              </span>
              <p className="text-sm font-semibold">
                <span
                  className={
                    caseItem.priority === 'High'
                      ? 'text-rose-600'
                      : caseItem.priority === 'Medium'
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }
                >
                  {caseItem.priority} Priority
                </span>
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Surgery Schedule
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-mono font-medium text-slate-900">
                  {caseItem.surgery_date || 'No scheduled date set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Traceability Card (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit & Ownership</span>
          </h2>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Case Record ID
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              #{caseItem.id}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Created By
            </span>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">
                  {caseItem.creator?.name || `User #${caseItem.created_by}`}
                </div>
                <div className="text-slate-500">{caseItem.creator?.email || 'System'}</div>
                <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                  Role: {caseItem.creator?.role || 'authorized user'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Created At
              </span>
              <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatDate(caseItem.created_at)}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Last Updated
              </span>
              <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatDate(caseItem.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
