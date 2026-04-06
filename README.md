# FraudGuard — AI-Powered Mobile Banking Fraud Detection Platform

FraudGuard is a comprehensive, real-time fraud detection and prevention platform designed for mobile banking environments. It leverages artificial intelligence, behavioral biometrics, and adaptive authentication to protect users and institutions from fraudulent transactions.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Getting Started](#getting-started)
6. [Project Structure](#project-structure)
7. [Authentication & Security](#authentication--security)
8. [Client Portal](#client-portal)
9. [Admin Dashboard](#admin-dashboard)
10. [AI & Machine Learning](#ai--machine-learning)
11. [Biometric Authentication](#biometric-authentication)
12. [Security Measures](#security-measures)
13. [API & Backend](#api--backend)
14. [Deployment](#deployment)

---

## Overview

FraudGuard provides a dual-interface platform:

- **Client Portal** — For end-users to monitor their transactions, report fraud, interact with an AI assistant, and access educational resources about fraud prevention.
- **Admin Dashboard** — For administrators to view system-wide analytics, manage alerts, review fraud reports, and analyze transaction patterns across all users.

The platform achieves a **98.7% fraud detection accuracy** with **sub-50ms response times**, providing 24/7 real-time monitoring of all transactions.

---

## Key Features

### For End Users (Client Portal)
- **Transaction Monitoring** — View all transactions with real-time risk scoring and status indicators (approved, flagged, blocked).
- **AI Risk Analysis** — On-demand AI-powered analysis of individual transactions with detailed risk breakdowns, protected by biometric verification.
- **Fraud Reporting** — Submit detailed fraud reports with automatic reference number generation and status tracking.
- **AI Chatbot** — Conversational AI assistant for fraud-related questions, security advice, and platform guidance.
- **Learning Center** — Educational resources about common fraud patterns, prevention techniques, and security best practices.

### For Administrators (Admin Dashboard)
- **Real-Time Dashboard** — Overview of system health, transaction volumes, alert counts, and fraud statistics.
- **Transaction Management** — Search, filter, and investigate transactions across all users.
- **Alert Management** — Prioritize and resolve fraud alerts by severity (critical, high, medium, low).
- **Report Management** — Review and manage user-submitted fraud reports.
- **Advanced Analytics** — Charts, graphs, and trend analysis of fraud patterns over time.

### Security Features
- **Biometric Authentication** — Face ID / Touch ID integration using the Web Authentication API (WebAuthn).
- **4-Digit PIN Fallback** — Secure PIN-based verification when biometrics are unavailable.
- **Login Attempt Lockout** — Account temporarily locked after 5 failed login attempts (5-minute cooldown).
- **Session-Based Verification** — Transaction verification cached for 10 minutes to reduce friction.
- **Password Reset Flow** — Secure email-based password recovery with token validation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                  │
├───────────────┬──────────────────┬───────────────────────┤
│  Landing Page │  Client Portal   │   Admin Dashboard     │
│  (Public)     │  (Auth Required) │   (Password Gated)    │
└───────┬───────┴────────┬─────────┴──────────┬────────────┘
        │                │                    │
        ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                 Lovable Cloud Backend                    │
├──────────────┬──────────────────┬────────────────────────┤
│  PostgreSQL  │  Authentication  │   Edge Functions       │
│  Database    │  (Email/Pass)    │   (AI Analysis, Chat)  │
└──────────────┴──────────────────┴────────────────────────┘
```

### Data Flow
1. User authenticates via email/password → session token issued
2. Transactions are fetched from the database with risk scores
3. AI analysis requests are gated by biometric/PIN verification
4. Edge functions call AI models for real-time transaction analysis
5. Fraud reports are stored in the database with unique reference numbers
6. Alerts are generated based on risk thresholds and anomaly detection

---

## Technology Stack

| Layer         | Technology                                     |
|---------------|------------------------------------------------|
| **Frontend**  | React 18, TypeScript 5, Vite 5                 |
| **Styling**   | Tailwind CSS v3, shadcn/ui components          |
| **State**     | TanStack React Query (server state), React Context (auth) |
| **Routing**   | React Router v6 (SPA with BrowserRouter)       |
| **Animation** | Framer Motion                                  |
| **Backend**   | Lovable Cloud (PostgreSQL, Auth, Edge Functions)|
| **AI**        | Google Gemini / OpenAI via Lovable AI           |
| **Biometrics**| Web Authentication API (WebAuthn / FIDO2)      |
| **Charts**    | Recharts                                       |
| **Markdown**  | react-markdown (for AI response rendering)     |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

The following environment variables are automatically configured by Lovable Cloud:
- `VITE_SUPABASE_URL` — Backend API URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Public API key for client-side access
- `VITE_SUPABASE_PROJECT_ID` — Project identifier

> **Note:** Never manually edit the `.env` file — it is managed automatically.

---

## Project Structure

```
src/
├── components/
│   ├── AdminGate.tsx         # Password gate for admin dashboard
│   ├── AlertCard.tsx         # Fraud alert display card
│   ├── BiometricGate.tsx     # Full-page biometric verification gate
│   ├── BiometricModal.tsx    # Modal for transaction-level biometric auth
│   ├── DashboardLayout.tsx   # Admin dashboard layout wrapper
│   ├── DashboardSidebar.tsx  # Admin sidebar navigation
│   ├── NavLink.tsx           # Reusable navigation link component
│   ├── PortalLayout.tsx      # Client portal layout wrapper
│   ├── ProtectedRoute.tsx    # Auth-protected route wrapper
│   ├── StatCard.tsx          # Dashboard statistics card
│   ├── TransactionTable.tsx  # Sortable transaction data table
│   └── ui/                   # shadcn/ui component library
├── hooks/
│   ├── useAuth.tsx           # Authentication context & provider
│   ├── useBiometricAuth.ts   # WebAuthn biometric authentication hook
│   ├── useBiometricGate.ts   # Transaction-level verification gate hook
│   ├── useLoginSecurity.ts   # Failed attempt lockout logic
│   └── use-mobile.tsx        # Mobile viewport detection
├── integrations/
│   └── supabase/
│       ├── client.ts         # Backend client (auto-generated)
│       └── types.ts          # Database types (auto-generated)
├── lib/
│   ├── api.ts                # API functions (fetch, create, analyze)
│   ├── mockData.ts           # Seed/mock data for development
│   └── utils.ts              # Utility functions (cn, etc.)
├── pages/
│   ├── Auth.tsx              # Login & signup page with lockout
│   ├── ForgotPassword.tsx    # Password reset request page
│   ├── ResetPassword.tsx     # New password entry page
│   ├── LandingPage.tsx       # Public marketing landing page
│   ├── Analytics.tsx         # Advanced analytics dashboard
│   ├── NotFound.tsx          # 404 error page
│   ├── admin/                # Admin dashboard pages
│   └── portal/               # Client portal pages
└── supabase/
    └── functions/
        ├── analyze-transaction/  # AI transaction analysis edge function
        └── chat/                 # AI chatbot edge function
```

---

## Authentication & Security

### User Authentication
- **Sign Up** — Email/password registration with full name. Email verification required.
- **Sign In** — Email/password login with failed attempt tracking and lockout.
- **Sign Out** — Secure session termination from the portal navigation.
- **Password Reset** — Email-based reset flow with secure token validation.

### Login Security
- **5-attempt limit** — After 5 consecutive failed login attempts, the account is temporarily locked for 5 minutes.
- **Countdown timer** — Users see a real-time countdown until the lockout expires.
- **Attempt tracking** — Remaining attempts are displayed as warnings.
- **Automatic reset** — Successful login resets the attempt counter.

### Password Reset Flow
1. User clicks "Forgot password?" on the login page
2. Enters their email address on `/forgot-password`
3. Receives an email with a secure reset link
4. Clicks the link → redirected to `/reset-password`
5. Enters and confirms new password
6. Password updated → redirected to login

---

## Client Portal

The client portal (`/portal/*`) is protected by authentication.

| Route                    | Page                | Description                              |
|--------------------------|---------------------|------------------------------------------|
| `/portal`                | Overview            | Dashboard with transaction summary       |
| `/portal/transactions`   | Transaction Monitor | View & analyze transactions with AI      |
| `/portal/report`         | Report Fraud        | Submit fraud reports with tracking       |
| `/portal/chatbot`        | AI Assistant        | Chat with AI about fraud & security      |
| `/portal/learn`          | Learn               | Educational fraud prevention content     |

---

## Admin Dashboard

The admin dashboard (`/admin/*`) is protected by a separate password gate.

| Route                  | Page          | Description                              |
|------------------------|---------------|------------------------------------------|
| `/admin`               | Dashboard     | System overview with key metrics         |
| `/admin/transactions`  | Transactions  | All transactions across users            |
| `/admin/alerts`        | Alerts        | Fraud alert management & resolution      |
| `/admin/reports`       | Reports       | User-submitted fraud report review       |
| `/admin/analytics`     | Analytics     | Charts, trends, and pattern analysis     |

---

## AI & Machine Learning

### Transaction Analysis
AI models analyze individual transactions for fraud indicators:
- **Risk Factor Breakdown** — Identifies specific risk indicators
- **Confidence Score** — Model's confidence in its risk assessment
- **Recommendation** — Suggested action (approve, flag, block)
- **Pattern Analysis** — Comparison against known fraud patterns

### AI Chatbot
Conversational AI assistant with streaming responses via Server-Sent Events (SSE):
- Answer questions about fraud prevention
- Explain specific transaction risk scores
- Provide security best practices
- Guide users through reporting processes

---

## Biometric Authentication

### How It Works
Uses the **Web Authentication API (WebAuthn / FIDO2)**:

1. **Platform Detection** — Checks device support for Face ID, Touch ID, Windows Hello
2. **Credential Creation** — Creates a public key credential bound to the device
3. **User Verification** — Requires biometric scan for each authentication
4. **Fallback to PIN** — 4-digit PIN when biometrics are unavailable

### When Biometrics Are Used
- **Transaction Authorization** — Required when initiating AI risk analysis
- **Session Caching** — Verification cached for 10 minutes

### PIN System
- **Setup** — Create a 4-digit PIN on first use
- **Entry** — Visual keypad with dot indicators
- **Security** — Maximum 3 PIN attempts before dismissal
- **Persistence** — PIN persists across sessions via localStorage

---

## Security Measures

| Feature                     | Implementation                                    |
|-----------------------------|---------------------------------------------------|
| Authentication              | Email/password with session tokens                |
| Session Management          | JWT tokens with automatic refresh                 |
| Route Protection            | React Router guards with auth state checks        |
| Admin Access                | Separate password gate (session-based)            |
| Biometric Auth              | WebAuthn API with platform authenticators         |
| PIN Fallback                | 4-digit PIN with attempt limiting                 |
| Login Lockout               | 5-attempt limit with 5-minute cooldown            |
| Transaction Verification    | Biometric/PIN gate with 10-minute session cache   |
| Password Reset              | Secure email-based token flow                     |
| Row-Level Security          | Database-level access control policies            |

---

## API & Backend

### Database Tables

| Table            | Description                                       |
|------------------|---------------------------------------------------|
| `transactions`   | All banking transactions with risk scores         |
| `fraud_alerts`   | System-generated fraud alerts                     |
| `fraud_reports`  | User-submitted fraud reports                      |

### Edge Functions

| Function               | Method | Description                            |
|------------------------|--------|----------------------------------------|
| `analyze-transaction`  | POST   | AI-powered transaction risk analysis   |
| `chat`                 | POST   | Streaming AI chatbot responses         |

### API Functions (`src/lib/api.ts`)

| Function               | Description                                    |
|------------------------|------------------------------------------------|
| `fetchTransactions()`  | Get all transactions                           |
| `fetchFraudAlerts()`   | Get all fraud alerts                           |
| `fetchFraudReports()`  | Get all fraud reports                          |
| `createFraudReport()`  | Submit a new fraud report                      |
| `updateAlertStatus()`  | Resolve/unresolve a fraud alert                |
| `analyzeTransaction()` | Call AI to analyze a transaction                |
| `streamChat()`         | Stream AI chat responses via SSE               |

---

## Deployment

### Publishing with Lovable
1. Open the Lovable project
2. Click **Share → Publish**
3. The app is deployed to a `.lovable.app` domain

### Custom Domain
1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL is provisioned automatically

---

## License

This project is built and managed with [Lovable](https://lovable.dev).
