import React, { useState } from 'react';
import { FileText, Database, ShieldCheck, Cloud, Download, X } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'traceability' | 'database' | 'deployment' | 'readme'>('traceability');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Project Documentation & Medical Traceability</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Software Developer Practical Assignment documentation specifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/zip"
              download="jajal-medical-case-management.zip"
              className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download ZIP</span>
            </a>
            <a
              href="/api/export/bundle"
              download="jajal-medical-case-management.bundle"
              className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Git Bundle</span>
            </a>
            <a
              href="/api/export/postman"
              download="jajal_medical_api.postman_collection.json"
              className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Postman</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-200 flex gap-4 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('traceability')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'traceability'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Traceability Matrix (docs/traceability.md)</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'database'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Schema (docs/database.md)</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'deployment'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>AWS Deployment (docs/deployment.md)</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'readme'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>README & API Spec</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 flex-1 text-sm text-slate-700 space-y-6">
          {activeTab === 'traceability' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Medical Software Traceability Matrix (IEC 62304 / FDA Guidance)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  In medical device and surgical implant software, every requirement must link directly
                  to its implementation code and verification feature test.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Requirement (Input)</th>
                      <th className="px-4 py-3">Implementation (Output)</th>
                      <th className="px-4 py-3">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">REQ-001</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        Admin shall be able to create a case
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        CaseController@store + CaseFormView
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">
                        Feature test: admin creates case (201)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">REQ-002</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        Case Number shall be unique
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        Unique DB index + Form Request rule
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">
                        Feature test: duplicate rejected (422)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">REQ-003</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        Only Admin shall delete cases
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        CasePolicy@delete
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">
                        Feature test: viewer gets 403
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">REQ-004</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        Protected API endpoints require Sanctum bearer token
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        auth:sanctum middleware + Bearer handler
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">
                        Feature test: guest denied (401)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">REQ-005</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        Engineer role can edit and update status but cannot delete
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        CasePolicy@update & CasePolicy@delete
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">
                        Feature test: engineer delete blocked (403)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Database Schema & Architecture</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Relational model with foreign keys, indexes, and constraints as specified in Section 6.
                </p>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto space-y-3">
                <div className="text-emerald-400 font-semibold">// Relational Entity Diagram</div>
                <div>
                  [users]<br />
                  &nbsp;&nbsp;id (PK, BIGINT UNSIGNED AUTO_INCREMENT)<br />
                  &nbsp;&nbsp;name (VARCHAR 255)<br />
                  &nbsp;&nbsp;email (VARCHAR 255 UNIQUE)<br />
                  &nbsp;&nbsp;password (VARCHAR 255)<br />
                  &nbsp;&nbsp;role (ENUM: 'admin', 'viewer', 'engineer')<br />
                  &nbsp;&nbsp;created_at / updated_at (TIMESTAMP)<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 1:N Foreign Key (cases.created_by -&gt; users.id)<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<br />
                  [cases]<br />
                  &nbsp;&nbsp;id (PK, BIGINT UNSIGNED AUTO_INCREMENT)<br />
                  &nbsp;&nbsp;case_number (VARCHAR 64, UNIQUE INDEX)<br />
                  &nbsp;&nbsp;patient_reference (VARCHAR 64)<br />
                  &nbsp;&nbsp;surgeon_name (VARCHAR 255)<br />
                  &nbsp;&nbsp;implant_type (VARCHAR 255)<br />
                  &nbsp;&nbsp;status (ENUM: 'Draft','Planning','In Review','Approved','Completed','Cancelled', INDEX)<br />
                  &nbsp;&nbsp;priority (ENUM: 'Low','Medium','High')<br />
                  &nbsp;&nbsp;surgery_date (DATE NULLABLE)<br />
                  &nbsp;&nbsp;created_by (BIGINT UNSIGNED, FK users.id ON DELETE RESTRICT)<br />
                  &nbsp;&nbsp;created_at / updated_at (TIMESTAMP)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AWS Cloud Architecture & Production Deployment Strategy
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Half-page deployment design as specified in Section 8 (Bonus tasks).
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p>
                  <strong>1. Compute (AWS EC2 / ECS):</strong> Run containerized application on AWS EC2 or Amazon ECS Fargate behind an Application Load Balancer (ALB). Nginx acts as reverse proxy terminating TLS and proxying requests to the Node/Laravel process.
                </p>
                <p>
                  <strong>2. Database (AWS RDS MySQL Multi-AZ):</strong> Amazon RDS MySQL 8.0 instance configured in private VPC subnets. Auto-minor version upgrades enabled, automated daily snapshot backups with 30-day retention, and read replicas as traffic scales.
                </p>
                <p>
                  <strong>3. Storage (Amazon S3):</strong> Encrypted S3 buckets with SSE-KMS for patient-matched implant DICOM / CAD STL files and surgical templates. Pre-signed URLs for authenticated, time-limited asset downloads.
                </p>
                <p>
                  <strong>4. Security Groups & Networking:</strong> Private VPC with public/private subnet topology. ALB in public subnet (ports 80/443), EC2 in application private subnet (accessible only from ALB security group on port 3000), and RDS in database private subnet (accessible only from EC2 security group on port 3306).
                </p>
                <p>
                  <strong>5. Secrets & HTTPS:</strong> AWS Secrets Manager injects database credentials and Sanctum signing keys into runtime environment. Route 53 DNS routes traffic through ACM (AWS Certificate Manager) provisioned SSL/TLS certificates with strict HTTPS enforcement (HSTS).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900">Jajal Medical - Developer Assignment Overview</h3>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono space-y-1">
                <div>Admin Credentials: admin@jajalmedical.com / 123456</div>
                <div>Viewer Credentials: viewer@jajalmedical.com / viewer123</div>
                <div>Engineer Credentials: engineer@jajalmedical.com / engineer123</div>
              </div>
              <p>
                This application fulfills all core requirements of the Software Developer Intern Practical Assignment at Jajal Medical:
                authentication, role-based access control (Admin, Viewer, and bonus Engineer), 5 interactive screens, 7 REST API endpoints with Sanctum token semantics, database migrations & seeders (25 dummy cases), automated test suite runner, Nager.Date public holiday verification, and traceability matrices.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Jajal Medical Practical Assignment Submission</span>
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
