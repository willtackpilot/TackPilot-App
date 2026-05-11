# Tech debt log

A running list of known shortcuts. Each entry should name the file/area, the
shortcut, and the trigger that should prompt fixing it.

- **TabsNav badge hooks duplicate-fetch** — refactor to React Query or a lightweight selector when the hook surface grows. (`src/navigation/AppNavigator.tsx::TabsNav` calls `useJobs`/`useFinances`/`useThreadList` for badge counts; each is *also* called from its corresponding screen, so the fetch fires twice with independent state.)
