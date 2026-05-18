# Deploy

Two paths, both run through EAS. Decide which one based on whether the change
ships native code.

| What changed                       | Path                | Effort |
|------------------------------------|---------------------|--------|
| JS / TS / assets only              | EAS Update (OTA)    | Auto on merge to `main` |
| Native modules / app.json runtime  | EAS Build + Submit  | Manual dispatch        |

## One-time setup (do this once per checkout)

1. Install the EAS CLI locally: `npm i -g eas-cli`
2. Log in: `eas login` (uses your Expo account)
3. Initialize the project: `eas init` — this writes the real
   `extra.eas.projectId` into `app.json`. Commit that change.
4. Configure build credentials so EAS Build can sign for iOS / Android:
   `eas credentials`. Pick "production" profile for both platforms and let
   EAS manage Apple + Google keystores. Re-run for `preview` if you want
   internal TestFlight / Play Internal builds.
5. In the GitHub repo settings:
   - **Secrets** → add `EXPO_TOKEN` (generate one at
     <https://expo.dev/settings/access-tokens>).
   - **Variables** → set `EAS_UPDATES_ENABLED` to `true` to arm the
     auto-OTA workflow. Leave it unset / `false` to keep the workflow
     dormant.

After step 5 is done, every merge to `main` ships an OTA to the
`production` channel automatically.

## OTA updates (the fast path)

Triggered by `.github/workflows/eas-update.yml`:

- Fires on push to `main` (skipping doc-only changes).
- Type-checks first, then runs `eas update --branch production`.
- The commit message becomes the update note.
- Gated on the `EAS_UPDATES_ENABLED` repo variable so the workflow is
  inert until you flip the switch.

You can also trigger it manually: **Actions → EAS Update → Run workflow**.

## Native binaries (the slow path)

Triggered by `.github/workflows/eas-build.yml`:

- Manual dispatch only — pick platform (`ios | android | all`) and profile
  (`development | preview | production`).
- Optionally check "Submit to stores" to also run `eas submit` for
  production builds.
- Use this when you've changed `package.json` dependencies that include
  native code, bumped `app.json` plugin lists, or rotated icons / splash.

## Local commands

```bash
# Preview build for your phone
eas build --profile preview --platform ios

# Production build + submit
eas build --profile production --platform all
eas submit --profile production --platform all

# Ship a JS-only change without rebuilding the app
eas update --branch production --message "Fix invoice copy"
```

## Channels and runtime versions

- `app.json` uses `"runtimeVersion": { "policy": "appVersion" }`, so every
  bump of `version` in `app.json` forces a fresh native build before OTA
  updates apply.
- Channels: `development`, `preview`, `production`. EAS Build embeds the
  channel into the binary; `eas update` pushes to a branch with the same
  name.
