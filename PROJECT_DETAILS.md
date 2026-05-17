# AssetFlow: Complete Project Documentation

## 1. Project Overview
**AssetFlow** is a comprehensive, full-stack web application designed for school administrators and facility managers to track physical assets and manage staff lifecycle. It replaces manual spreadsheets with a high-performance, real-time interface that provides actionable insights into inventory health and personnel availability.

---

## 2. Core Feature Specifications

### 2.1. Centralized Dashboard
- **Key Performance Indicators (KPIs)**: Total Assets, Working count, Needs Repair count, and Broken count.
- **Visual Analytics**: Interactive area charts displaying the "Condition Trend" over the last week. This helps administrators identify periods of high wear-and-tear or maintenance backlogs.
- **Quick Links**: Dynamic navigation to Audit Mode, Asset Registration, and Member Management.

### 2.2. Asset Management System
- **Detailed Asset Profiles**: Includes name, category, original condition, estimated cost, and QR/ID identification.
- **Status Lifecycle**: 
  - `Working`: Fully operational.
  - `Needs Repair`: Functional but requiring attention.
  - `Broken`: Non-functional, awaiting disposal or major overhaul.
  - `Lost`: Missing from inventory.
- **Search & Advanced Filters**: Multi-parameter search by name, category, or condition status.

### 2.3. Rapid Audit Workflow ("Audit Mode")
- **The Audit Pipeline**: A streamlined, interface that lets users "rapid-fire" through the inventory. 
- **Digital Proofing**: Auditors can leave detailed notes and historical health snapshots for every item.
- **Atomic Updates**: Ensures asset records are updated synchronously across the database.

### 2.4. Personnel & Attendance Management
- **Staff Profiles**: Comprehensive directory with biographies and assigned responsibilities.
- **Responsibility Tags**: Visual tags indicating specific duties (e.g., "IT Support", "Facility Maintenance").
- **30-Day Attendance Heatmap**: A GitHub-style visual grid for every member showing:
  - **Present**: Green indicator.
  - **Absent**: Red indicator.
  - **On Leave**: Amber indicator.
- **Status Management**: Real-time toggling of staff availability (Present/Absent/On Leave).

### 2.5. Intelligent Reporting & Exports
- **Automated Summary**: Aggregated data on asset distribution by category.
- **Print-to-PDF Functionality**: Clean, optimized CSS styles specifically for generating professional PDF reports directly from the browser.
- **Data Refresh**: Manual sync triggers to ensure the most latest cloud data is reflected in reports.

---

## 3. Technical Architecture

### 3.1. Development Stack
| Layer | Tech / Tool |
| :--- | :--- |
| **Frontend Framework** | React 18+ (TSX) |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS v4 |
| **Motion/Animations** | Framer Motion (`motion/react`) |
| **Charts & Graphs** | Recharts |
| **Icons** | Lucide React |
| **Database** | Google Firebase Firestore |
| **Authentication** | Google Identity (Firebase Auth) |

### 3.2. Firestore Data Model (Schema)
#### `assets` Collection
```json
{
  "name": "string",
  "category": "Furniture | Electronic | Office | Other",
  "condition": "Working | Needs Repair | Broken | Lost",
  "estimatedRepairCost": "number",
  "addedAt": "timestamp",
  "lastCheckedAt": "timestamp"
}
```

#### `members` Collection
```json
{
  "name": "string",
  "role": "string",
  "status": "Present | Absent | On Leave",
  "bio": "string",
  "responsibilities": "string (comma-separated)",
  "imageUrl": "string"
}
```

#### `health_checks` Collection
```json
{
  "assetId": "string (reference)",
  "condition": "string",
  "timestamp": "timestamp",
  "auditorName": "string",
  "notes": "string"
}
```

---

## 4. Security Implementation
The application uses **Hardened Firestore Security Rules** to ensure:
1. **Authenticated Access**: Only users signed in via Google can read/write data.
2. **Schema Validation**: Every write operation is validated against a strict schema helper (`isValidAsset`, `isValidHealthCheck`).
3. **Identity Protection**: Users cannot modify sensitive system fields or spoof auditor identities.

---

## 5. User Guide: How to Generate a PDF Report
1. Navigate to the **Reports** tab from the sidebar.
2. Review the aggregated statistics.
3. Click the **"PRINT AS PDF"** button.
4. The application will automatically hide the sidebar, header, and buttons, presenting a clean white-page document for saving or printing.

---

## 6. Implementation Notes
- **Performance**: The app uses `onSnapshot` for real-time listeners, ensuring collaborators see updates instantly without page refreshes.
- **Responsiveness**: Fully adaptive layout that works on desktop, tablets, and mobile devices (audit mode is optimized for handheld use).
- **Accessibility**: High-contrast colors and descriptive labels for screen reader compatibility.

---
*Created by AI Coding Agent - May 2026*
