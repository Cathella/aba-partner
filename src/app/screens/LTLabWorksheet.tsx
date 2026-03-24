/**
 * LT Lab Worksheet — Print-optimised worksheet view for the lab worklist.
 *
 * Displays all active orders (pending, in-progress, results-ready) in a
 * print-friendly table layout. Designed for printing and physical use at
 * the lab bench.
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { useLabTechStore } from '../data/labTechStore';
import { showToast } from '../components/aba/Toast';
import { Printer, FileText, FlaskConical } from 'lucide-react';

export function LTLabWorksheet() {
  const navigate = useNavigate();
  const { worklist } = useLabTechStore();
  const [showPrint, setShowPrint] = useState(false);

  const dateStr = new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(false), 500);
    }, 300);
  };

  const priorityLabel = (u: string) => {
    if (u === 'stat') return 'STAT';
    if (u === 'urgent') return 'URG';
    return '';
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'pending-collection': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'results-ready': return 'Ready';
      case 're-collect': return 'Re-collect';
      default: return s;
    }
  };

  /* ── Print overlay ── */
  if (showPrint) {
    return (
      <div className="bg-white p-6 max-w-[700px] mx-auto print:p-4">
        <style>{`@media print { body * { visibility: hidden; } #lt-worksheet-print, #lt-worksheet-print * { visibility: visible; } #lt-worksheet-print { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
        <div id="lt-worksheet-print">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3 mb-4">
            <div>
              <h1 className="text-lg font-bold">Lab Worksheet</h1>
              <p className="text-xs text-gray-500">ABA Partner &middot; {dateStr}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Tech: Lab Tech Mukasa</p>
              <p className="text-xs text-gray-500">Active orders: {worklist.length}</p>
            </div>
          </div>

          <table className="w-full border-collapse text-xs mb-6">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-1.5 px-1">#</th>
                <th className="text-left py-1.5 px-1">Patient</th>
                <th className="text-left py-1.5 px-1">Age/Sex</th>
                <th className="text-left py-1.5 px-1">Test</th>
                <th className="text-left py-1.5 px-1">Specimen</th>
                <th className="text-left py-1.5 px-1">Priority</th>
                <th className="text-left py-1.5 px-1">Status</th>
                <th className="text-left py-1.5 px-1">Sample ID</th>
                <th className="text-left py-1.5 px-1 w-24">Notes</th>
              </tr>
            </thead>
            <tbody>
              {worklist.map((o, idx) => (
                <tr key={o.id} className="border-b border-gray-200">
                  <td className="py-1.5 px-1 text-gray-500">{idx + 1}</td>
                  <td className="py-1.5 px-1 font-medium">{o.patientName}</td>
                  <td className="py-1.5 px-1 text-gray-500">{o.patientAge}{o.patientGender?.charAt(0)}</td>
                  <td className="py-1.5 px-1">{o.testName}</td>
                  <td className="py-1.5 px-1 text-gray-500">{o.specimen}</td>
                  <td className="py-1.5 px-1">
                    {o.urgency !== 'routine' && (
                      <span className={`font-bold ${o.urgency === 'stat' ? 'text-red-600' : 'text-amber-600'}`}>
                        {priorityLabel(o.urgency)}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-1">{statusLabel(o.status)}</td>
                  <td className="py-1.5 px-1 font-mono text-gray-500">
                    {o.collectedSampleId || '________'}
                  </td>
                  <td className="py-1.5 px-1">
                    <div className="border-b border-dotted border-gray-300 h-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-300 pt-3 flex justify-between text-[10px] text-gray-400">
            <span>Printed {new Date().toLocaleTimeString('en-UG')}</span>
            <span>ABA Partner Lab System v1.0.0</span>
          </div>
        </div>

        <div className="mt-6 text-center print:hidden">
          <ABAButton variant="outline" onClick={() => setShowPrint(false)}>
            Close Preview
          </ABAButton>
        </div>
      </div>
    );
  }

  /* ── Normal view ── */
  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Lab Worksheet" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A1A]">
                  Printable Lab Worksheet
                </h2>
                <p className="text-xs text-[#8F9AA1]">
                  {dateStr} &middot; {worklist.length} active orders
                </p>
              </div>
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#56D8A8]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Active Orders
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#E5E8EC] bg-[#F7F9FC]">
                    <th className="text-left text-[10px] font-semibold text-[#8F9AA1] uppercase px-3 py-2">#</th>
                    <th className="text-left text-[10px] font-semibold text-[#8F9AA1] uppercase px-3 py-2">Patient</th>
                    <th className="text-left text-[10px] font-semibold text-[#8F9AA1] uppercase px-3 py-2">Test</th>
                    <th className="text-left text-[10px] font-semibold text-[#8F9AA1] uppercase px-3 py-2">Prio</th>
                    <th className="text-left text-[10px] font-semibold text-[#8F9AA1] uppercase px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {worklist.map((o, idx) => (
                    <tr key={o.id} className="border-b border-[#E5E8EC] last:border-b-0">
                      <td className="text-xs text-[#C9D0DB] px-3 py-2">{idx + 1}</td>
                      <td className="text-xs text-[#1A1A1A] px-3 py-2 font-medium">{o.patientName}</td>
                      <td className="text-xs text-[#4A4F55] px-3 py-2">{o.testName}</td>
                      <td className="text-xs px-3 py-2">
                        {o.urgency === 'stat' && <span className="text-[#E44F4F] font-bold text-[10px]">STAT</span>}
                        {o.urgency === 'urgent' && <span className="text-[#D97706] font-bold text-[10px]">URG</span>}
                      </td>
                      <td className="text-xs px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                          o.status === 'pending-collection' ? 'bg-[#FFF3DC] text-[#D97706]' :
                          o.status === 'in-progress' ? 'bg-[#EBF3FF] text-[#3A8DFF]' :
                          o.status === 'results-ready' ? 'bg-[#E9F8F0] text-[#38C172]' :
                          o.status === 're-collect' ? 'bg-[#FDECEC] text-[#E44F4F]' :
                          'bg-[#F1F3F5] text-[#8F9AA1]'
                        }`}>
                          {statusLabel(o.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#EBF3FF]/30 rounded-2xl border border-[#3A8DFF]/10 p-4 flex items-start gap-3">
            <Printer className="w-4 h-4 text-[#3A8DFF] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#4A4F55] leading-relaxed">
              The printed worksheet includes columns for patient, test, specimen, sample ID, priority, status, and a blank notes area for handwritten observations at the bench.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky print button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            Print Worksheet
          </ABAButton>
        </div>
      </div>
    </div>
  );
}