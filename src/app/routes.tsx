import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/aba/RootLayout';
import { InviteLanding } from './screens/InviteLanding';
import { OTPVerification } from './screens/OTPVerification';
import { CreatePin } from './screens/CreatePin';
import { Login } from './screens/Login';
import { SetupWizard } from './screens/SetupWizard';
import { SetupWizardFlow } from './screens/SetupWizardFlow';
import { Dashboard } from './screens/Dashboard';
import { ClinicDashboard } from './screens/ClinicDashboard';
import { StaffList } from './screens/StaffList';
import { InviteStaff } from './screens/InviteStaff';
import { StaffDetail } from './screens/StaffDetail';
import { ServicesList } from './screens/ServicesList';
import { AddService } from './screens/AddService';
import { EditService } from './screens/EditService';
import { OperatingHours } from './screens/OperatingHours';
import { BlackoutDates } from './screens/BlackoutDates';
import { AddBlackoutDate } from './screens/AddBlackoutDate';
import { CapacityRules } from './screens/CapacityRules';
import { BookingsList } from './screens/BookingsList';
import { BookingDetail } from './screens/BookingDetail';
import { ReassignStaff } from './screens/ReassignStaff';
import { CancelBooking } from './screens/CancelBooking';
import { FinanceOverview } from './screens/FinanceOverview';
import { TransactionsList } from './screens/TransactionsList';
import { TransactionDetail } from './screens/TransactionDetail';
import { SettlementLedger } from './screens/SettlementLedger';
import { SettlementDetail } from './screens/SettlementDetail';
import { ReportsHome } from './screens/ReportsHome';
import { ReportViewer } from './screens/ReportViewer';
import { ScheduleReports } from './screens/ScheduleReports';
import { VisitsSummary } from './screens/VisitsSummary';
import { Settings } from './screens/Settings';
import { ProfileSettings } from './screens/ProfileSettings';
import { SecurityAndPin } from './screens/SecurityAndPin';
import { ChangePin } from './screens/ChangePin';
import { ResetPin } from './screens/ResetPin';
import { NotificationSettings } from './screens/NotificationSettings';
import { PaymentMethods } from './screens/PaymentMethods';
import { PrivacyPolicy } from './screens/PrivacyPolicy';
import { ClinicInformation } from './screens/ClinicInformation';
import { UpdateMapPin } from './screens/UpdateMapPin';
import { PreviewListing } from './screens/PreviewListing';
import { AuditLogs } from './screens/AuditLogs';
import { AuditLogDetail } from './screens/AuditLogDetail';
import { HelpCenter } from './screens/HelpCenter';
import { FAQCategory } from './screens/FAQCategory';
import { HelpArticle } from './screens/HelpArticle';
import { TestsCatalog } from './screens/TestsCatalog';
import { CreateTicket } from './screens/CreateTicket';
import { TicketsList } from './screens/TicketsList';
import { TicketDetail } from './screens/TicketDetail';
import { Notifications } from './screens/Notifications';

/* ── Staff sign-in flow ── */
import { StaffSignIn } from './screens/StaffSignIn';
import { StaffOTPVerification } from './screens/StaffOTPVerification';
import { StaffEnterPin } from './screens/StaffEnterPin';
import { StaffResetPin } from './screens/StaffResetPin';
import { RoleRouter } from './screens/RoleRouter';

/* ── Receptionist ── */
import { ReceptionistDashboard } from './screens/ReceptionistDashboard';
import { RToday } from './screens/RToday';
import { RBookings } from './screens/RBookings';
import { RBookingDetail } from './screens/RBookingDetail';
import { RProposeTime } from './screens/RProposeTime';
import { RDeclineBooking } from './screens/RDeclineBooking';
import { RQueue } from './screens/RQueue';
import { RQueueDetail } from './screens/RQueueDetail';
import { RCheckIn } from './screens/RCheckIn';
import { RPayments } from './screens/RPayments';
import { RMore } from './screens/RMore';
import { RWalkIn } from './screens/RWalkIn';
import { RMemberVerify } from './screens/RMemberVerify';
import { RMemberResults } from './screens/RMemberResults';
import { RRegisterNonMember } from './screens/RRegisterNonMember';
import { RVisitIntake } from './screens/RVisitIntake';
import { RAddedToQueue } from './screens/RAddedToQueue';
import { RSchedule } from './screens/RSchedule';
import { RScheduleDetail } from './screens/RScheduleDetail';
import { RPatients } from './screens/RPatients';
import { RAddPatient } from './screens/RAddPatient';
import { RPatientProfile } from './screens/RPatientProfile';
import { REditPatient } from './screens/REditPatient';
import { RDependents } from './screens/RDependents';
import { RPatientInfo } from './screens/RPatientInfo';
import { RBillingSummary } from './screens/RBillingSummary';
import { RCollectPayment } from './screens/RCollectPayment';
import { RReceipt } from './screens/RReceipt';
import { RPaymentFailed } from './screens/RPaymentFailed';
import { REndOfDaySummary } from './screens/REndOfDaySummary';

