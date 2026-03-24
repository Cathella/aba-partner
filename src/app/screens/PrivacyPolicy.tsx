import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  FileText,
  Download,
  MessageCircle,
  ChevronUp,
  Shield,
  Database,
  Users,
  Lock,
  Clock,
  FileCheck,
  UserCheck,
  Mail,
} from 'lucide-react';

const sections = [
  { id: 'what-we-collect', title: 'What data we collect', icon: Database },
  { id: 'how-we-use', title: 'How we use data', icon: FileCheck },
  { id: 'data-sharing', title: 'Data sharing', icon: Users },
  { id: 'security', title: 'Security', icon: Lock },
  { id: 'data-retention', title: 'Data retention', icon: Clock },
  { id: 'facility-responsibilities', title: 'Your responsibilities as a facility', icon: Shield },
  { id: 'patient-consent', title: 'Patient consent', icon: UserCheck },
  { id: 'contact', title: 'Contact & support', icon: Mail },
];

export function PrivacyPolicy() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowScrollTop(contentRef.current.scrollTop > 300);
      }
    };
    
    const element = contentRef.current;
    element?.addEventListener('scroll', handleScroll);
    return () => element?.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element && contentRef.current) {
      const topPos = element.offsetTop - 80;
      contentRef.current.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  };
  
  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDownloadPDF = () => {
    showToast('Privacy Policy PDF saved to Downloads', 'success');
  };
  
  const handleContactSupport = () => {
    navigate('/help-center');
  };
  
  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Privacy Policy"
        showBack
        onBackClick={() => navigate('/settings')}
      />
      
      {/* Main Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header Block */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-aba-primary-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-aba-primary-main" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600 mb-1">Last updated: Feb 2026</p>
                <p className="text-sm text-aba-neutral-700">
                  This policy explains how ABA Partner handles clinic and patient data.
                </p>
              </div>
            </div>
          </div>
          
          {/* Table of Contents */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-aba-neutral-900 mb-3">
              Table of Contents
            </h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-aba-neutral-50 transition-colors flex items-center gap-2 group"
                >
                  <span className="text-xs font-medium text-aba-neutral-500 w-6">
                    {index + 1}.
                  </span>
                  <span className="text-sm text-aba-secondary-main group-hover:text-aba-secondary-600 font-medium flex-1">
                    {section.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Policy Content */}
          <div className="space-y-4">
            {/* Section 1: What data we collect */}
            <div id="what-we-collect" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  1. What data we collect
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>We collect and process the following types of data:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Clinic details (name, location, contact information, operating hours)</li>
                  <li>Staff accounts (names, roles, contact details, permissions)</li>
                  <li>Service catalog (service types, pricing, availability)</li>
                  <li>Booking and visit records (appointment details, patient information, status)</li>
                  <li>Payment logs (transaction amounts, methods, timestamps, settlement data)</li>
                </ul>
                <p className="mt-3">
                  This data is necessary to provide core clinic management and booking services through the ABA Partner platform.
                </p>
              </div>
            </div>
            
            {/* Section 2: How we use data */}
            <div id="how-we-use" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  2. How we use data
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>We use the collected data for the following purposes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Care operations:</strong> Facilitate appointment booking, scheduling, and patient visit management
                  </li>
                  <li>
                    <strong>Billing & payments:</strong> Process payments, manage invoices, and track financial transactions
                  </li>
                  <li>
                    <strong>Settlement:</strong> Transfer funds to your clinic's designated settlement account
                  </li>
                  <li>
                    <strong>Reporting:</strong> Generate insights, analytics, and compliance reports for your clinic
                  </li>
                  <li>
                    <strong>Audit trail:</strong> Maintain comprehensive logs of system activities for security and compliance
                  </li>
                </ul>
                <p className="mt-3">
                  All data usage is strictly limited to providing and improving the ABA Partner service.
                </p>
              </div>
            </div>
            
            {/* Section 3: Data sharing */}
            <div id="data-sharing" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  3. Data sharing
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>We share data with the following ABA ecosystem services:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>AbaAccess:</strong> For booking discovery, member verification, and appointment coordination
                  </li>
                  <li>
                    <strong>AbaWallet:</strong> For secure payment processing and transaction management
                  </li>
                  <li>
                    <strong>ABA Ops:</strong> For technical support, compliance monitoring, and operational assistance
                  </li>
                </ul>
                <div className="bg-aba-success-50 border border-aba-success-main/20 rounded-xl p-3 mt-3">
                  <p className="font-semibold text-aba-neutral-900">We do not sell personal data.</p>
                  <p className="text-xs mt-1">
                    Your data is only shared within the ABA ecosystem to deliver services and never sold to third parties.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Section 4: Security */}
            <div id="security" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  4. Security
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>We implement industry-standard security measures to protect your data:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Role-based access control:</strong> Staff members can only access data appropriate to their role
                  </li>
                  <li>
                    <strong>Audit logs:</strong> All system activities are logged and monitored for suspicious behavior
                  </li>
                  <li>
                    <strong>Encryption in transit:</strong> Data is encrypted using TLS/SSL during transmission
                  </li>
                  <li>
                    <strong>Encryption at rest:</strong> Sensitive data is encrypted when stored in our databases
                  </li>
                  <li>
                    <strong>PIN protection:</strong> Critical actions require PIN verification to prevent unauthorized access
                  </li>
                </ul>
                <p className="mt-3">
                  Despite our best efforts, no system is completely secure. Please report any security concerns to our support team immediately.
                </p>
              </div>
            </div>
            
            {/* Section 5: Data retention */}
            <div id="data-retention" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  5. Data retention
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>We retain operational data for defined periods:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Booking and visit records:</strong> Retained for 7 years for medical and compliance purposes
                  </li>
                  <li>
                    <strong>Financial transactions:</strong> Retained for 7 years for tax and audit requirements
                  </li>
                  <li>
                    <strong>Audit logs:</strong> Retained for 3 years for security and compliance monitoring
                  </li>
                  <li>
                    <strong>Staff accounts:</strong> Retained while active, archived after account deactivation
                  </li>
                </ul>
                <p className="mt-3">
                  Retention periods are configurable and may be adjusted based on local regulations and your clinic's requirements. Contact ABA Ops for custom retention policies.
                </p>
              </div>
            </div>
            
            {/* Section 6: Facility responsibilities */}
            <div id="facility-responsibilities" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  6. Your responsibilities as a facility
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>As a clinic using ABA Partner, you are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>PIN security:</strong> Keep staff PINs confidential and secure. Do not share PINs.
                  </li>
                  <li>
                    <strong>Access management:</strong> Assign appropriate roles and permissions to staff members
                  </li>
                  <li>
                    <strong>Consent collection:</strong> Obtain necessary patient consent before collecting or processing data
                  </li>
                  <li>
                    <strong>Local compliance:</strong> Comply with local healthcare regulations, data protection laws, and privacy requirements
                  </li>
                  <li>
                    <strong>Data accuracy:</strong> Ensure that clinic and patient information is accurate and up-to-date
                  </li>
                  <li>
                    <strong>Incident reporting:</strong> Report any suspected security breaches or data incidents to ABA Ops immediately
                  </li>
                </ul>
                <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 mt-3">
                  <p className="font-semibold text-aba-neutral-900 text-xs">Important:</p>
                  <p className="text-xs mt-1">
                    Violations of these responsibilities may result in account suspension or termination.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Section 7: Patient consent */}
            <div id="patient-consent" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  7. Patient consent
                </h3>
              </div>
              <div className="space-y-2 text-sm text-aba-neutral-700">
                <p>
                  Patient consent is a critical component of ethical healthcare data management.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Facilities should obtain and record patient consent where required by local regulations
                  </li>
                  <li>
                    The ABA Partner system may store consent logs and timestamps for audit purposes
                  </li>
                  <li>
                    Patients have the right to access, correct, or request deletion of their personal data
                  </li>
                  <li>
                    Consent can be withdrawn at any time; contact ABA Ops to process patient data requests
                  </li>
                </ul>
                <p className="mt-3">
                  Facilities are responsible for ensuring that patient consent is obtained in accordance with applicable laws and regulations.
                </p>
              </div>
            </div>
            
            {/* Section 8: Contact & support */}
            <div id="contact" className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  8. Contact & support
                </h3>
              </div>
              <div className="space-y-3 text-sm text-aba-neutral-700">
                <p>
                  If you have questions about this Privacy Policy or need assistance with data management, please contact us:
                </p>
                
                <div className="bg-aba-neutral-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-aba-neutral-600" />
                    <div>
                      <p className="text-xs text-aba-neutral-600">Email</p>
                      <a
                        href="mailto:support@aba.health"
                        className="text-sm font-medium text-aba-secondary-main hover:text-aba-secondary-600"
                      >
                        support@aba.health
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-aba-neutral-600" />
                    <div>
                      <p className="text-xs text-aba-neutral-600">Phone (Uganda)</p>
                      <a
                        href="tel:+256700000000"
                        className="text-sm font-medium text-aba-secondary-main hover:text-aba-secondary-600"
                      >
                        +256 700 000 000
                      </a>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-aba-neutral-600">
                  For urgent security or privacy concerns, please use the priority support channel through the Help Center.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="space-y-3">
              <ABAButton
                variant="outline"
                size="md"
                fullWidth
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </ABAButton>
              
              <ABAButton
                variant="primary"
                size="md"
                fullWidth
                onClick={handleContactSupport}
              >
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </ABAButton>
            </div>
          </div>
          
          {/* Bottom Spacing */}
          <div className="h-4" />
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 w-12 h-12 bg-aba-primary-main text-white rounded-full shadow-lg flex items-center justify-center hover:bg-aba-primary-600 transition-all z-10"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}