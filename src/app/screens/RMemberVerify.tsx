/**
 * R-12 Member Verification — Options: Scan QR (placeholder), Enter Member ID, Search by phone.
 * Verify CTA → R-13 Member Results
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { useWalkInStore } from '../data/walkInStore';
import {
  QrCode,
  CreditCard,
  Phone,
  Search,
  Camera,
} from 'lucide-react';

type VerifyMethod = 'qr' | 'member-id' | 'phone';

const methods: { id: VerifyMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'qr',
    label: 'Scan QR Code',
    icon: <QrCode className="w-5 h-5" />,
    description: 'Scan the member\u2019s AbaAccess QR code',
  },
  {
    id: 'member-id',
    label: 'Member ID',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Enter AbaAccess Member ID (e.g. ABA-2024-001)',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    icon: <Phone className="w-5 h-5" />,
    description: 'Search by registered phone number',
  },
];

export function RMemberVerify() {
  const navigate = useNavigate();
  const { setVerifyMethod: storeMethod, setVerifyQuery: storeQuery } = useWalkInStore();

  const [method, setMethod] = useState<VerifyMethod>('member-id');
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);

  const canVerify = method === 'qr' ? false : query.trim().length >= 3;

  const handleVerify = () => {
    storeMethod(method);
    storeQuery(query.trim());
    navigate('/r/walk-in/results');
  };

  const handleScanQR = () => {
    setScanning(true);
    // Simulate QR scan → auto-fills a member ID after delay
    setTimeout(() => {
      setScanning(false);
      setMethod('member-id');
      setQuery('ABA-2024-001');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Verify Member" showBack onBackClick={() => navigate('/r/walk-in')} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">

          {/* ── Method selector ── */}
          <div>
            
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => {
                const isActive = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setQuery(''); }}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 transition-all ${ isActive ? 'border-aba-primary-main bg-aba-primary-50 text-aba-primary-main' : 'border-aba-neutral-200 bg-aba-neutral-0 text-aba-neutral-700 hover:bg-aba-neutral-100' } px-[12px] py-[24px]`}
                  >
                    {m.icon}
                    <span className="text-xs font-medium text-center leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── QR Scanner placeholder ── */}
          {method === 'qr' && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              <div className="aspect-square max-h-[280px] bg-aba-neutral-900 flex flex-col items-center justify-center relative">
                {scanning ? (
                  <>
                    <div className="w-48 h-48 border-2 border-aba-primary-main rounded-2xl animate-pulse" />
                    <p className="text-sm text-aba-primary-main mt-4 font-medium">Scanning...</p>
                  </>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-aba-neutral-400 mb-3" />
                    <p className="text-sm text-aba-neutral-400">Camera preview placeholder</p>
                    <p className="text-xs text-aba-neutral-600 mt-1">Position QR code in frame</p>
                  </>
                )}
              </div>
              <div className="p-4">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleScanQR}
                  isLoading={scanning}
                  disabled={scanning}
                >
                  {scanning ? 'Scanning...' : 'Start Scan'}
                </ABAButton>
              </div>
            </div>
          )}

          {/* ── Member ID input ── */}
          {method === 'member-id' && (
            <div className="space-y-4">
              <InputField
                label="Member ID"
                placeholder="e.g. ABA-2024-001"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leftIcon={<CreditCard className="w-5 h-5" />}
              />
              <p className="text-xs text-aba-neutral-600">
                The member ID is printed on the AbaAccess card or available in the member's app profile.
              </p>
            </div>
          )}

          {/* ── Phone search input ── */}
          {method === 'phone' && (
            <div className="space-y-4">
              <InputField
                label="Phone Number"
                placeholder="e.g. +256 701 234 567"
                type="tel"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leftIcon={<Phone className="w-5 h-5" />}
              />
              <p className="text-xs text-aba-neutral-600">
                Enter the phone number registered with the member's AbaAccess account.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      {method !== 'qr' && (
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3">
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canVerify}
            onClick={handleVerify}
          >
            <Search className="w-5 h-5" />
            Verify Member
          </ABAButton>
        </div>
      )}
    </div>
  );
}