---
title: Vaanidoc
emoji: ⚡
colorFrom: pink
colorTo: indigo
sdk: docker
pinned: false
license: apache-2.0
short_description: Offline-first, voice-driven multimodal health assistant
---

# VaaniDoc 🩺

An offline-first, multimodal AI health assistant for rural India, powered by Gemma 4 (via Ollama).

## Prerequisites
- **Node.js**: 18+
- **Python**: 3.10+
- **Ollama**: Installed and running locally

## Setup Instructions

### 1. Model Setup
Pull the required model in Ollama:
```bash
ollama pull gemma3:4b
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Start the FastAPI server:
```bash
uvicorn main:app --reload
```
The backend will run on `http://localhost:8000`.

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`.

## How Offline Works 📶
VaaniDoc is designed as a Progressive Web App (PWA). 
- **App Shell**: The service worker caches the core UI (HTML, JS, CSS, Icons) so the app loads instantly even with no internet connection.
- **Offline Queries**: If you send a message while offline, it is saved locally to **IndexedDB**. A fallback offline message is returned to the user immediately.
- **Auto-Sync**: When internet connectivity is restored, the `firebaseService.js` detects the `online` event and automatically syncs pending queries from IndexedDB to Firebase Firestore (if configured).

## Firebase Sync Setup (Optional) ☁️
To enable cloud syncing of offline messages:
1. Create a Firebase project and a Firestore database.
2. Deploy the rules in `firebase/firestore.rules`.
3. Provide your Firebase config variables to the frontend (e.g. by creating a `.env` in `frontend/`):
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Uncomment the Firebase initialization code in `frontend/src/services/firebaseService.js`.
