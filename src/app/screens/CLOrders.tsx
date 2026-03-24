/**
 * CL-12 Orders (My Orders) — List with status chips:
 * Pending Collection, In Progress, Result Ready.
 * Tapping result-ready → CL-13 Lab Result Detail.
 * Tapping other statuses → order detail placeholder.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ClinicianBottomNav } from '../components/aba/ClinicianBottomNav';
import { SearchHeader } from '../components/aba/SearchHeader';
import { ListCard } from '../components/aba/Cards';
import {
  FlaskConical,
  Pill,
  ChevronRight,
  Clock,
  Loader2,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useClinicianStore } from '../data/clinicianStore';
import type { LabOrder, Prescription } from '../data/clinicianStore';

type OrderTab = 'labs' | 'prescriptions';

/** Map internal status to user-facing label + styles */
function labStatusDisplay(status: LabOrder['status']) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Collection',
        icon: <Clock className="w-3 h-3" />,
        bg: 'bg-aba-warning-50',
        text: 'text-aba-warning-main',
        border: 'border-aba-warning-main/15',
      };
    case 'in-progress':
      return {
        label: 'In Progress',
        icon: <Loader2 className="w-3 h-3" />,
        bg: 'bg-aba-secondary-50',
        text: 'text-aba-secondary-main',
        border: 'border-aba-secondary-main/15',
      };
    case 'completed':
      return {
        label: 'Result Ready',
        icon: <CheckCircle2 className="w-3 h-3" />,
        bg: 'bg-aba-success-50',
        text: 'text-aba-success-main',
        border: 'border-aba-success-main/15',
      };
  }
}

export function CLOrders() {
  const navigate = useNavigate();
  const { labOrders, prescriptions, getLabNotificationCount, clearLabNotifications } = useClinicianStore();

  const [activeTab, setActiveTab] = useState<OrderTab>('labs');
  const [search, setSearch] = useState('');

  const filteredLabs = labOrders.filter(
    (o) =>
      search.length < 2 ||
      o.testName.toLowerCase().includes(search.toLowerCase()) ||
      o.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRx = prescriptions.filter(
    (p) =>
      search.length < 2 ||
      p.medication.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const urgencyStyles: Record<string, string> = {
    routine: 'text-aba-neutral-600 bg-aba-neutral-100',
    urgent: 'text-aba-warning-main bg-aba-warning-50',
    stat: 'text-aba-error-main bg-aba-error-50',
  };

  const handleLabClick = (lab: LabOrder) => {
    if (lab.status === 'completed') {
      navigate(`/cl/lab-result/${lab.id}`);
    } else {
      navigate(`/cl/orders/${lab.id}`);
    }
  };

  // Count result-ready for badge
  const resultReadyCount = labOrders.filter((o) => o.status === 'completed').length;
  const labNotifCount = getLabNotificationCount();

  // Clear notifications when viewing the orders tab
  useEffect(() => {
    if (activeTab === 'labs' && labNotifCount > 0) {
      clearLabNotifications();
    }
  }, [activeTab, labNotifCount]);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* Top bar */}
      <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 h-14 flex items-center">
        <h1 className="text-lg font-semibold text-aba-neutral-900">Orders</h1>
      </div>

      {/* Tab switcher */}
      <div className="bg-aba-neutral-0 px-4 pt-2 pb-0 border-b border-aba-neutral-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('labs')}
            className={`flex-1 py-3 text-sm font-medium text-center relative transition-colors ${
              activeTab === 'labs' ? 'text-aba-primary-main' : 'text-aba-neutral-600'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              Lab Orders ({labOrders.length})
              {resultReadyCount > 0 && (
                <span className="w-4.5 h-4.5 min-w-[18px] px-1 rounded-full bg-aba-success-main text-[10px] font-bold text-white flex items-center justify-center">
                  {resultReadyCount}
                </span>
              )}
            </span>
            {activeTab === 'labs' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-aba-primary-main rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 py-3 text-sm font-medium text-center relative transition-colors ${
              activeTab === 'prescriptions' ? 'text-aba-primary-main' : 'text-aba-neutral-600'
            }`}
          >
            Prescriptions ({prescriptions.length})
            {activeTab === 'prescriptions' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-aba-primary-main rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchHeader
        value={search}
        onChange={setSearch}
        placeholder={activeTab === 'labs' ? 'Search lab orders…' : 'Search prescriptions…'}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pb-4">
          {activeTab === 'labs' ? (
            filteredLabs.length === 0 ? (
              <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-8 text-center mt-2">
                <div className="w-14 h-14 rounded-full bg-aba-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <FlaskConical className="w-6 h-6 text-aba-neutral-400" />
                </div>
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">No lab orders</p>
                <p className="text-xs text-aba-neutral-600">Lab orders will appear here.</p>
              </div>
            ) : (
              <ListCard className="mt-2">
                {filteredLabs.map((lab) => {
                  const display = labStatusDisplay(lab.status);
                  return (
                    <button
                      key={lab.id}
                      onClick={() => handleLabClick(lab)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="w-5 h-5 text-[#F59E0B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-aba-neutral-900 truncate">
                          {lab.testName}
                        </p>
                        <p className="text-xs text-aba-neutral-600 truncate">
                          {lab.patientName} &middot; {lab.orderedAt}
                        </p>
                        {/* Status chip */}
                        <span
                          className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${display.bg} ${display.text} ${display.border}`}
                        >
                          {display.icon}
                          {display.label}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${urgencyStyles[lab.urgency]}`}
                        >
                          {lab.urgency.toUpperCase()}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </ListCard>
            )
          ) : filteredRx.length === 0 ? (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-8 text-center mt-2">
              <div className="w-14 h-14 rounded-full bg-aba-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Pill className="w-6 h-6 text-aba-neutral-400" />
              </div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">No prescriptions</p>
              <p className="text-xs text-aba-neutral-600">Prescriptions will appear here.</p>
            </div>
          ) : (
            <ListCard className="mt-2">
              {filteredRx.map((rx) => (
                <button
                  key={rx.id}
                  onClick={() => navigate(`/cl/orders/${rx.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                    <Pill className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900 truncate">
                      {rx.medication} — {rx.dosage}
                    </p>
                    <p className="text-xs text-aba-neutral-600 truncate">
                      {rx.patientName} &middot; {rx.frequency} &middot; {rx.duration}
                    </p>
                    {/* Rx status chip */}
                    <span
                      className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        rx.rxStatus === 'dispensed'
                          ? 'bg-aba-success-50 text-aba-success-main border-aba-success-main/15'
                          : 'bg-[#F5F3FF] text-[#8B5CF6] border-[#8B5CF6]/15'
                      }`}
                    >
                      {rx.rxStatus === 'sent' ? (
                        <>
                          <Send className="w-2.5 h-2.5" />
                          Sent to Pharmacy
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Dispensed
                        </>
                      )}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                </button>
              ))}
            </ListCard>
          )}
        </div>
      </div>

      <ClinicianBottomNav />
    </div>
  );
}