/* ── Clinician (Doctor) ── */
import { CLHome } from './screens/CLHome';
import { CLQueue } from './screens/CLQueue';
import { CLOrders } from './screens/CLOrders';
import { CLOrderDetail } from './screens/CLOrderDetail';
import { CLPatients } from './screens/CLPatients';
import { CLPatientProfile } from './screens/CLPatientProfile';
import { CLMore } from './screens/CLMore';
import { CLDashboard } from './screens/CLDashboard';
import { CLSchedule } from './screens/CLSchedule';
import { CLAppointmentDetail } from './screens/CLAppointmentDetail';
import { CLTodaySummary } from './screens/CLTodaySummary';
import { CLNoteTemplates } from './screens/CLNoteTemplates';
import { CLTemplateDetail } from './screens/CLTemplateDetail';
import { CLManageQuickPhrases } from './screens/CLManageQuickPhrases';
import { CLVisitSummary } from './screens/CLVisitSummary';
import { CLConsult } from './screens/CLConsult';
import { CLVitals } from './screens/CLVitals';
import { CLDiagnosisPicker } from './screens/CLDiagnosisPicker';
import { CLNewLabOrder } from './screens/CLNewLabOrder';
import { CLPrescription } from './screens/CLPrescription';
import { CLVisitReview } from './screens/CLVisitReview';
import { CLVisitCompleted } from './screens/CLVisitCompleted';
import { CLOrderSubmitted } from './screens/CLOrderSubmitted';
import { CLPrescriptionSubmitted } from './screens/CLPrescriptionSubmitted';
import { CLLabResult } from './screens/CLLabResult';
import { CLLabResultPrint } from './screens/CLLabResultPrint';
import { CLTransferReferral } from './screens/CLTransferReferral';

/* ── Lab Technician ── */
import { LTWorklist } from './screens/LTWorklist';
import { LTOrderDetail } from './screens/LTOrderDetail';
import { LTCollectSample } from './screens/LTCollectSample';
import { LTResultEntry } from './screens/LTResultEntry';
import { LTReviewRelease } from './screens/LTReviewRelease';
import { LTRejectRecollect } from './screens/LTRejectRecollect';
import { LTCompleted } from './screens/LTCompleted';
import { LTCompletedDetail } from './screens/LTCompletedDetail';
import { LTMore } from './screens/LTMore';
import { LTQCLog } from './screens/LTQCLog';
import { LTTodaySummary } from './screens/LTTodaySummary';
import { LTLabWorksheet } from './screens/LTLabWorksheet';

/* ── Pharmacist ── */
import { PHQueue } from './screens/PHQueue';
import { PHRxDetail } from './screens/PHRxDetail';
import { PHDispense } from './screens/PHDispense';
import { PHVerifyRelease } from './screens/PHVerifyRelease';
import { PHDispenseConfirm } from './screens/PHDispenseConfirm';
import { PHCompleted } from './screens/PHCompleted';
import { PHCompletedDetail } from './screens/PHCompletedDetail';
import { PHMore } from './screens/PHMore';
import { PHTodaySummary } from './screens/PHTodaySummary';
import { PHPaymentCoverage } from './screens/PHPaymentCoverage';
import { PHStockHandling } from './screens/PHStockHandling';
import { PHInventoryHome } from './screens/PHInventoryHome';
import { PHItemDetail } from './screens/PHItemDetail';
import { PHAdjustStock } from './screens/PHAdjustStock';
import { PHReceiveStock } from './screens/PHReceiveStock';
import { PHOtcDetail } from './screens/PHOtcDetail';
import { PHOtcPrepare } from './screens/PHOtcPrepare';

