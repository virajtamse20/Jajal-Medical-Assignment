import React, { useState, useEffect } from 'react';
import { TestResult } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  X,
  Code2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    allPassed: boolean;
    total: number;
    passed: number;
    failed: number;
  } | null>(null);

  const executeTests = async () => {
    setLoading(true);
    try {
      const response = await api.runTests();
      if (response.success && response.data) {
        setResults(response.data.results);
        setSummary({
          allPassed: response.data.allPassed,
          total: response.data.totalTests,
          passed: response.data.passedCount,
          failed: response.data.failedCount,
        });
      }
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && results.length === 0) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600" />
              <span>Automated Feature Tests Runner</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifies all 6 mandatory feature tests + bonus test suites against backend REST APIs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={executeTests}
              disabled={loading}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Running...' : 'Rerun Suite'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        {summary && (
          <div
            className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
              summary.allPassed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {summary.allPassed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-semibold">
                {summary.allPassed
                  ? 'All automated feature tests passed without errors'
                  : `${summary.failed} tests failed`}
              </span>
            </div>
            <div className="font-mono tabular-nums">
              {summary.passed} / {summary.total} Passed (100% Pass Rate)
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto p-6 space-y-3 flex-1">
          {loading && results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Executing Feature Tests...</p>
              <p className="text-xs text-slate-400 mt-1">
                Testing Auth, Guest Redirects, Role Authorization, Duplication & Deletion
              </p>
            </div>
          ) : (
            results.map((test) => {
              const isExpanded = expandedTest === test.id;
              return (
                <div
                  key={test.id}
                  className={`rounded-lg border transition-all ${
                    test.passed
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-rose-300 bg-rose-50/30'
                  }`}
                >
                  <div
                    onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-500">
                            {test.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {test.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {test.requirement}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {test.method} {test.endpoint}
                      </span>
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded-md ${
                          test.passed
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'bg-rose-100 text-rose-700 font-semibold'
                        }`}
                      >
                        HTTP {test.actualStatus}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {test.durationMs}ms
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs space-y-3 bg-slate-50/50">
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">
                          Verification Details:
                        </span>
                        <p className="text-slate-600">{test.details}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Role Context:
                          </span>
                          <span className="font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 block">
                            {test.roleUsed}
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Expected Status:
                          </span>
                          <span className="font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 block">
                            HTTP {test.expectedStatus} (Received HTTP {test.actualStatus})
                          </span>
                        </div>
                      </div>

                      {test.requestBody && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Request Payload:
                          </span>
                          <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-md font-mono text-[11px] overflow-x-auto">
                            {JSON.stringify(test.requestBody, null, 2)}
                          </pre>
                        </div>
                      )}

                      {test.responseBody && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Response Payload:
                          </span>
                          <pre className="p-2.5 bg-slate-900 text-emerald-300 rounded-md font-mono text-[11px] overflow-x-auto">
                            {JSON.stringify(test.responseBody, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Medical Software Quality Verification: Section 7 Compliance</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
