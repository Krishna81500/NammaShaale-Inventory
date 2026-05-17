# AssetFlow: Intelligent School Inventory & Staff Management
## Prototype Specification Report

**Date:** May 1, 2026
**Version:** 1.0.0
**Project Lead:** AI Coding Agent

---

### 1. Executive Summary
AssetFlow is a high-performance inventory management system designed for educational institutions. It bridge the gap between physical asset tracking (furniture, electronics, supplies) and human resource management (staff attendance, responsibilities). The prototype focuses on real-time data synchronization, historical health tracking, and an intuitive "Audit Mode" for rapid-fire inventory checks.

---

### 2. Core Modules & Features

#### 2.1. Dynamic Dashboard
- **Real-time Statistics**: Instant visibility into total assets, working units, items needing repair, and broken inventory.
- **Condition Trend Analysis**: An integrated area chart powered by `recharts` that visualizes asset health distribution over the last 7 days, allowing for proactive maintenance planning.
- **Quick Actions**: Streamlined "Audit Assets" and "Generate Report" entry points.

#### 2.2. Intelligent Asset Management
- **Smart Filtering**: Search and filter by category (Furniture, Electronic, Office, Other) and condition.
- **History Tracking**: Every asset maintains a log of historical health checks, visible in expanded card views.
- **Maintenance Lifecycle**: Status transitions from 'Working' to 'Needs Repair' or 'Broken' trigger system alerts.

#### 2.3. "Audit Mode" Flow
- **Audit Pipeline**: A sequential review interface that minimizes clicks. Auditors can swipe or click through assets, marking their condition and adding notes or reference photos.
- **Batch Processing**: Multiple audits are synced to Firestore atomically.

#### 2.4. Staff & Member Directory
- **Personnel Tracking**: Searchable directory of inventory managers, auditors, and staff.
- **Attendance Visualizer**: A 30-day "GitHub-style" heat map for each staff member, visualizing presence, absence, and leave history.
- **Role Scoping**: Detailed view of responsibilities (rendered as tags) and professional biographies.
- **Status Filtering**: Quick toggles for Present, Absent, or On Leave staff.

---

### 3. Technical Architecture

#### 3.1. Frontend Stack
- **Framework**: React 18+ with Vite (TypeScript).
- **Styling**: Tailwind CSS (Mobile-first, responsive design).
- **Animation**: `motion` (Framer Motion) for route transitions and interactive micro-animations.
- **Charts**: `recharts` for condition trends and distribution reports.
- **Icons**: `lucide-react` for a consistent, professional iconography system.

#### 3.2. Backend & Data
- **Database**: Firebase Firestore (NoSQL) for real-time document synchronization.
- **Authentication**: Firebase Authentication (Google OAuth integration).
- **Security**: Hardened Firestore Security Rules implementing Attribute-Based Access Control (ABAC) to prevent unauthorized writes and identity spoofing.

---

### 4. Design Philosophy
- **Typography**: Inter (Sans-serif) for high legibility in data grids; Playfair Display (Serif) for headings to add a touch of institutional elegance.
- **Color Palette**: A professional mix of Slate and Blue, with high-contrast semantics for status (Emerald for Working/Present, Amber for Repair/Leave, Red for Broken/Absent).
- **Interaction**: Progressive disclosure (expanded cards), staggered list entrances, and meaningful hover feedback.

---

### 5. Future Roadmap
- **QR Code Integration**: Scanning physical tags for instant asset lookup.
- **AI-Powered Forecasting**: Predictive analysis of asset breakage based on historical health check patterns.
- **Automated Alerts**: Email notifications for managers when critical assets are marked as "Broken".

---

*This document is generated automatically as part of the AssetFlow Prototype build.*
