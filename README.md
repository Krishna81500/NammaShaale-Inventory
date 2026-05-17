# AssetFlow: School Inventory & Staff Management

A high-performance management system for tracking school assets and personnel. Built with React, Vite, and Firebase.

## 🚀 Quick Start (Local Development)

To run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Ensure `firebase-applet-config.json` exists in the root directory.
   - If it is missing, create it using your Firebase project credentials:
     ```json
     {
       "apiKey": "...",
       "authDomain": "...",
       "projectId": "...",
       "storageBucket": "...",
       "messagingSenderId": "...",
       "appId": "...",
       "firestoreDatabaseId": "(default)"
     }
     ```

4. **Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add your Gemini API key (if using AI features):
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will typically be available at `http://localhost:5173`.

## 🏗️ Production Build

To build the project for production:

```bash
npm run build
```

The compiled files will be in the `dist/` directory, which can be served by any static web server (GitHub Pages, Netlify, Vercel, etc.).

## 🛠️ Features

- **Dashboard**: Real-time asset health and statistics.
- **Audit Mode**: Rapid-fire interface for inventory checks.
- **Staff Heatmap**: 30-day attendance visualization.
- **AI Reports**: Automated inventory summaries via Google Gemini.
- **PDF Export**: Print-ready reports for administration.

## 🔒 Security

This project uses Firestore Security Rules. Ensure you deploy the rules found in `firestore.rules` to your Firebase console to protect your data.

---
*Developed as a prototype for Namma-Shaale Schools.*
