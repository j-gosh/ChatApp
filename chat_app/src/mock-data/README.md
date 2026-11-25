# Mock data

Debug builds (`__DEV__`) read these JSON files instead of Firebase, unless
`EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` is set (then the emulators are used). Release
builds always use Firebase. The switch is `isMockDataEnabled` in `src/config.ts`;
the services that read these files are in `src/services/mock/`.

Mock data is **read-only**: sending messages, posting stories, following, opening
snaps, etc. succeed but nothing is saved. Reload the app to reset auth state.

## Accounts

All passwords are `password123`.

| Email                   | uid             | Notes                                                       |
| ----------------------- | --------------- | ----------------------------------------------------------- |
| `ada@example.com`       | `ada`           | Main account: rooms of every type, friends, snaps, etc.     |
| `grace@example.com`     | `grace`         | Admin role, `always` location sharing                       |
| `alan@example.com`      | `alan`          | Moderator role, sharing `off`                               |
| `katherine@example.com` | `katherine`     | Agent role, profile with defaults omitted                   |
| `margaret@example.com`  | `margaret`      | No avatar                                                   |
| `linus@example.com`     | `linus`         | Not Ada's friend, but Ada follows (sees "everyone" stories) |
| `legacy@example.com`    | `legacy-user`   | Has no `profileData` doc (missing-profile flow)             |
| `disabled@example.com`  | `disabled-user` | Disabled: sign-in fails with `auth/user-disabled`           |

Unknown emails fail with `auth/user-not-found`, wrong passwords with
`auth/invalid-credential`. Signing up with a new email signs in a temporary user
with no profile.

## Files

Each file mirrors a Firestore collection, keyed by document id, with the same
field names as the real documents. Timestamps are ISO strings.

| File                     | Firestore path                       |
| ------------------------ | ------------------------------------ |
| `auth-accounts.json`     | Firebase Auth accounts               |
| `users.json`             | `users/{id}`                         |
| `profile-data.json`      | `profileData/{uid}`                  |
| `user-friends-list.json` | `userFriendsList/{uid}/friends/{id}` |
| `following.json`         | `following/{uid}/users/{targetId}`   |
| `rooms.json`             | `rooms/{id}`                         |
| `messages.json`          | `rooms/{roomId}/messages/{id}`       |
| `stories.json`           | `stories/{id}`                       |
| `locations.json`         | `locations/{uid}`                    |
| `snaps.json`             | `snaps/{batchId}_{recipientId}`      |
| `memories.json`          | `memories/{uid}/items/{id}`          |
| `news.json`              | `news/{id}`                          |
| `subscriptions.json`     | `subscriptions/{id}`                 |
| `storage.json`           | Cloud Storage: path → download URL   |

Images are remote placeholders (pravatar.cc, picsum.photos), so they need network
access. Video calls are unavailable with mock data (no token function).
