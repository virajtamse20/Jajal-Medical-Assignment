import React, { useState } from 'react';
import { MedicalCase } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  caseItem: MedicalCase;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (deletedCaseId: number) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.deleteCase(caseItem.id);
      if (response.success) {
        onDeleted(caseItem.id);
        onClose();
      } else {
        setError(response.message || 'Server rejected deletion request.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Confirm Implant Case Deletion
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to permanently delete case{' '}
            <span className="font-mono font-semibold text-slate-900">{caseItem.case_number}</span>?
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 font-mono">
          <div>Patient: {caseItem.patient_reference}</div>
          <div>Surgeon: {caseItem.surgeon_name}</div>
          <div>Implant: {caseItem.implant_type}</div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : 'Delete Case'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
