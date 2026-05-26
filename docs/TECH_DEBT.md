# Tech debt log

A running list of known shortcuts. Each entry should name the file/area, the
shortcut, and the trigger that should prompt fixing it.

- **TabsNav badge hooks duplicate-fetch** — refactor to React Query or a lightweight selector when the hook surface grows. (`src/navigation/AppNavigator.tsx::TabsNav` calls `useJobs`/`useFinances`/`useThreadList` for badge counts; each is *also* called from its corresponding screen, so the fetch fires twice with independent state.)
- **Cross-tab refresh-after-create lag** — creating a job from another tab won't update the JobsTab badge until that tab refocuses (the badge hook is screen-bound; the create modal only triggers `useFocusEffect` on the underlying screen). Acceptable for now; revisit when we add React Query.
- **Date/time input is a text field** — `NewJobScreen`, `NewEventScreen`, `NewInvoiceScreen` accept `YYYY-MM-DD [HH:mm]` as a string. Swap in a native date picker when we wire `@react-native-community/datetimepicker` (avoiding the extra dep for now).
- **Connectors are read-only on mobile** — OAuth requires the web. `ConnectorsScreen` links out to `app.tackpilot.com/settings/integrations` instead of running the OAuth handshake natively. Revisit if/when we add native OAuth support.
- **Settings sections SOON** — Agents, Channels, Billing, Team are intentional Phase 3 destinations. `SettingsDetailScreen` shows what's coming so users know to wait.
