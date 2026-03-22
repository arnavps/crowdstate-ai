import { useState, useEffect } from 'react';
import { Shield, Lock, FileCheck, Clock, Server, Database, ArrowRightLeft, Trash2, Award, Globe, LockKeyhole } from 'lucide-react';
import ZeroPIIBanner, { ZeroPIIBannerSkeleton } from '../components/ZeroPIIBanner';
import VectorizationDiagram, { VectorizationDiagramSkeleton } from '../components/VectorizationDiagram';
import ComplianceAudit, { ComplianceAuditSkeleton } from '../components/ComplianceAudit';

export default function Privacy() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-1">
            Privacy Technicals
          </h1>
          <p className="text-2xl font-bold text-[#0F172A] font-helvetica">
            Compliance & Ethics Vault
          </p>
        </div>

        {/* Encryption Status Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#F0FDFA] rounded-lg border border-[#0D9488]/30">
          <LockKeyhole size={16} className="text-[#0D9488]" />
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
            Encryption: C2EE Edge Processing
          </span>
        </div>
      </div>

      {/* Zero PII Banner */}
      {loading ? <ZeroPIIBannerSkeleton /> : <ZeroPIIBanner />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Vectorization Diagram */}
        <div>
          {loading ? <VectorizationDiagramSkeleton /> : <VectorizationDiagram />}
        </div>

        {/* Right Column - Compliance Audit */}
        <div>
          {loading ? <ComplianceAuditSkeleton /> : <ComplianceAudit />}
        </div>
      </div>

      {/* Technical Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Encryption Methods */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-[#0D9488]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Encryption Methods
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
              <Database size={14} className="text-[#64748B]" />
              <div>
                <p className="text-sm font-mono text-[#0F172A]">AES-256</p>
                <p className="text-[10px] text-[#64748B] uppercase">At Rest</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
              <ArrowRightLeft size={14} className="text-[#64748B]" />
              <div>
                <p className="text-sm font-mono text-[#0F172A]">TLS 1.3</p>
                <p className="text-[10px] text-[#64748B] uppercase">In Transit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
              <Server size={14} className="text-[#64748B]" />
              <div>
                <p className="text-sm font-mono text-[#0F172A]">RSA-4096</p>
                <p className="text-[10px] text-[#64748B] uppercase">Key Exchange</p>
              </div>
            </div>
          </div>
        </div>

        {/* Retention Policy */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[#0D9488]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Retention Policy
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-sm font-mono text-[#0F172A]">Vectors</span>
              </div>
              <span className="text-xs font-bold text-[#64748B]">7 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                <span className="text-sm font-mono text-[#0F172A]">Aggregates</span>
              </div>
              <span className="text-xs font-bold text-[#64748B]">90 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
              <div className="flex items-center gap-2">
                <Trash2 size={14} className="text-[#EF4444]" />
                <span className="text-sm font-mono text-[#0F172A]">Raw Feeds</span>
              </div>
              <span className="text-xs font-bold text-[#EF4444]">0 Days</span>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-[#0D9488]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Certifications
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg border border-[#10B981]/20">
              <Globe size={16} className="text-[#10B981]" />
              <div>
                <p className="text-sm font-bold text-[#10B981]">GDPR Compliant</p>
                <p className="text-[10px] text-[#64748B]">EU Data Protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F0FDFA] rounded-lg border border-[#0D9488]/20">
              <FileCheck size={16} className="text-[#0D9488]" />
              <div>
                <p className="text-sm font-bold text-[#0D9488]">SOC 2 Type II</p>
                <p className="text-[10px] text-[#64748B]">Security Controls</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F0FDFA] rounded-lg border border-[#0D9488]/20">
              <Shield size={16} className="text-[#0D9488]" />
              <div>
                <p className="text-sm font-bold text-[#0D9488]">ISO 27001</p>
                <p className="text-[10px] text-[#64748B]">ISMS Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
        <Lock size={16} className="text-[#0D9488] shrink-0 mt-0.5" />
        <p className="text-xs text-[#64748B] leading-relaxed font-garamond">
          All privacy and compliance protocols are independently verified and continuously monitored. 
          Our edge-first architecture ensures data never leaves your premises in raw form. 
          For detailed compliance documentation, contact our Data Protection Officer.
        </p>
      </div>
    </div>
  );
}
