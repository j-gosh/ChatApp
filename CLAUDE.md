# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social video-chat app (chat, video calls, camera, friend map, stories). The app was ported from Flutter to **Expo / React Native (TypeScript)**. All data comes from Firebase (no bundled mock data); the repo is not connected to a Firebase project (see README "Running your own copy"). Code comments often reference the Flutter original (e.g. "the counterpart of a Riverpod `StreamProvider`").

Repo layout:
- `chat_app/` — Expo app (expo-router, React Native Firebase, Stream Video). Uses a dev client, not Expo Go.
- `functions/` — Firebase Cloud Functions (TypeScript): the `getStreamUserToken` callable plus Firestore triggers / a scheduled job (`audience.ts`, `media.ts`).
- `firestore.rules`, `storage.rules`, `firestore.indexes.json` — security rules and indexes, deployed with `firebase deploy --only firestore,storage`.
- `firebase.json` — deploy config and emulator ports (auth 9099, firestore 8080, functions 5001, storage 9199).

## Commands

App (run from `chat_app/`, Node >= 22):
```bash
npm install
npm start                 # expo start --dev-client
npm run ios               # expo run:ios (native build; needs Firebase config files, see below)
npm run android
npm run prebuild          # regenerate ios/ and android/ (gitignored, generated from app.config.ts)
npm run lint              # expo lint (ESLint flat config)
npm run typecheck         # tsc --noEmit
npm run format            # prettier --write .   (format:check in CI)
npm test                  # jest (jest-expo preset)
npx jest src/features/chats/__tests__/ChatScreen.test.tsx   # single file
npx jest -t 'part of test name'                             # single test by name
```

Functions (run from `functions/`):
```bash
npm run build             # tsc -> lib/
npm run serve             # build + functions emulator
npm run deploy            # firebase deploy --only functions
```

Security rules tests (`functions/test/rules.test.mjs`, Node test runner; needs Java):
```bash
firebase emulators:exec --project demo-chat-app-rules --only firestore,storage "npm --prefix functions run test:rules"   # repo root
```

E2E (Maestro, against Firebase emulators — see header of `chat_app/e2e/auth-flow.yaml`):
```bash
firebase emulators:start --only auth,firestore,functions,storage  # repo root
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=localhost npx expo run:ios      # 10.0.2.2 from Android emulator
maestro test -e APP_ID=com.example.chatApp e2e/auth-flow.yaml
```

CI (`.github/workflows/ci.yml`) runs format:check, lint, typecheck, and `npm test -- --ci` for the app, `npm run build` for functions, and the rules tests against the emulators. No native builds in CI.

## Configuration

`chat_app/app.config.ts` reads env vars (template in `chat_app/.env.example`) and warns when keys are missing:
- `google-services.json` / `GoogleService-Info.plist` — Firebase native config, gitignored, default to `chat_app/` root (override via `GOOGLE_SERVICES_JSON` / `GOOGLE_SERVICE_INFO_PLIST`).
- `GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY`.
- `EXPO_PUBLIC_STREAM_API_KEY` — public key only. The Stream secret lives in Firebase secrets (`STREAM_API_KEY`, `STREAM_API_SECRET`) and is used only by the Cloud Function.
- `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` — when set, `src/services/emulators.ts` points auth/firestore/functions/storage at local emulators.

`EXPO_PUBLIC_*` vars are inlined at build time and must be read by full literal name; they are centralized in `src/config.ts`.

iOS uses `useFrameworks: 'dynamic'` (required by Firebase Apple SDK 13+). Background location ("Always" sharing) is enabled through the `expo-location` plugin options.

## Architecture (`chat_app/src/`)

Layering, top to bottom:

1. **Routes** — `src/app/` (expo-router, typed routes). Route files are thin re-exports of screens in `src/features/<feature>/`. Auth gating lives in `src/navigation/RootNavigator.tsx` using `Stack.Protected`: signed-in users reach only the `(app)` group, signed-out users only `/onboarding`. The native splash screen stays up until the first auth-state event.
2. **Providers** — `src/providers/AppProviders.tsx` composes everything (gesture handler, keyboard, React Query, services, auth state, Paper theme, bottom sheets, snackbar). `(app)/_layout.tsx` adds `SignedInUserProvider` (exposes `useSignedInUser()`, non-null user) and `StreamVideoProvider` (connects Stream for the signed-in user and renders `CallOverlay` above all screens for incoming/outgoing calls). It also mounts `useLocationSharing`, which applies the user's saved location-sharing mode on this device.
3. **Services** — `src/services/*`. Each file defines an interface (auth, chat, user, video, story, snap, memory, location, content, media) plus a Firebase implementation. Story/snap/memory services take the `MediaService` (Storage uploads) in their constructor. They are injected via React context (`ServicesProvider` / `useServices()`), never imported directly by UI, so tests can swap in mocks.
4. **Hooks / controllers** — `src/hooks/` wraps service reads; `src/controllers/use-*-controller.ts` wraps service writes/business logic.
5. **Stores** — Zustand for small cross-screen UI state (`chat-store` selected room, `story-store` story open in the viewer, `ui-store` chat sub-page and last story visibility, `snackbar-store`).

