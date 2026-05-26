# Launch audit

Status of the app, the API, and what's still in your court before this is
"up and running" with end users.

## tl;dr

| Surface                              | Status |
|--------------------------------------|--------|
| Read flows (Today, Jobs, Money, Calendar, Threads, People, Settings) | ✅ wired |
| Write flows (job, crew, invoice, calendar event, profile)            | ✅ wired |
| Inbound text shows up in app (foregrounded)                          | ✅ shipped — 15–60s lag via polling |
| Inbound text shows up on web dashboard                               | ✅ same backend, same data |
| Inbound text reaches phone when app is closed (push)                 | ❌ needs backend endpoint + app integration |
| EAS auto-deploy on merge                                             | ⚠️ plumbing committed, you flip the switch |
| App store distribution                                               | ❌ requires Apple + Google enrollment |

---

## How inbound texts flow today

```
crew member texts your TackPilot number
            ↓
Twilio POST → /api/v1/twilio/webhook   (server stores message, bumps unread)
            ↓
   ┌────────┴────────┐
   ↓                 ↓
Web dashboard       Mobile app
   ↓                 ↓
GET /v1/subcontractor/list (unread_messages_count, last_message_date)
GET /v1/subcontractor/{id}/sms (message thread)
GET /v1/notifications (bell feed)
```

Both surfaces read from the same backend, so a text that lands on the web
dashboard lands here too — same data, no separate sync.

### How fast it shows up in the mobile app

Now that foreground polling is on:

| Surface in the app          | Refresh cadence                          |
|-----------------------------|------------------------------------------|
| Bell unread badge           | every 60 s                               |
| Threads tab badge           | every 60 s                               |
| Open thread conversation    | every 15 s (paused while sending)        |
| Threads / People / Today    | on focus + pull-to-refresh               |

Polling pauses when the app is backgrounded and refreshes immediately when
it returns to foreground.

### What still needs work for "always-on" delivery

Push notifications. The user shouldn't have to be in the app to know
someone texted. Two pieces are missing:

**Backend** (you or your backend dev — small change):
- Add `POST /v1/user/device-tokens` to register Expo push tokens per user
- In the Twilio webhook handler, after storing the inbound SMS, look up
  registered tokens for the account owner and call the Expo Push API
  (<https://docs.expo.dev/push-notifications/sending-notifications/>)

**Mobile** (one PR once the backend exists):
- Add `expo-notifications` dependency + plugin in `app.json`
- On login, request permission and `getExpoPushTokenAsync()`
- POST the token to the new endpoint

Until that ships, the foreground polling above is the substitute.

---

## What needs to be done before launch

### 1. Things only you can do (account credentials)

- [ ] **Apple Developer Program** enrollment ($99/yr) for iOS distribution
- [ ] **Google Play Console** enrollment ($25 one-time) for Android distribution
- [ ] Decide on a TestFlight/Internal-track group for early testers
- [ ] Confirm Twilio is pointed at `POST /api/v1/twilio/webhook` on the
  production API URL (this is set up in Twilio Console). If you don't see
  inbound messages on the web dashboard today, this is the first thing
  to check.

### 2. EAS / build pipeline (one-time, ~15 min)

Steps live in `docs/DEPLOY.md`. Recap:
- [ ] `npm i -g eas-cli && eas login`
- [ ] `eas init` — fills `extra.eas.projectId` in `app.json`; commit it
- [ ] `eas credentials` — set up iOS + Android signing
- [ ] In GitHub repo settings:
   - Secrets → add `EXPO_TOKEN`
   - Variables → set `EAS_UPDATES_ENABLED=true`
- [ ] First production build:
  `eas build --profile production --platform all`
- [ ] First submit: `eas submit --profile production --platform all`

After that, every merge to `main` ships an OTA automatically; native
builds are a manual one-click in GitHub Actions.

### 3. Backend gaps (small, but real)

- [ ] `POST /v1/user/device-tokens` for push registration (see above)
- [ ] Twilio webhook → Expo Push fan-out (see above)
- [ ] Confirm `GET /v1/notifications` returns inbound-SMS notifications
  (the bell will surface them once it does)

### 4. App store listing (do alongside the first build)

- [ ] App Store Connect metadata: name, subtitle, description, keywords,
  support URL, privacy policy URL
- [ ] Google Play listing: same, plus content rating questionnaire
- [ ] Screenshots — at least the Today, Threads, and Jobs screens, on a
  6.7" iPhone frame and an Android tablet frame
- [ ] App icon (already in `assets/icon.png`) and adaptive icons for
  Android (already in place)
- [ ] Privacy policy URL (Apple now refuses submissions without one)

### 5. Operational nice-to-haves (post-launch, but soon)

- [ ] Crash + error reporting (Sentry or expo-error-recovery)
- [ ] Analytics (PostHog, Amplitude, or roll your own to your API)
- [ ] Environment-aware API base URL (`theme.ts` is hardcoded to prod)
- [ ] CI test step (we're TypeScript-checking in the OTA workflow; could
  add Jest for hook + util unit tests)

---

## What's intentionally not built

These are documented in `docs/TECH_DEBT.md`:

- Native date/time pickers (text fields with `YYYY-MM-DD HH:mm` for now)
- Cross-tab badge refresh after creating from a different tab — happens
  on next focus, polling closes the rest of the gap
- Phase 3 settings (Agents, Channels, Billing, Team) — placeholder UI
  pending backend
- Connectors are display-only on mobile; OAuth happens on the web
- Duplicate fetch for badge hooks (TabsNav + screens hit the same
  endpoints)

---

## Manual sanity check before you cut a build

Smoke test from a clean install:

1. Log in → land on Today
2. Pull-to-refresh on every tab — no crashes, data refreshes
3. Tap FAB on each tab — opens the right create modal
4. Create one of each: job, crew, invoice, event — each appears in the
   underlying list after the modal closes
5. Tap the bell → Notifications opens, mark one read, dot updates
6. Send a text from another phone to your TackPilot number → within ~60s
   the bell badge and Threads tab badge update. Open the thread → the
   inbound message appears within ~15s.
7. Settings → Profile → change name → save → bounce back, user card
   shows the new name
8. Settings → Sign out → returns to Login
