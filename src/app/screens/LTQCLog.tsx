/**
 * LT-07 QC Log — Quality control records for instruments.
 * Shows daily QC entries, pass/fail/warning indicators, add new entry.
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { LTConfirmModal } from '../components/aba/LTConfirmModal';
import { LTWarningBanner } from '../components/aba/LTWarningBanner';
import { showToast } from '../components/aba/Toast';
import { useLabTechStore, addQCEntry } from '../data/labTechStore';
import type { QCLogEntry } from '../data/labTechStore';
import {
  Beaker,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';

const statusStyles: Record<QCLogEntry['status'], { bg: string; text: string; icon: React.ReactNode }> = {
  pass: {
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#38C172]" />,
  },
  warning: {
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />,
  },
  fail: {
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    icon: <XCircle className="w-3.5 h-3.5 text-[#E44F4F]" />,
  },
};

export function LTQCLog() {
  const navigate = useNavigate();
  const { qcLog } = useLabTechStore();
  const [showAdd, setShowAdd] = useState(false);
  const [instrument, setInstrument] = useState('');
  const [parameter, setParameter] = useState('');
  const [level, setLevel] = useState('Normal');
  const [result, setResult] = useState('');
  const [expected, setExpected] = useState('');
  const [status, setStatus] = useState<QCLogEntry['status']>('pass');

  const failCount = qcLog.filter((e) => e.status === 'fail').length;
  const warnCount = qcLog.filter((e) => e.status === 'warning').length;

  const handleAdd = () => {
    if (!instrument.trim() || !parameter.trim() || !result.trim() || !expected.trim()) return;
    addQCEntry({
      instrument: instrument.trim(),
      parameter: parameter.trim(),
      level,
      result: result.trim(),
      expected: expected.trim(),
      status,
    });
    setShowAdd(false);
    setInstrument('');
    setParameter('');
    setLevel('Normal');
    setResult('');
    setExpected('');
    setStatus('pass');
    showToast('QC entry recorded', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="QC Log" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
              <p className="text-xl font-bold text-[#38C172]">
                {qcLog.filter((e) => e.status === 'pass').length}
              </p>
              <p className="text-[10px] text-[#8F9AA1] mt-0.5">Pass</p>
            </div>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
              <p className="text-xl font-bold text-[#D97706]">{warnCount}</p>
              <p className="text-[10px] text-[#8F9AA1] mt-0.5">Warning</p>
            </div>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
              <p className="text-xl font-bold text-[#E44F4F]">{failCount}</p>
              <p className="text-[10px] text-[#8F9AA1] mt-0.5">Fail</p>
            </div>
          </div>

          {failCount > 0 && (
            <LTWarningBanner
              variant="error"
              title="QC Failures"
              message="One or more QC checks failed. Do not release results on affected instruments until corrective action is taken."
            />
          )}

          {warnCount > 0 && failCount === 0 && (
            <LTWarningBanner
              variant="warning"
              title="QC Warnings"
              message="Some QC results are borderline. Monitor closely."
            />
          )}

          {/* QC entries */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Today's QC Records
              </h3>
            </div>

            {qcLog.map((entry) => {
              const s = statusStyles[entry.status];
              return (
                <div
                  key={entry.id}
                  className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}
                    >
                      {s.icon}
                      {entry.status}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-[12px] text-[#8f9aa1]">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {entry.parameter}
                  </p>
                  <p className="text-xs text-[#8F9AA1] mt-0.5">
                    {entry.instrument} · Level: {entry.level}
                  </p>
                  <p className="text-xs text-[#4A4F55] mt-1">
                    Result: <span className="font-semibold">{entry.result}</span>{' '}
                    <span className="text-[#8F9AA1]">(Expected: {entry.expected})</span>
                  </p>
                </div>
              );
            })}

            {qcLog.length === 0 && (
              <div className="py-10 text-center">
                <Beaker className="w-8 h-8 text-[#C9D0DB] mx-auto mb-2" />
                <p className="text-sm text-[#8F9AA1]">No QC entries recorded today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add QC entry CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30 p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-5 h-5" />
            Record QC Entry
          </ABAButton>
      </div>

      {/* Add QC modal */}
      <LTConfirmModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        icon={<Beaker className="w-7 h-7 text-[#8B5CF6]" />}
        iconBg="bg-[#F5F3FF]"
        title="Record QC Entry"
        confirmText="Save Entry"
        onConfirm={handleAdd}
      >
        <div className="space-y-3">
          <input
            type="text"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            placeholder="Instrument name"
            className="w-full h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF]"
          />
          <input
            type="text"
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            placeholder="Parameter / control name"
            className="w-full h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF]"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF]"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QCLogEntry['status'])}
              className="h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF]"
            >
              <option value="pass">Pass</option>
              <option value="warning">Warning</option>
              <option value="fail">Fail</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Result"
              className="h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF]"
            />
            <input
              type="text"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="Expected range"
              className="h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF]"
            />
          </div>
        </div>
      </LTConfirmModal>
    </div>
  );
}