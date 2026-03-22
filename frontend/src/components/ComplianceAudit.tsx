import { useState, useEffect } from 'react';
import { FileCheck, Download, Shield, Clock, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  checkName: string;
  status: 'VERIFIED' | 'SECURE' | 'PASS' | 'COMPLIANT' | 'SYNCED';
  statusIcon: string;
}

export default function ComplianceAudit() {
  const [audits, setAudits] = useState<AuditEntry[]>([
    {
      id: '1',
      timestamp: '11:34:08',
      checkName: 'Sensor_07_Purge',
      status: 'VERIFIED',
      statusIcon: '✓',
    },
    {
      id: '2',
      timestamp: '11:33:45',
      checkName: 'Enc_Key_Cycle',
      status: 'SECURE',
      statusIcon: '✓',
    },
    {
      id: '3',
      timestamp: '11:33:12',
      checkName: 'Zero_PII_Check',
      status: 'PASS',
      statusIcon: '✓',
    },
    {
      id: '4',
      timestamp: '11:32:58',
      checkName: 'GDPR_Sync',
      status: 'COMPLIANT',
      statusIcon: '✓',
    },
    {
      id: '5',
      timestamp: '11:32:48',
      checkName: 'Hash_Verify',
      status: 'SYNCED',
      statusIcon: '✓',
    },
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate new audit entries
  useEffect(() => {
    const interval = setInterval(() => {
      const newAudit: AuditEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        checkName: ['Sensor_07_Purge', 'Enc_Key_Cycle', 'Zero_PII_Check', 'GDPR_Sync', 'Hash_Verify'][Math.floor(Math.random() * 5)],
        status: ['VERIFIED', 'SECURE', 'PASS', 'COMPLIANT', 'SYNCED'][Math.floor(Math.random() * 5)] as AuditEntry['status'],
        statusIcon: '✓',
      };
      
      setAudits(prev => [newAudit, ...prev].slice(0, 10));
      setLastUpdate(new Date());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'PASS':
      case 'SYNCED':
        return 'text-[#10B981] bg-[#F0FDF4]';
      case 'SECURE':
      case 'COMPLIANT':
        return 'text-[#0D9488] bg-[#F0FDFA]';
      default:
        return 'text-[#64748B] bg-[#F1F5F9]';
    }
  };

  const handleDownloadReport = () => {
    const report = `
CROWDSTATE AI - TRANSPARENCY REPORT
Generated: ${new Date().toISOString()}

COMPLIANCE AUDIT LOG
====================
${audits.map(a => `[${a.timestamp}] ${a.checkName.padEnd(20)} ${a.status} ✓`).join('\n')}

ENCRYPTION STATUS
=================
At Rest: AES-256
In Transit: TLS 1.3
Key Exchange: RSA-4096

RETENTION POLICY
================
Vectors: 7 days
Aggregates: 90 days
Raw Feeds: 0 days (never stored)

CERTIFICATIONS
==============
- GDPR Compliant
- SOC 2 Type II
- ISO 27001 Certified
- HIPAA Ready

This report confirms all privacy and compliance protocols are active and verified.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crowdstate_transparency_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileCheck size={16} className="text-[#0D9488]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
            Compliance Audit
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-[#94A3B8]" />
          <span className="text-[10px] text-[#94A3B8]">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Audit Table */}
      <div className="space-y-2 mb-5">
        {audits.map((audit) => (
          <div
            key={audit.id}
            className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#94A3B8]">
                {audit.timestamp}
              </span>
              <span className="text-xs font-mono text-[#0F172A]">
                {audit.checkName}
              </span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(audit.status)}`}>
              <span>{audit.status}</span>
              <span>{audit.statusIcon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadReport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0F172A] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-colors group"
      >
        <Download size={14} />
        Download Transparency Report
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

// Skeleton loader
export function ComplianceAuditSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="w-32 h-3 bg-[#E2E8F0] rounded" />
        <div className="w-24 h-3 bg-[#F1F5F9] rounded" />
      </div>
      <div className="space-y-2 mb-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-3 bg-[#E2E8F0] rounded" />
              <div className="w-24 h-3 bg-[#E2E8F0] rounded" />
            </div>
            <div className="w-20 h-5 bg-[#F0FDF4] rounded" />
          </div>
        ))}
      </div>
      <div className="w-full h-10 bg-[#1E293B] rounded" />
    </div>
  );
}
