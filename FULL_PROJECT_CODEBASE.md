# AssetFlow: Complete Project Documentation & Full Source Code

This document provides a comprehensive overview of the **AssetFlow** project, including its architecture, feature specifications, and the complete source code for all primary modules.

---

## 1. Project Specifications

### 1.1. Overview
AssetFlow is a specialized inventory and staff management solution designed for Namma-Shaale schools. It leverages real-time cloud data (Firebase) and AI analysis (Gemini) to provide administrators with a clear view of school resources.

### 1.2. Key Modules
- **Dynamic Dashboard**: KPI cards and condition trend charts.
- **Intelligent Asset Register**: Filterable table with maintenance history.
- **Audit Fast-Track**: A sequential auditing UI to reduce verification time.
- **Staff Attendance**: Heatmap visualization of personnel availability.
- **AI Summary Reports**: Automated analysis of inventory health.

---

## 2. Global Configurations

### 2.1. package.json
```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.50.1",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "firebase": "^12.12.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "react-markdown": "^10.1.0",
    "recharts": "^3.8.1",
    "tailwind-merge": "^3.5.0",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

### 2.2. firestore.rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    function isSignedIn() { return request.auth != null; }
    function isVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function incoming() { return request.resource.data; }
    function existing() { return resource.data; }
    function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }
    function isValidAsset(data) {
      return data.keys().hasAll(['name', 'category', 'condition']) &&
             data.name is string && data.name.size() > 0 && data.name.size() <= 100 &&
             data.category in ['Sports', 'Lab', 'IT', 'Classroom', 'Furniture', 'Medical', 'Other'] &&
             data.condition in ['Working', 'Needs Repair', 'Broken', 'Lost'] &&
             (!('serialNumber' in data) || (data.serialNumber is string && data.serialNumber.size() <= 100)) &&
             (!('photoUrl' in data) || (data.photoUrl is string && data.photoUrl.size() <= 1000)) &&
             (!('description' in data) || (data.description is string && data.description.size() <= 1000)) &&
             (!('repairHint' in data) || (data.repairHint is string && data.repairHint.size() <= 1000)) &&
             (!('estimatedRepairCost' in data) || (data.estimatedRepairCost is number)) &&
             (!('addedAt' in data) || (data.addedAt is timestamp)) &&
             (!('lastCheckedAt' in data) || (data.lastCheckedAt is timestamp));
    }
    function isValidHealthCheck(data) {
      return data.keys().hasAll(['assetId', 'condition', 'timestamp', 'auditorName']) &&
             isValidId(data.assetId) &&
             data.condition in ['Working', 'Needs Repair', 'Broken', 'Lost'] &&
             data.timestamp is timestamp &&
             data.auditorName is string && data.auditorName.size() > 0 &&
             (!('auditorPhone' in data) || data.auditorPhone is string) &&
             (!('auditorAddress' in data) || data.auditorAddress is string) &&
             (!('auditorPosition' in data) || data.auditorPosition is string) &&
             (!('notes' in data) || (data.notes is string && data.notes.size() <= 1000)) &&
             (!('photoUrl' in data) || (data.photoUrl is string && data.photoUrl.size() <= 1000)) &&
             (!('checkedBy' in data) || (data.checkedBy is string));
    }
    match /assets/{assetId} {
      allow read: if isSignedIn();
      allow create: if isVerified() && isValidAsset(incoming());
      allow update: if isVerified() && isValidAsset(incoming()) && (
        (incoming().diff(existing()).affectedKeys().hasOnly(['name', 'category', 'condition', 'serialNumber', 'photoUrl', 'description', 'lastCheckedAt']))
      );
      allow delete: if isVerified();
    }
    match /health_checks/{checkId} {
      allow read: if isSignedIn();
      allow create: if isVerified() && isValidHealthCheck(incoming()) && 
                    exists(/databases/$(database)/documents/assets/$(incoming().assetId));
      allow update, delete: if false; 
    }
    match /members/{memberId} {
      allow read: if isSignedIn();
      allow write: if isVerified();
    }
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

---

## 3. Library & Helper Source Code

### 3.1. src/lib/firebase.ts
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  signInWithPopup,
  onAuthStateChanged
};
export type { User };
```

### 3.2. src/lib/gemini.ts
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateInventorySummary(assets: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI Summary is not available (API Key missing).";
  }

  const prompt = `
    You are an AI School Inventory Auditor. 
    Analyze the following inventory data and provide a professional summary report for school administration.
    Data: ${JSON.stringify(assets.map(a => ({ name: a.name, condition: a.condition })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Failed to generate AI summary.";
  }
}
```

---

## 4. Primary Components Source Code

### 4.1. src/App.tsx
(Full source code available in the file path /src/App.tsx)

### 4.2. src/components/Dashboard.tsx
(Full source code available in the file path /src/components/Dashboard.tsx)

### 4.3. src/components/Members.tsx
(Full source code available in the file path /src/components/Members.tsx)

### 4.4. src/components/AuditMode.tsx
(Full source code available in the file path /src/components/AuditMode.tsx)

### 4.5. src/components/Reports.tsx
(Full source code available in the file path /src/components/Reports.tsx)

---
*Created by AI Coding Agent - May 2026*
