# ChatApp - Social Video Chat Mobile App

A comprehensive React Native (Expo) social communication app that combines video calling, messaging, camera features, and location sharing - inspired by popular social media platforms like Snapchat.

## Features

### 🎥 Video Chat
- Real-time video calling powered by Stream Video SDK
- Camera and microphone controls during calls
- Call management with hang up, mute, and camera switching
- Permission handling for camera and microphone access

### 💬 Text Messaging
- Real-time chat functionality backed by Cloud Firestore
- Friends list management
- Message threads and conversations
- User authentication via Firebase Auth

### 📸 Camera & Media
- Full-featured camera interface with photo and video capture
- Advanced camera controls (flash, exposure, focus modes)
- Front/back camera switching
- Zoom and tap-to-focus functionality
- Video recording with pause/resume capabilities
- Send a photo as a snap, post it as a story, or save it to your memories

### 🗺️ Location & Maps
- Google Maps integration showing user and friends' locations
- Opt-in location sharing with friends: off, while using the app, or always (in the background)
- Custom map markers showing when each friend's location was last updated
- Location permission management

### 👤 Social Features
- User profiles with a profile photo (camera or library), snap totals, friends, and following stats
- Snaps: photos sent to friends that disappear once opened
- Stories: photos visible to everyone or friends only, shown in friends' and followers' Discover feeds
- Memories: photos saved privately to your profile
- Follow other users, plus friend discovery and management
- User authentication and account management

### 📱 App Structure
- **Home**: Main hub with bottom navigation between Chat, Map, Video, and Discover
- **Chat**: Message threads and friend conversations
- **Map**: Location-based friend finder
- **Video Chat**: One-on-one video calling
- **Discover**: Content discovery with stories and recommendations
- **Profile**: User account management and content viewing
- **Camera**: Standalone camera interface for content creation

## Technical Stack

- **Frontend**: React Native with Expo (TypeScript)
- **Video Calling**: Stream Video React Native SDK, with tokens issued by a Firebase Cloud Function
- **Real-time Chat**: Cloud Firestore & React Native Gifted Chat
- **Authentication**: Firebase Auth (React Native Firebase)
- **Database**: Cloud Firestore
- **File Storage**: Cloud Storage for Firebase
- **Backend**: Firebase Cloud Functions (TypeScript)
- **Maps**: React Native Maps (Google Maps)
- **State Management**: Zustand & TanStack Query
- **Navigation**: Expo Router
- **Camera**: React Native Vision Camera, Expo Image Picker
- **UI Components**: React Native Paper

This project demonstrates a modern social communication app with comprehensive multimedia features and real-time connectivity.

## Running your own copy

> **This repository is not connected to a Firebase project or Firestore database.** The Firebase config files and API keys are kept out of git, so a fork or clone has no backend until you set up your own.

1. Create a Firebase project and upgrade it to the Blaze plan (Cloud Functions and secrets need it).
2. Enable **Authentication** (Email/Password), **Cloud Firestore**, and **Cloud Storage**.
3. Register an iOS and an Android app using the bundle ID and package name in `chat_app/app.config.ts`, then put the downloaded `GoogleService-Info.plist` and `google-services.json` in `chat_app/`.
4. Copy `chat_app/.env.example` to `chat_app/.env` and fill in your Google Maps keys and Stream Video API key.
5. Store the Stream secrets for the token function:
   ```bash
   firebase functions:secrets:set STREAM_API_KEY
   firebase functions:secrets:set STREAM_API_SECRET
   ```
6. Deploy the security rules, indexes, and Cloud Functions from the repo root:
   ```bash
   firebase use --add            # select your project
   firebase deploy --only firestore,storage,functions
   ```
7. Add Discover content from the Firebase console. These collections are read-only in the app:
   - `news`: `title`, `thumbnailUrl`, `category`, `publishedAt` (timestamp), optional `summary` and `content`
   - `subscriptions`: `label`, `imageUrl`, `order` (number)
8. Build and run the app from `chat_app/` with `npm install` and `npm run ios` or `npm run android`.

To try everything locally instead, run `firebase emulators:start` from the repo root and start the app with `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=localhost` (`10.0.2.2` from an Android emulator).
