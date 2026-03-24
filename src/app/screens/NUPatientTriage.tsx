/**
 * NU-02 Patient Triage Summary — Patient snapshot + quick actions + vitals.
 *
 * Quick actions: Capture Vitals, Nursing Notes, Transfer Patient, Mark Ready.
 * Shows latest vitals summary if available.
 * Inner page: back arrow, no bottom nav.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { useNurseStore } from '../data/nurseStore';
import {
  User,
  HeartPulse,
  FileText,
  ArrowRightLeft,
  CheckCircle2,
  Thermometer,
  Activity,
  Wind,
  Weight,
  Clock,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  FlaskConical,
  Pill,
} from 'lucide-react';

export function NUPatientTriage() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { getById } = useNurseStore();

  const patient = getById(patientId || '');

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Patient Triage" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Patient not found</p>
        </div>
      </div>
    );
  }

  const v = patient.vitals;
  const hasVitals = v && (v.bp || v.temp || v.pulse || v.spO2 || v.weight);
  const isAlreadyReady = patient.status === 'ready-for-clinician';
  const isInStation = patient.status === 'in-station';
  const hasCoverage = !!patient.consultCoverageStatus || !!patient.labCoverageStatus || !!patient.pharmCoverageStatus;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Patient Triage" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-3">

          {/* ── Patient snapshot ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-semibold text-[#1A1A1A] truncate">
                    {patient.patientName}
                  </p>
                  <span
                    className={`font-semibold px-1.5 py-[1px] rounded flex-shrink-0 ${ patient.isMember ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]' } text-[12px]`}
                  >
                    {patient.isMember ? 'Member' : 'Non-member'}
                  </span>
                </div>
                <p className="text-xs text-[#8F9AA1]">
                  {patient.patientAge} yrs · {patient.patientGender}
                </p>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E5E8EC]">
              <span className="flex items-center gap-1.5 text-xs text-[#8F9AA1]">
                <span className="font-bold text-[#3A8DFF] bg-[#EBF3FF] px-1.5 py-[1px] rounded-full text-[12px]">
                  {patient.ticketNo}
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs text-[#8F9AA1]">
                <Stethoscope className="w-3.5 h-3.5" />
                {patient.service}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#8F9AA1]">
                <Clock className="w-3.5 h-3.5" />
                {patient.arrivalTime}
              </span>
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Quick Actions
              </h3>
            </div>

            {/* Capture Vitals */}
            <button
              onClick={() => navigate(`/nu/vitals/${patient.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FDECEC] flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-5 h-5 text-[#E44F4F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">Capture Vitals</p>
                <p className="text-xs text-[#8F9AA1]">
                  {hasVitals ? 'Update patient vitals' : 'Record BP, temp, pulse, SpO2, weight'}
                </p>
              </div>
              {hasVitals && (
                <span className="font-semibold text-[#38C172] bg-[#E9F8F0] px-1.5 py-[1px] rounded-full flex-shrink-0 text-[12px]">
                  Recorded
                </span>
              )}
            </button>

            {/* Nursing Notes */}
            <button
              onClick={() => navigate(`/nu/notes/${patient.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">Nursing Notes</p>
                <p className="text-xs text-[#8F9AA1]">
                  {patient.notes.length > 0
                    ? `${patient.notes.length} note(s) recorded`
                    : 'Add observations or notes'}
                </p>
              </div>
              {patient.notes.length > 0 && (
                <span className="font-semibold text-[#3A8DFF] bg-[#EBF3FF] px-1.5 py-[1px] rounded-full flex-shrink-0 text-[12px]">
                  {patient.notes.length}
                </span>
              )}
            </button>

            {/* Transfer Patient */}
            <button
              onClick={() => navigate(`/nu/transfer/${patient.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF3DC] flex items-center justify-center flex-shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-[#D97706]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">Transfer Patient</p>
                <p className="text-xs text-[#8F9AA1]">Send to Lab, Pharmacy, Room, or Reception</p>
              </div>
              {isInStation && patient.stationLabel && (
                <span className="font-semibold text-[#D97706] bg-[#FFF3DC] px-1.5 py-[1px] rounded-full flex-shrink-0 text-[12px]">
                  {patient.stationLabel}
                </span>
              )}
            </button>

            {/* Mark Ready for Clinician */}
            <button
              onClick={() => navigate(`/nu/mark-ready/${patient.id}`)}
              disabled={isAlreadyReady}
              className={`w-full flex items-center gap-3 px-4 py-3.5 last:border-b-0 transition-colors text-left ${
                isAlreadyReady
                  ? 'opacity-50 cursor-not-allowed bg-[#F7F9FC]'
                  : 'hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#38C172]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">Mark Ready for Doctor</p>
                <p className="text-xs text-[#8F9AA1]">
                  {isAlreadyReady ? 'Already marked ready' : 'Confirm triage is complete'}
                </p>
              </div>
              {isAlreadyReady && (
                <CheckCircle2 className="w-4 h-4 text-[#38C172] flex-shrink-0" />
              )}
              {!isAlreadyReady && patient.consultCoverageStatus && (
                <span className="text-[10px] font-semibold text-[#32C28A] bg-[#E9F8F0] px-1.5 py-[1px] rounded-full flex-shrink-0">Applied</span>
              )}
            </button>
          </div>

          {/* ── Coverage Applied (read-only) ── */}
          {hasCoverage && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
                Coverage Applied
              </h3>
              <div className="space-y-2.5">
                {patient.consultCoverageStatus && (
                  <div className="flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
                    <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${patient.consultCoverageStatus === 'Covered' ? 'text-[#32C28A]' : 'text-[#8F9AA1]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8F9AA1]">Consultation coverage</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${patient.consultCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : patient.consultCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{patient.consultCoverageStatus}</span>
                        {patient.consultCoveragePackage && <span className="text-[10px] text-[#8F9AA1]">{patient.consultCoveragePackage}</span>}
                      </div>
                    </div>
                  </div>
                )}
                {patient.labCoverageStatus && (
                  <div className="flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
                    <FlaskConical className={`w-4 h-4 flex-shrink-0 ${patient.labCoverageStatus === 'Covered' ? 'text-[#F59E0B]' : 'text-[#8F9AA1]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8F9AA1]">Lab coverage</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${patient.labCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : patient.labCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{patient.labCoverageStatus}</span>
                        {patient.labCoveragePackage && <span className="text-[10px] text-[#8F9AA1]">{patient.labCoveragePackage}</span>}
                      </div>
                    </div>
                  </div>
                )}
                {patient.pharmCoverageStatus && (
                  <div className="flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
                    <Pill className={`w-4 h-4 flex-shrink-0 ${patient.pharmCoverageStatus === 'Covered' ? 'text-[#EC4899]' : 'text-[#8F9AA1]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8F9AA1]">Pharmacy coverage</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${patient.pharmCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : patient.pharmCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{patient.pharmCoverageStatus}</span>
                        {patient.pharmCoveragePackage && <span className="text-[10px] text-[#8F9AA1]">{patient.pharmCoveragePackage}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Latest vitals ── */}
          {hasVitals && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Latest Vitals
                </h3>
                {v!.capturedAt && (
                  <span className="text-[#C9D0DB] flex items-center gap-1 text-[12px]">
                    <Clock className="w-3 h-3" />
                    {v!.capturedAt}
                    {v!.capturedBy ? ` · ${v!.capturedBy}` : ''}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {v!.bp && (
                  <div className="bg-[#FDECEC] rounded-xl p-3 text-center">
                    <Activity className="w-4 h-4 text-[#E44F4F] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{v!.bp}</p>
                    <p className="text-[#8F9AA1] text-[12px]">BP mmHg</p>
                  </div>
                )}
                {v!.temp && (
                  <div className="bg-[#FFF3DC] rounded-xl p-3 text-center">
                    <Thermometer className="w-4 h-4 text-[#D97706] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{v!.temp}°C</p>
                    <p className="text-[#8F9AA1] text-[12px]">Temp</p>
                  </div>
                )}
                {v!.pulse && (
                  <div className="bg-[#EBF3FF] rounded-xl p-3 text-center">
                    <HeartPulse className="w-4 h-4 text-[#3A8DFF] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{v!.pulse}</p>
                    <p className="text-[#8F9AA1] text-[12px]">Pulse bpm</p>
                  </div>
                )}
                {v!.spO2 && (
                  <div className="bg-[#E9F8F0] rounded-xl p-3 text-center">
                    <Wind className="w-4 h-4 text-[#38C172] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{v!.spO2}%</p>
                    <p className="text-[#8F9AA1] text-[12px]">SpO2</p>
                  </div>
                )}
                {v!.weight && (
                  <div className="bg-[#F7F9FC] rounded-xl p-3 text-center border border-[#E5E8EC]">
                    <Weight className="w-4 h-4 text-[#4A4F55] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{v!.weight} kg</p>
                    <p className="text-[#8F9AA1] text-[12px]">Weight</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Nursing notes history ── */}
          {patient.notes.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC]">
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Nursing Notes
                </h3>
              </div>
              {patient.notes.map((note) => (
                <div key={note.id} className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0">
                  <p className="text-sm text-[#1A1A1A] leading-relaxed">{note.text}</p>
                  {note.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {note.chips.map((chip) => (
                        <span
                          key={chip}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3FF] text-[#3A8DFF]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[#C9D0DB] mt-2 text-[12px]">
                    {note.createdBy} · {note.createdAt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}