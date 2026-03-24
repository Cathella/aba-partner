/**
 * CL-13b Lab Result Print View — Clean, printable lab result summary
 * for parent/guardian handoff. Minimalist design optimized for printing.
 * Inner page: back arrow to lab result detail, no bottom nav.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore } from '../data/clinicianStore';
import { Printer } from 'lucide-react';

export function CLLabResultPrint() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getLabOrderById, getVisitById } = useClinicianStore();

  const lab = getLabOrderById(orderId || '');
  const visit = lab ? getVisitById(lab.visitId) : undefined;

  if (!lab || !lab.resultData) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Print Summary" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Lab results not available</p>
        </div>
      </div>
    );
  }

  const rd = lab.resultData;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    showToast('Print dialog opened', 'success');
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* App bar — hidden during print */}
      <div className="print:hidden">
        <AppTopBar
          title="Print Summary"
          showBack
          onBackClick={() => navigate(`/cl/lab-result/${lab.id}`)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-20 print:pb-0 print:overflow-visible">
        {/* Printable content area */}
        <div className="max-w-[390px] mx-auto print:max-w-none">
          <div className="bg-[#FFFFFF] m-4 rounded-2xl border border-[#E5E8EC] print:m-0 print:rounded-none print:border-none print:shadow-none">
            {/* ── Clinic Header ── */}
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E8EC] text-center print:border-b-2 print:border-[#1A1A1A]">
              <h1 className="text-lg font-bold text-[#1A1A1A]">
                ABA Partner Clinic
              </h1>
              <p className="text-xs text-[#8F9AA1] mt-1">
                Mukono Town, Uganda &middot; Tel: +256 700 000 000
              </p>
              <p className="text-[10px] text-[#C9D0DB] mt-2 uppercase tracking-widest">
                Laboratory Result Summary
              </p>
            </div>

            {/* ── Patient & Test Info ── */}
            <div className="px-6 py-4 border-b border-[#E5E8EC]">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Patient</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{lab.patientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Date</p>
                  <p className="text-sm text-[#1A1A1A]">{today}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Test</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{lab.testName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Specimen</p>
                  <p className="text-sm text-[#1A1A1A]">{rd.specimen}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Collected</p>
                  <p className="text-sm text-[#1A1A1A]">{rd.collectedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Resulted</p>
                  <p className="text-sm text-[#1A1A1A]">{rd.resultedAt}</p>
                </div>
                {visit && (
                  <>
                    <div>
                      <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Age / Gender</p>
                      <p className="text-sm text-[#1A1A1A]">{visit.age} yrs / {visit.gender}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Ticket</p>
                      <p className="text-sm text-[#1A1A1A]">{visit.ticket}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Results Table ── */}
            <div className="px-6 py-4">
              <h3 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-3">
                Results
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#1A1A1A]">
                    <th className="text-left text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide pb-2">Parameter</th>
                    <th className="text-right text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide pb-2">Value</th>
                    <th className="text-right text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide pb-2">Unit</th>
                    <th className="text-right text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide pb-2">Ref Range</th>
                    <th className="text-center text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide pb-2 w-12">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {rd.rows.map((row, idx) => {
                    const isAbnormal = row.flag === 'high' || row.flag === 'low' || row.flag === 'critical';
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-[#E5E8EC] ${isAbnormal ? 'bg-[#FDECEC]/40' : ''}`}
                      >
                        <td className="py-2 text-[#1A1A1A]">{row.parameter}</td>
                        <td className={`py-2 text-right font-semibold ${isAbnormal ? 'text-[#E44F4F]' : 'text-[#1A1A1A]'}`}>
                          {row.value}
                        </td>
                        <td className="py-2 text-right text-[#8F9AA1] text-xs">{row.unit}</td>
                        <td className="py-2 text-right text-[#8F9AA1] text-xs">{row.referenceRange}</td>
                        <td className="py-2 text-center text-xs">
                          {row.flag === 'normal' ? (
                            <span className="text-[#38C172]">N</span>
                          ) : row.flag === 'high' ? (
                            <span className="text-[#E44F4F] font-bold">H</span>
                          ) : row.flag === 'low' ? (
                            <span className="text-[#3A8DFF] font-bold">L</span>
                          ) : row.flag === 'critical' ? (
                            <span className="text-[#E44F4F] font-bold">C</span>
                          ) : (
                            <span className="text-[#C9D0DB]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {rd.method && (
                <p className="text-[10px] text-[#C9D0DB] mt-3">
                  Method: {rd.method}
                </p>
              )}
            </div>

            {/* ── Interpretation ── */}
            {lab.interpretationNote && (
              <div className="px-6 py-4 border-t border-[#E5E8EC]">
                <h3 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                  Doctor Interpretation
                </h3>
                <p className="text-sm text-[#4A4F55] leading-relaxed whitespace-pre-wrap">
                  {lab.interpretationNote}
                </p>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-[#E5E8EC]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#8F9AA1]">Prepared by</p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">
                    Dr. Ssekandi — Doctor
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#C9D0DB]">
                    This is a summary for informational purposes only.
                  </p>
                  <p className="text-[10px] text-[#C9D0DB]">
                    Please consult your healthcare provider for interpretation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print CTA — hidden in print ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30 print:hidden">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton variant="primary" fullWidth size="lg" onClick={handlePrint}>
            <Printer className="w-5 h-5" />
            Print
          </ABAButton>
        </div>
      </div>
    </div>
  );
}