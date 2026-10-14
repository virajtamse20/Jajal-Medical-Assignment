import React, { useState, useEffect } from 'react';
import { MedicalCase, CaseStatus, CasePriority, User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ArrowLeft, Save, AlertCircle, Calendar, Sparkles } from 'lucide-react';

interface CaseFormViewProps {
  user: User;
  caseItem?: MedicalCase | null; // null for create mode, non-null for edit
  onCancel: () => void;
  onSuccess: (savedCase: MedicalCase) => void;
}

export const CaseFormView: React.FC<CaseFormViewProps> = ({
  user,
  caseItem,
  onCancel,
  onSuccess,
}) => {
  const isEditing = !!caseItem;

  const [caseNumber, setCaseNumber] = useState(caseItem?.case_number || '');
  const [patientReference, setPatientReference] = useState(caseItem?.patient_reference || '');
  const [surgeonName, setSurgeonName] = useState(caseItem?.surgeon_name || '');
  const [implantType, setImplantType] = useState(caseItem?.implant_type || '');
  const [status, setStatus] = useState<CaseStatus>(caseItem?.status || 'Draft');
  const [priority, setPriority] = useState<CasePriority>(caseItem?.priority || 'Medium');
  const [surgeryDate, setSurgeryDate] = useState(caseItem?.surgery_date || '');

  // Validation errors map (field -> string[])
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Bonus: Holiday check state
  const [checkingHoliday, setCheckingHoliday] = useState(false);
  const [holidayNotice, setHolidayNotice] = useState<string | null>(null);

  // Suggested implant types for rapid clinical data entry
  const sampleImplants = [
    'Titanium Cranial Reconstruction Mesh',
    'PEEK Lumbar Interbody Fusion Cage L4-L5',
    'Ceramic-on-Ceramic Total Hip Acetabular Cup',
    'Cobalt-Chrome Bicondylar Knee Femoral Component',
    'Trabecular Porous Glenoid Shoulder Anchor',
    'Custom Mandibular Subperiosteal Reconstruction Plate',
    'Custom PEEK Orbital Floor Implant',
  ];

  // Auto-generate next case number for creation convenience if blank
  useEffect(() => {
    if (!isEditing && !caseNumber) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setCaseNumber(`CASE-${randomSuffix}`);
    }
  }, [isEditing]);

  // Check holiday whenever surgery date changes
  useEffect(() => {
    if (!surgeryDate || !/^\d{4}-\d{2}-\d{2}$/.test(surgeryDate)) {
      setHolidayNotice(null);
      return;
    }

    let active = true;
    setCheckingHoliday(true);

    api.checkHoliday(surgeryDate, 'US').then((res) => {
      if (!active) return;
      setCheckingHoliday(false);
      if (res.success && res.data?.isHoliday) {
        setHolidayNotice(
          `Public Holiday Notice: ${res.data.holiday?.name || 'Federal Holiday'} coincides with this date.`
        );
      } else {
        setHolidayNotice(null);
      }
    });

    return () => {
      active = false;
    };
  }, [surgeryDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setLoading(true);

    const payload = {
      case_number: caseNumber.trim(),
      patient_reference: patientReference.trim(),
      surgeon_name: surgeonName.trim(),
      implant_type: implantType.trim(),
      status,
      priority,
      surgery_date: surgeryDate ? surgeryDate : null,
    };

    try {
      let response;
      if (isEditing && caseItem) {
        response = await api.updateCase(caseItem.id, payload);
      } else {
        response = await api.createCase(payload);
      }

      if (response.success && response.data) {
        onSuccess(response.data);
      } else {
        if (response.errors) {
          setErrors(response.errors);
        }
        setGeneralError(response.message || 'Validation error occurred.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Network request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Registry</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEditing ? `Edit Case: ${caseItem?.case_number}` : 'Create New Implant Case'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEditing
              ? 'Update surgical implant parameters and scheduling details'
              : 'Register a new patient-matched surgical device case'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-400">
          <div>Author: <span className="font-semibold text-slate-700">{user.name}</span></div>
          <div className="capitalize">Role: {user.role}</div>
        </div>
      </div>

      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to Save Case</p>
            <p className="text-xs text-rose-700 mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Case Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Case Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g. CASE-0001"
              className={`w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                errors.case_number ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.case_number ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.case_number[0]}</p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">Unique identifier, format CASE-XXXX</p>
            )}
          </div>

          {/* Patient Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Reference <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={patientReference}
              onChange={(e) => setPatientReference(e.target.value)}
              placeholder="e.g. PAT-9482 (dummy code)"
              className={`w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                errors.patient_reference ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.patient_reference ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.patient_reference[0]}</p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">De-identified patient code, not a real name</p>
            )}
          </div>

          {/* Surgeon Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Surgeon Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={surgeonName}
              onChange={(e) => setSurgeonName(e.target.value)}
              placeholder="e.g. Dr. Eleanor Vance"
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                errors.surgeon_name ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.surgeon_name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.surgeon_name[0]}</p>
            )}
          </div>

          {/* Surgery Date (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Surgery Date <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                  errors.surgery_date ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.surgery_date ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.surgery_date[0]}</p>
            ) : checkingHoliday ? (
              <p className="mt-1 text-[11px] text-blue-600">Checking Nager.Date holiday API...</p>
            ) : holidayNotice ? (
              <p className="mt-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-md border border-amber-200 font-medium">
                {holidayNotice}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">YYYY-MM-DD or leave blank if pending</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CaseStatus)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            >
              <option value="Draft">Draft</option>
              <option value="Planning">Planning</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.status[0]}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as CasePriority)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.priority[0]}</p>
            )}
          </div>
        </div>

        {/* Implant Type (Full Width) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Implant Type & Specification <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={implantType}
            onChange={(e) => setImplantType(e.target.value)}
            placeholder="e.g. Titanium Cranial Reconstruction Mesh"
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
              errors.implant_type ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.implant_type && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.implant_type[0]}</p>
          )}

          {/* Quick preset selector */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 self-center mr-1">Suggested:</span>
            {sampleImplants.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setImplantType(item)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Case...' : isEditing ? 'Save Changes' : 'Create Case'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