The background location task (`src/services/location-task.ts`) is defined at module scope and imported from `src/app/_layout.tsx`; it runs without React, so it uses `FirebaseLocationService` directly.

Data-flow conventions:
- **Live data** (Firestore listeners): services expose `subscribeX(observer: Observer<T>): Unsubscribe` (`src/services/observer.ts`); hooks consume them with `useSubscription(subscribe)`. The `subscribe` function **must be memoized** (`useMemo`/`useCallback`) — a new identity resubscribes and resets to loading.
- **One-shot reads / mutations**: TanStack React Query (`useQuery` for profiles, news, subscriptions, following counts; `useMutation` for sign-in, posting, sending, following, settings). Invalidate via exported query-key helpers (e.g. `userProfileQueryKey`, `followingCountQueryKey`).
- **Validation**: zod schemas in `src/models/` parse Firestore documents and Cloud Function responses. List reads use `parseDoc` (`services/firestore-utils.ts`), which logs and skips malformed documents instead of failing the whole list.
- **Uploads**: upload to Storage first, then write the Firestore document; if the write fails, `discardUpload` deletes the orphaned file.

Firestore schema (keep compatible — collection names and document shapes match `flutter_firebase_chat_core` so existing data still works):
- `users/{id}` — public chat users; `rooms/{id}` with `userIds`, `type` (`direct|group|channel`); `rooms/{id}/messages`.
- `profileData/{uid}` — profile (`first`, `last`, ...), also read by the Cloud Function for the Stream display name.
- `userFriendsList/{uid}/friends/{friendId}` — one-directional ("people uid added"). Old Flutter docs use auto ids with the user id in an `id` field.

New collections (see `firestore.rules`):
- `stories/{id}`, `locations/{uid}` carry `viewerIds` (owner + owner's friends). Clients may only create it as `[ownerId]` and never change it; the `onFriendWritten` / `on*Created` functions keep it in sync. Firestore rules don't filter results, so every friends-only query must be constrained by `where('viewerIds', 'array-contains', uid)`.
- `snaps/{batchId}_{recipientId}` — one doc per recipient, one shared photo; the recipient deletes the doc when opened, functions delete the photo and purge snaps unopened for 30 days.
- `memories/{uid}/items/{id}`, `following/{uid}/users/{targetId}`.
- `profileData.snapCount` is maintained only by functions; `profileData.locationSharing` is `off | whileUsing | always`.
- `news`, `subscriptions` — read-only, filled from the Firebase console.

Video: the app calls the `getStreamUserToken` callable to get a 1-hour Stream token; the function also upserts the caller as a Stream user so friends can ring them.

## Testing

- Jest setup (`chat_app/jest.setup.ts`) mocks native modules and stubs the Firebase / Stream SDKs so they're importable; real behavior comes from injected mock services.
- Use `@test/render` helpers: `renderWithProviders(ui, { user, services })` and `renderHookWithProviders(hook, ...)`. Passing `user` renders as signed in.
- `jest.setup.ts` also mocks `expo-location`, `expo-task-manager`, `expo-image-picker`, and `@react-native-firebase/storage`.
- `@test/mock-services`: `createMockServices(user)` returns `jest.Mocked` services (subscriptions never emit unless the test drives the observer); `fakeUser()` builds a minimal Firebase user.
- Tests live in `__tests__/` beside the code they cover.

## Code Style

- Prettier: single quotes, 100-char lines, trailing commas.
- ESLint forbids parent-relative imports (`../*`); use aliases `@/` (src), `@assets/`, `@test/`. Same-dir `./` is fine.
- `no-console` warns except `console.warn` / `console.error`; existing code logs with a `[tag]` prefix.
- TypeScript `strict` + `noUncheckedIndexedAccess`.
- File names: kebab-case for modules/hooks (`use-chat-messages.ts`), PascalCase for components (`ChatScreen.tsx`).
