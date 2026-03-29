# ABA Partner

ABA Partner is a facility-side application that enables clinics, laboratories, and pharmacies to deliver healthcare services seamlessly through the ABA ecosystem.

It connects with **AbaAccess (member app)** to support real-time, consent-based service delivery and package redemption.

---

## 🌍 Overview

ABA Partner is designed for healthcare providers to:

- Manage patient flow across departments
- Initiate and process service requests
- Verify and apply healthcare package coverage
- Deliver care with transparency and efficiency

It acts as the **operational backbone** of the ABA ecosystem.

---

## 🎯 Problem

Healthcare facilities face challenges such as:

- Fragmented workflows across departments
- Manual verification of patient eligibility
- Lack of visibility into patient coverage
- Inefficient billing and reconciliation
- Poor coordination between consultation, lab, and pharmacy

---

## 💡 Solution

ABA Partner introduces a **structured, station-based workflow** integrated with **AbaAccess**:

- Facilities initiate service requests
- Patients approve requests via PIN in AbaAccess
- The system applies the most appropriate package automatically
- Services are delivered across stations (Consultation → Lab → Pharmacy)
- Payments are handled via coverage or out-of-pocket

---

## 🧩 Core Features

### 🏥 Facility Workflow Management
- Role-based access:
  - Reception
  - Nurse
  - Doctor
  - Laboratory Technician
  - Pharmacist
  - Finance/Admin
- Structured patient flow across service points

---

### 👥 Patient Identification
- Search patient using:
  - ABA Member ID
  - Phone number
- View basic patient details and dependents

---

### ✅ Approval Requests
- Initiate service requests (Consultation, Lab, Pharmacy)
- Send approval request to patient’s AbaAccess app
- Track approval status:
  - Pending
  - Approved
  - Declined
- Support remote approvals (e.g., caregiver scenarios)

---

### 🔄 Station-Based Care Flow
- Transfer patients between:
  - Consultation
  - Laboratory
  - Pharmacy
- Coverage is applied at each transfer point
- Ensures accurate tracking of service usage

---

### 📦 Package Coverage Engine
- View patient’s active packages
- Automatically apply the most relevant package
- Handle:
  - Fully covered services
  - Partially covered services
  - Out-of-pocket fallback

---

### 💰 Billing & Payments
- Generate payment summaries
- Distinguish between:
  - Covered services
  - Discounts applied
  - Out-of-pocket charges
- Track transaction references

---

### 📊 Reporting & Monitoring (MVP)
- View daily activity
- Track approvals and completed services
- Basic financial summaries

---

## 🔄 How It Works

1. Patient arrives at facility
2. Reception identifies patient (ABA Member ID / phone)
3. Facility initiates service request
4. Patient approves request via PIN in AbaAccess
5. Approval status updates in ABA Partner
6. Patient is transferred across stations as needed
7. System applies package coverage
8. Facility completes service and records transaction

---

## 🧠 Key Concepts

- **Consent-first:** No service proceeds without patient approval
- **Station-based model:** Each department operates as a controlled step
- **Real-time sync:** Approval and coverage status update dynamically
- **Flexible payments:** Supports both package coverage and out-of-pocket

---

## 🛠️ Tech Stack (Suggested)

- **Frontend:** React + TypeScript
- **UI Components:** Kendo React / Custom Design System
- **State Management:** React Query / Redux Toolkit
- **Backend:** Node.js / .NET / Firebase
- **Database:** PostgreSQL / Firestore
- **Authentication:** Role-based access control (RBAC)
- **Integration:** AbaAccess APIs for approvals, packages, and transactions

---

## 👤 User Roles

| Role            | Responsibilities                          |
|-----------------|-------------------------------------------|
| Reception       | Patient check-in, identification          |
| Nurse           | Triage, patient routing                   |
| Doctor          | Consultation and diagnosis                |
| Lab Technician  | Test requests and results                 |
| Pharmacist      | Medication dispensing                     |
| Finance/Admin   | Payments, reporting, reconciliation       |
| Facility Admin  | Setup, user management, configuration     |

---

## 🚀 Project Status

- ✅ MVP prototype completed
- 🔄 Integration with AbaAccess in progress
- ⏳ Pilot rollout preparation (Kampala & Wakiso)

---

## 🧪 Pilot Plan

- **Location:** Kampala & Wakiso
- **Facilities:** Clinics, Labs, Pharmacies
- **Focus:**
  - Workflow validation
  - Approval efficiency
  - Coverage accuracy

---

## 📊 Success Metrics

- Approval success rate
- Average approval time
- Service completion rate
- Reduction in manual verification
- Staff usability and adoption
- Revenue and reconciliation accuracy

---

## 🔐 Security & Compliance

- Role-based access control
- Secure communication with AbaAccess
- Minimal exposure of patient data
- Audit trail for approvals and transactions

---

## 🤝 Contributing

ABA Partner is currently in early-stage development. Feedback from healthcare providers, developers, and product designers is highly encouraged.

---

## 📬 Contact

**Nakitto Catherine**  
Founder & Product Designer  
📍 Kampala, Uganda  

---

## 📌 Vision

To empower healthcare facilities with tools that make service delivery **efficient, transparent, and patient-centered**, while seamlessly integrating with digital health access systems.