/* ── Nurse ── */
import { NUQueue } from './screens/NUQueue';
import { NUPatientTriage } from './screens/NUPatientTriage';
import { NUCaptureVitals } from './screens/NUCaptureVitals';
import { NUNursingNotes } from './screens/NUNursingNotes';
import { NUTransferPatient } from './screens/NUTransferPatient';
import { NUMarkReady } from './screens/NUMarkReady';
import { NURooms } from './screens/NURooms';
import { NUUpdateRoom } from './screens/NUUpdateRoom';
import { NUMore } from './screens/NUMore';
import { NUTodaySummary } from './screens/NUTodaySummary';

/* ── Accountant ── */
import { ACOverview } from './screens/ACOverview';
import { ACTransactions } from './screens/ACTransactions';
import { ACTransactionDetail } from './screens/ACTransactionDetail';
import { ACSettlements } from './screens/ACSettlements';
import { ACSettlementDetail } from './screens/ACSettlementDetail';
import { ACMore } from './screens/ACMore';
import { ACReports } from './screens/ACReports';
import { ACDailySummary } from './screens/ACDailySummary';
import { ACReconcileCash } from './screens/ACReconcileCash';
import { ACRefundRequest } from './screens/ACRefundRequest';
import { ACRefundsDisputes } from './screens/ACRefundsDisputes';
import { ACRefundDisputeDetail } from './screens/ACRefundDisputeDetail';
import { ACReportsExports } from './screens/ACReportsExports';
import { ACReportDetail } from './screens/ACReportDetail';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      /* ══════════════ Onboarding ══════════════ */
      {
        path: '/',
        Component: InviteLanding,
      },
      {
        path: '/otp-verification',
        Component: OTPVerification,
      },
      {
        path: '/create-pin',
        Component: CreatePin,
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/setup-wizard',
        Component: SetupWizard,
      },
      {
        path: '/setup-wizard-flow',
        Component: SetupWizardFlow,
      },

      /* ══════════════ Staff sign-in flow ══════════════ */
      {
        path: '/staff-sign-in',
        Component: StaffSignIn,
      },
      {
        path: '/staff-otp-verification',
        Component: StaffOTPVerification,
      },
      {
        path: '/staff-enter-pin',
        Component: StaffEnterPin,
      },
      {
        path: '/staff-reset-pin',
        Component: StaffResetPin,
      },
      {
        path: '/role-router',
        Component: RoleRouter,
      },

      /* ══════════════ Facility Admin ══════════════ */
      {
        path: '/dashboard',
        Component: Dashboard,
      },
      {
        path: '/clinic-dashboard',
        Component: ClinicDashboard,
      },
      {
        path: '/staff-list',
        Component: StaffList,
      },
      {
        path: '/invite-staff',
        Component: InviteStaff,
      },
      {
        path: '/staff/:staffId',
        Component: StaffDetail,
      },
      {
        path: '/services-list',
        Component: ServicesList,
      },
      {
        path: '/add-service',
        Component: AddService,
      },
      {
        path: '/edit-service/:serviceId',
        Component: EditService,
      },
      {
        path: '/operating-hours',
        Component: OperatingHours,
      },
      {
        path: '/blackout-dates',
        Component: BlackoutDates,
      },
      {
        path: '/add-blackout-date',
        Component: AddBlackoutDate,
      },
      {
        path: '/capacity-rules',
        Component: CapacityRules,
      },
      {
        path: '/bookings-list',
        Component: BookingsList,
      },
      {
        path: '/booking-detail/:bookingId',
        Component: BookingDetail,
      },
      {
        path: '/reassign-staff/:bookingId',
        Component: ReassignStaff,
      },
      {
        path: '/cancel-booking/:bookingId',
        Component: CancelBooking,
      },
      {
        path: '/finance-overview',
        Component: FinanceOverview,
      },
      {
        path: '/transactions-list',
        Component: TransactionsList,
      },
      {
        path: '/transaction-detail/:transactionId',
        Component: TransactionDetail,
      },
      {
        path: '/settlement-ledger',
        Component: SettlementLedger,
      },
      {
        path: '/settlement-detail/:settlementId',
        Component: SettlementDetail,
      },
      {
        path: '/reports-home',
        Component: ReportsHome,
      },
      {
        path: '/report-viewer/:reportId',
        Component: ReportViewer,
      },
      {
        path: '/schedule-reports',
        Component: ScheduleReports,
      },
      {
        path: '/visits-summary',
        Component: VisitsSummary,
      },

      /* ══════════════ Shared settings / support ══════════════ */
      {
        path: '/settings',
        Component: Settings,
      },
      {
        path: '/profile-settings',
        Component: ProfileSettings,
      },
      {
        path: '/security-and-pin',
        Component: SecurityAndPin,
      },
      {
        path: '/change-pin',
        Component: ChangePin,
      },
      {
        path: '/reset-pin',
        Component: ResetPin,
      },
      {
        path: '/notification-settings',
        Component: NotificationSettings,
      },
      {
        path: '/payment-methods',
        Component: PaymentMethods,
      },
      {
        path: '/privacy-policy',
        Component: PrivacyPolicy,
      },
      {
        path: '/clinic-information',
        Component: ClinicInformation,
      },
      {
        path: '/update-map-pin',
        Component: UpdateMapPin,
      },
      {
        path: '/preview-listing',
        Component: PreviewListing,
      },
      {
        path: '/audit-logs',
        Component: AuditLogs,
      },
      {
        path: '/audit-log-detail/:logId',
        Component: AuditLogDetail,
      },
      {
        path: '/help-center',
        Component: HelpCenter,
      },
      {
        path: '/faq-category/:categoryId',
        Component: FAQCategory,
      },
      {
        path: '/help-article/:articleId',
        Component: HelpArticle,
      },
      {
        path: '/tests-catalog',
        Component: TestsCatalog,
      },
      {
        path: '/create-ticket',
        Component: CreateTicket,
      },
      {
        path: '/tickets-list',
        Component: TicketsList,
      },
      {
        path: '/ticket-detail/:ticketId',
        Component: TicketDetail,
      },
      {
        path: '/notifications',
        Component: Notifications,
      },

      /* ══════════════ Receptionist /r/ ══════════════ */
      {
        path: '/r/dashboard',
        Component: ReceptionistDashboard,
      },
      {
        path: '/r/today',
        Component: RToday,
      },
      {
        path: '/r/bookings',
        Component: RBookings,
      },
      {
        path: '/r/bookings/:bookingId',
        Component: RBookingDetail,
      },
      {
        path: '/r/bookings/:bookingId/propose-time',
        Component: RProposeTime,
      },
      {
        path: '/r/bookings/:bookingId/decline',
        Component: RDeclineBooking,
      },
      {
        path: '/r/queue',
        Component: RQueue,
      },
      {
        path: '/r/queue-detail/:queueId',
        Component: RQueueDetail,
      },
      {
        path: '/r/check-in/:patientId',
        Component: RCheckIn,
      },
      {
        path: '/r/payments',
        Component: RPayments,
      },
      {
        path: '/r/more',
        Component: RMore,
      },
      {
        path: '/r/walk-in',
        Component: RWalkIn,
      },
      {
        path: '/r/walk-in/verify',
        Component: RMemberVerify,
      },
      {
        path: '/r/walk-in/results',
        Component: RMemberResults,
      },
      {
        path: '/r/walk-in/register',
        Component: RRegisterNonMember,
      },
      {
        path: '/r/walk-in/intake',
        Component: RVisitIntake,
      },
      {
        path: '/r/walk-in/queued',
        Component: RAddedToQueue,
      },
      {
        path: '/r/schedule',
        Component: RSchedule,
      },
      {
        path: '/r/schedule/:scheduleId',
        Component: RScheduleDetail,
      },
      {
        path: '/r/more/patients',
        Component: RPatients,
      },
      {
        path: '/r/more/patients/add',
        Component: RAddPatient,
      },
      {
        path: '/r/more/patients/:patientId',
        Component: RPatientProfile,
      },
      {
        path: '/r/more/patients/:patientId/edit',
        Component: REditPatient,
      },
      {
        path: '/r/more/patients/:patientId/dependents',
        Component: RDependents,
      },
      {
        path: '/r/patient-info/:patientId',
        Component: RPatientInfo,
      },
      {
        path: '/r/more/end-of-day',
        Component: REndOfDaySummary,
      },
      /* ── Payments flow (R-41 → R-44) ── */
      {
        path: '/r/payments/billing/:paymentId',
        Component: RBillingSummary,
      },
      {
        path: '/r/payments/collect/:paymentId',
        Component: RCollectPayment,
      },
      {
        path: '/r/collect-payment/:paymentId',
        Component: RCollectPayment,
      },
      {
        path: '/r/payments/receipt/:paymentId',
        Component: RReceipt,
      },
      {
        path: '/r/payments/failed/:paymentId',
        Component: RPaymentFailed,
      },

      /* ══════════════ Clinician (Doctor) /cl/ ══════════════ */
      {
        path: '/cl/home',
        Component: CLHome,
      },
      {
        path: '/cl/queue',
        Component: CLQueue,
      },
      {
        path: '/cl/orders',
        Component: CLOrders,
      },
      {
        path: '/cl/orders/:orderId',
        Component: CLOrderDetail,
      },
      {
        path: '/cl/orders/new-lab/:visitId',
        Component: CLNewLabOrder,
      },
      {
        path: '/cl/orders/prescription/:visitId',
        Component: CLPrescription,
      },
      {
        path: '/cl/orders/submitted/:visitId',
        Component: CLOrderSubmitted,
      },
      {
        path: '/cl/orders/rx-submitted/:visitId',
        Component: CLPrescriptionSubmitted,
      },
      {
        path: '/cl/patients',
        Component: CLPatients,
      },
      {
        path: '/cl/patients/:patientId',
        Component: CLPatientProfile,
      },
      {
        path: '/cl/more',
        Component: CLMore,
      },
      {
        path: '/cl/dashboard',
        Component: CLDashboard,
      },
      {
        path: '/cl/schedule',
        Component: CLSchedule,
      },
      {
        path: '/cl/appointment/:appointmentId',
        Component: CLAppointmentDetail,
      },
      {
        path: '/cl/today-summary',
        Component: CLTodaySummary,
      },
      {
        path: '/cl/note-templates',
        Component: CLNoteTemplates,
      },
      {
        path: '/cl/template/:templateId',
        Component: CLTemplateDetail,
      },
      {
        path: '/cl/quick-phrases',
        Component: CLManageQuickPhrases,
      },
      {
        path: '/cl/visit/:visitId',
        Component: CLVisitSummary,
      },
      {
        path: '/cl/consult/:visitId',
        Component: CLConsult,
      },
      {
        path: '/cl/vitals/:visitId',
        Component: CLVitals,
      },
      {
        path: '/cl/diagnosis/:visitId',
        Component: CLDiagnosisPicker,
      },
      {
        path: '/cl/review/:visitId',
        Component: CLVisitReview,
      },
      {
        path: '/cl/completed/:visitId',
        Component: CLVisitCompleted,
      },
      {
        path: '/cl/lab-result/:labId',
        Component: CLLabResult,
      },
      {
        path: '/cl/lab-result/:labId/print',
        Component: CLLabResultPrint,
      },
      {
        path: '/cl/transfer/:visitId',
        Component: CLTransferReferral,
      },

      /* ══════════════ Lab Technician /lt/ ══════════════ */
      {
        path: '/lt/worklist',
        Component: LTWorklist,
      },
      {
        path: '/lt/order/:orderId',
        Component: LTOrderDetail,
      },
      {
        path: '/lt/collect/:orderId',
        Component: LTCollectSample,
      },
      {
        path: '/lt/result-entry/:orderId',
        Component: LTResultEntry,
      },
      {
        path: '/lt/review/:orderId',
        Component: LTReviewRelease,
      },
      {
        path: '/lt/reject-recollect/:orderId',
        Component: LTRejectRecollect,
      },
      {
        path: '/lt/completed',
        Component: LTCompleted,
      },
      {
        path: '/lt/completed-detail/:orderId',
        Component: LTCompletedDetail,
      },
      {
        path: '/lt/more',
        Component: LTMore,
      },
      {
        path: '/lt/qc-log',
        Component: LTQCLog,
      },
      {
        path: '/lt/today-summary',
        Component: LTTodaySummary,
      },
      {
        path: '/lt/lab-worksheet',
        Component: LTLabWorksheet,
      },

      /* ══════════════ Pharmacist /ph/ ══════════════ */
      {
        path: '/ph/queue',
        Component: PHQueue,
      },
      {
        path: '/ph/rx/:rxId',
        Component: PHRxDetail,
      },
      {
        path: '/ph/dispense/:rxId',
        Component: PHDispense,
      },
      {
        path: '/ph/verify/:rxId',
        Component: PHVerifyRelease,
      },
      {
        path: '/ph/dispense-confirm/:rxId',
        Component: PHDispenseConfirm,
      },
      {
        path: '/ph/completed',
        Component: PHCompleted,
      },
      {
        path: '/ph/completed-detail/:rxId',
        Component: PHCompletedDetail,
      },
      {
        path: '/ph/more',
        Component: PHMore,
      },
      {
        path: '/ph/today-summary',
        Component: PHTodaySummary,
      },
      {
        path: '/ph/payment-coverage/:rxId',
        Component: PHPaymentCoverage,
      },
      {
        path: '/ph/stock-handling/:rxId',
        Component: PHStockHandling,
      },
      {
        path: '/ph/inventory',
        Component: PHInventoryHome,
      },
      {
        path: '/ph/inventory/receive',
        Component: PHReceiveStock,
      },
      {
        path: '/ph/inventory/adjust/:itemId',
        Component: PHAdjustStock,
      },
      {
        path: '/ph/inventory/:itemId',
        Component: PHItemDetail,
      },
      {
        path: '/ph/otc/:orderId',
        Component: PHOtcDetail,
      },
      {
        path: '/ph/otc-prepare/:orderId',
        Component: PHOtcPrepare,
      },

      /* ══════════════ Nurse /nu/ ══════════════ */
      {
        path: '/nu/queue',
        Component: NUQueue,
      },
      {
        path: '/nu/triage/:patientId',
        Component: NUPatientTriage,
      },
      {
        path: '/nu/vitals/:patientId',
        Component: NUCaptureVitals,
      },
      {
        path: '/nu/notes/:patientId',
        Component: NUNursingNotes,
      },
      {
        path: '/nu/transfer/:patientId',
        Component: NUTransferPatient,
      },
      {
        path: '/nu/mark-ready/:patientId',
        Component: NUMarkReady,
      },
      {
        path: '/nu/rooms',
        Component: NURooms,
      },
      {
        path: '/nu/room/:roomId',
        Component: NUUpdateRoom,
      },
      {
        path: '/nu/more',
        Component: NUMore,
      },
      {
        path: '/nu/today-summary',
        Component: NUTodaySummary,
      },

      /* ══════════════ Accountant /ac/ ══════════════ */
      {
        path: '/ac/overview',
        Component: ACOverview,
      },
      {
        path: '/ac/transactions',
        Component: ACTransactions,
      },
      {
        path: '/ac/transaction/:txId',
        Component: ACTransactionDetail,
      },
      {
        path: '/ac/settlements',
        Component: ACSettlements,
      },
      {
        path: '/ac/settlement/:settlementId',
        Component: ACSettlementDetail,
      },
      {
        path: '/ac/more',
        Component: ACMore,
      },
      {
        path: '/ac/reports',
        Component: ACReports,
      },
      {
        path: '/ac/daily-summary',
        Component: ACDailySummary,
      },
      {
        path: '/ac/reconcile-cash',
        Component: ACReconcileCash,
      },
      {
        path: '/ac/refund-request/:txId',
        Component: ACRefundRequest,
      },
      {
        path: '/ac/refunds-disputes',
        Component: ACRefundsDisputes,
      },
      {
        path: '/ac/refund-dispute/:requestId',
        Component: ACRefundDisputeDetail,
      },
      {
        path: '/ac/reports-exports',
        Component: ACReportsExports,
      },
      {
        path: '/ac/report/:reportId',
        Component: ACReportDetail,
      },
    ],
  },
]);