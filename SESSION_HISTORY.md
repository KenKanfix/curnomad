# Curnomad Session History

Formerly Roam.

Date: 2026-10-23  
Project: `C:\Users\tj2ng\My-Repo\Personalised Currency Converter`  
Status: Rebranded from Roam to Curnomad. Four editable currency cards in a 2x2 grid with side-by-side clocks near the top. Local development server running at `http://localhost:3000` and `http://192.168.0.160:3000` (PID 15820). Not publicly deployed.

## Project Overview

Curnomad (formerly Roam) is an installable, offline-capable currency converter PWA built with vanilla HTML, CSS, and JavaScript. There is no build step or runtime dependency installation required for the app itself.

Current features:

- Pinned and persisted home currency.
- Four editable currency cards in a 2x2 grid: home currency plus three targets, with the detected local currency in the first target slot.
- Every card has its own amount input and currency picker. Editing any amount recalculates the other three cards.
- Home and current-location clocks shown side by side near the top, above the currency board.
- Single-line hero heading at every width, including 320px.
- Country names on target and nearby currency tags, with full country and currency details in hover titles.
- Live mid-market rates from `https://open.er-api.com/v6/latest/{base}`.
- Location detection through BigDataCloud reverse geocoding.
- Precise GPS detection with approximate IP-based fallback.
- Local currency detection based on country code.
- Authoritative home/current-location clocks.
- Searchable currency picker containing 166 currencies.
- Saved rates and preferences in `localStorage`.
- Offline app shell and rate caching through a service worker.
- Installable PWA manifest and icons.
- Responsive layout from 320px through 1440px.
- Accessible dialog, keyboard handling, focus styles, and WCAG AA contrast.

## Current Files

- `index.html` - app shell, clocks, 2x2 currency board, picker dialog, banners.
- `styles.css` - design system, clock cards, currency cards, responsive layout, animations.
- `app.js` - state, rate loading, location detection, currency mapping, editable card amounts, clocks, persistence.
- `sw.js` - service worker and cache strategy. Current version: `curnomad-v1.1.4`.
- `server.js` - dependency-free static server with security headers and CSP.
- `manifest.webmanifest` - PWA metadata and icons.
- `assets/` - app icons used by the manifest and UI.
- `package.json` - `npm start` and `npm run check`.

The directory is not a git repository.

## Clock Implementation

### Home clock

- Uses the home currency's representative IANA timezone.
- `CURRENCY_TIMEZONES` covers 154 currencies.
- Examples:
  - `USD` -> `America/New_York`
  - `EUR` -> `Europe/Berlin`
  - `GBP` -> `Europe/London`
  - `JPY` -> `Asia/Tokyo`
  - `INR` -> `Asia/Kolkata`
- If the currency has no mapping, the device timezone is used, then UTC.
- The card subtitle displays the currency code and timezone city.

### Current-location clock

- Timezone is extracted from the BigDataCloud response:
  - `localityInfo.informative`
  - Find the entry whose `description` is `time zone`.
  - Read its `name` as the IANA timezone.
- Fallback order:
  1. Valid timezone returned by BigDataCloud.
  2. `COUNTRY_TO_TZ[countryCode]`.
  3. `CURRENCY_TIMEZONES[localCurrency]`.
  4. No clock time; card prompts the user to detect location.

### Updates and persistence

- Clocks update on the minute boundary using `scheduleClockTick()`.
- Clocks also refresh when the tab becomes visible.
- Location timezone is stored in the saved `location` object.
- Older saved locations without a timezone get a fallback timezone through `sanitizeLocation()`.
- Invalid timezone strings are rejected by `sanitizeTimezone()` using `Intl.DateTimeFormat`.

### Layout

- Page order: hero, clocks, currency board.
- Clocks are always side by side in two columns, from 320px through desktop.
- The currency board is a 2x2 grid at every width, including mobile.
- Each currency card contains a currency picker, an editable amount, the currency name, and the rate line.
- Editing any card's amount recalculates the other three cards; the home amount remains the stored base value.
- Currency amounts and clock times use the same responsive size scale.
- Target and nearby cards display country names instead of "Target 2" / "Near you"; nearby location detail remains available to screen readers.

## Recent Changes

- Added the World Time section to `index.html`.
- Added `.clocks`, `.clock-grid`, `.clock-card`, `.clock-time`, and related styles in `styles.css`.
- Added desktop grid-row placement so clocks appear above the two main cards without breaking the two-column layout.
- Added `CURRENCY_TIMEZONES` and `COUNTRY_TO_TZ` maps in `app.js`.
- Added `renderClocks()`, `renderClock()`, `getHomeTimezone()`, `timezoneCity()`, `sanitizeTimezone()`, and `timezoneFromGeo()`.
- Added timezone persistence to `sanitizeLocation()` and `detectLocation()`.
- Added minute-boundary clock scheduling.
- Bumped the service worker version from `roam-v1.0.0` to `roam-v1.1.0`.
- Rebranded the user-facing name from Roam to Curnomad, with a stylized `cur$nomad` wordmark.
- Updated page title, meta description, install copy, manifest, package name, and server log.
- Bumped the service worker cache to `curnomad-v1.1.1` so old app-shell caches are purged.
- Replaced the single home card plus three read-only target cards with four editable currency cards in a 2x2 grid.
- Added amount inputs to every card; editing a target amount back-calculates the home amount and updates the other cards.
- Reused the currency picker for all four cards through `data-pick-slot` and delegated grid events.
- Moved the clocks above the currency board and kept them side by side at all widths.
- Added `renderCards()`, `slotTagMarkup()`, `cardFootMarkup()`, `handleCardInput()`, `updateCardAmounts()`, `formatInputAmount()`, and `sanitizeAmount()` in `app.js`.
- Replaced home/target layout styles with `.board`, `.currency-grid`, `.currency-card`, and related responsive rules.
- Fixed the brand link accessible name to include the visible `cur$nomad` text (axe `label-content-name-mismatch`).
- Bumped the service worker cache to `curnomad-v1.1.2`.
- Changed `server.js` to send `Cache-Control: no-cache` for all assets so phones on LAN HTTP see updated JS/CSS immediately instead of cached builds.
- Increased the currency amount and symbol font sizes by roughly 44% overall for stronger readability; layout checks still pass with no overflow.
- Bumped the service worker cache to `curnomad-v1.1.3`.
- Made the hero heading one line at every width by removing the line break and tuning responsive sizing.
- Set clock times and currency amounts to the same responsive font size, then increased both again for stronger legibility.
- Added `getCurrencyCountry()` with country overrides for shared currencies; target and nearby tags now show country names, and the picker eyebrow uses the country name.
- Enlarged the card country tag, currency selector, currency name, and clock location text; tightened tag shrinking so cards stay within bounds at 320px.
- Removed the clock card top border so no divider line appears between the rate update text and the clocks.
- Bumped the service worker cache to `curnomad-v1.1.4`.
- Restarted the local development server; current PID is `15820`. The app remains local/LAN only, not publicly deployed.

## Persistence Details

`localStorage` keys:

- `roam.state.v1` - home currency, amount, targets, and location.
- `roam.rates.v1` - cached exchange rates and timestamps.

The `roam.*` key names are retained intentionally so existing saved state and cached rates survive the rebrand.

Saved location shape:

```js
{
  countryCode: "GB",
  countryName: "United Kingdom",
  city: "London",
  localCurrency: "GBP",
  timezone: "Europe/London",
  source: "gps",
  detectedAt: "2026-10-23T07:44:11.492Z"
}
```

When local currency equals the home currency, the nearby target uses a fallback currency and shows that currency's country in its tag. The detected local currency is retained in `location.localCurrency`.

## Verification Completed

All of the following passed:

- `npm run check`
- Full Playwright conversion flow:
  - approximate location
  - precise GPS location
  - amount conversion
  - home currency change
  - target currency change
  - persistence after reload
  - offline shell and cached rates
  - no console or page errors
- Dedicated clock test:
  - home clock uses expected currency timezone
  - current clock uses saved location timezone
  - location detection updates the clock
  - detected timezone is persisted
  - older locations without timezone receive a fallback
- Responsive layout at `320`, `360`, `390`, `768`, `940`, `1024`, `1280`, and `1440` px.
- No page-level horizontal overflow and no card overflow at tested widths.
- Clocks confirmed side by side at every tested width.
- Currency grid confirmed 2x2 with aligned rows and columns at every tested width.
- Editing a target card amount confirmed to recalculate the home and other target amounts.
- Currency picker confirmed to open from each card and change that card's currency.
- Hero confirmed single-line with no clipping at every tested width.
- Clock times and currency amounts confirmed to use the same computed font size.
- Country tags confirmed for home, nearby, and target cards, including picker country labels.
- axe audits on mobile and desktop: `0` violations.
- axe audits with the currency dialog open: `0` violations.

## Test Setup

Playwright and axe test scripts are stored in:

`C:\Users\tj2ng\AppData\Local\Temp\roam-test`

Useful scripts:

- `test.js` - full functional and offline flow.
- `clocks.js` - home/current clock behavior.
- `cards.js` - 2x2 grid, side-by-side clocks, editable amounts, and picker flow.
- `latest.js` - one-line hero, matching clock/amount font sizes, country tags, and layout checks.
- `layout.js` - responsive width checks.
- `axe.js` - mobile accessibility audit.
- `axe-desktop.js` - desktop accessibility audit.

Chrome executable used by the tests:

`C:\Program Files\Google\Chrome\Application\chrome.exe`

The local server is running at `http://localhost:3000` and `http://192.168.0.160:3000` (PID 15820). Logs are written to `%TEMP%\curnomad-server.out.log` and `%TEMP%\curnomad-server.err.log`. Stop it with `Stop-Process -Id 15820`.

## Resume Instructions

Start the app:

```powershell
cd "C:\Users\tj2ng\My-Repo\Personalised Currency Converter"
npm start
```

Run checks:

```powershell
npm run check
```

Run clock tests:

```powershell
node "$env:TEMP\roam-test\clocks.js"
```

Run card and layout tests:

```powershell
node "$env:TEMP\roam-test\cards.js"
node "$env:TEMP\roam-test\layout.js"
```

Run accessibility tests:

```powershell
node "$env:TEMP\roam-test\axe.js"
node "$env:TEMP\roam-test\axe-desktop.js"
```

Note: If cached app-shell files change, bump `VERSION` in `sw.js` again.

## Open Design Note

There is no explicit home-city setting. The home clock currently uses a representative timezone for the selected home currency. A possible future enhancement is to let the user choose or store a home city/timezone directly, especially for currencies used across multiple timezones such as USD, EUR, AUD, CAD, and BRL.

## Recent Additions (2026-10-24)

- Added hamburger menu with About and Set home location/timezone.
- Home clock is clickable with city search (Open-Meteo), timezone selection, OK/Cancel, optional home currency update, use current location.
- Home timezone override persisted in roam.home.v1.
- Added weather to clocks via Open-Meteo with coordinates, 30-min cache in roam.weather.v1. Temperature/condition with animations, pill bottom-right.
- Removed Edit hint from home clock.
- Updated icons to assets/curnomad-app.png in manifest/HTML/SW with multiple sizes.
- Hero rate meta moved inline, shifted up.
- Server CSP updated for Open-Meteo.
- Service worker bumped to curnomad-v1.1.14.

## Session 2026-10-25 11:14:03

Session summary: converted Curnomad to Vite, added PWA setup, bumped to v0.1, added About/privacy/terms, deployed via gh-pages to kenkanfix.github.io/curnomad/ (project site) and added workflow for central user pages repo with deploy keys.

## Session 2026-10-26 - Native Packaging and Store Prep

Project: `C:\Users\tj2ng\My-Repo\CurNomad`
Status: Android release artifacts are signed and store assets are prepared locally. The iOS project and CI workflow are prepared but have not been built or signed. No commits or pushes; `main` remains at `f6c722c`.

### Completed

- Added Capacitor Android/iOS projects, native app config, native status-bar/splash handling, geolocation support, icons/splash assets, manifest permissions, and version metadata.
- Native identity: `io.github.kenkanfix.curnomad`; version `1.0.0`; Android `versionCode 1`; iOS `CURRENT_PROJECT_VERSION 1`; Android minSdk `24`, targetSdk `36`; iOS device family iPhone + iPad.
- Added Android upload signing with `android/keystore/curnomad-upload.jks`, alias `curnomad`. Credentials are in ignored `android/keystore/keystore-password.txt` and `android/keystore.properties`; do not commit or print them.
- Updated in-app privacy text to disclose the startup IP-based BigDataCloud lookup, optional device location, and Open-Meteo weather. Updated the web and iOS public privacy policy.
- Fixed the offline banner so `[hidden]` actually hides it: `.offline-banner[hidden] { display: none; }`.
- Rebuilt `dist` and `dist-native`; `npm run check`, the web build, native build, and `npx cap sync` passed.
- Rebuilt and copied signed Android artifacts:
  - `store/builds/Curnomad-1.0.0-release.aab` - 3,897,887 bytes; SHA256 `7DBB55C7FF63DA25ECF7D59D8A542C7F2F165BF091F01C5216D175281059FF10`.
  - `store/builds/Curnomad-1.0.0-release.apk` - 4,190,691 bytes; SHA256 `C445FB60804C9C0DEAE5167F79E511CD4A4500E72BB46B9CB6CD267759560BA8`.
- APK verified with `apksigner`: signer `CN=Curnomad, O=KenKanfix, C=AU`; certificate SHA256 `88b6620d999fcf9a9abeb1506b049803a46b6072e0efb6f4b619dd441c0e3cbf`.
- AAB verified with normal `jarsigner -verify`: `jar verified.`, exit `0`. Self-signed/no-timestamp warnings are expected for the upload key.
- Confirmed the packaged APK/AAB contain the offline-banner CSS fix and updated privacy text.
- Added shared iOS scheme `ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`.
- Added `.github/workflows/ios.yml` for `macos-15`: Node 24, `npm ci`, `npm run build:native`, `npx cap sync ios`, Swift package resolution, and Xcode archive. Unsigned archive by default; optional signed IPA/App Store Connect upload when secrets exist.
- iOS workflow secrets expected: `IOS_CERTIFICATE_P12`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE`, `IOS_TEAM_ID`, `APPSTORE_ISSUER_ID`, `APPSTORE_KEY_ID`, `APPSTORE_PRIVATE_KEY`.
- YAML syntax validated; workflow not run because this machine is Windows.
- Created `store/listing.json` with Play/App Store metadata, data-safety/privacy labels, review notes, and screenshot mappings. JSON validates.
- Metadata lengths are within limits: Play title 28, short description 75, full description 1166; App Store name 8, subtitle 28, promotional text 145, keywords 83, description 1166.
- Generated final RGB store screenshots from `dist-native`:
  - `store/screenshots/iphone-6.9.png` - 1320x2868.
  - `store/screenshots/ipad-13.png` - 2064x2752.
  - `store/screenshots/android-phone.png` - 1080x1920.
  - `store/screenshots/android-phone-2.png` - 1080x1920 (currency picker).
  - `store/screenshots/android-tablet-10.png` - 1600x2560.
- Play phone list now has two screenshots; temporary test screenshots were removed.
- Capture check confirmed the offline banner was hidden and all four currency cards rendered. The install button was hidden in captures to match the native shell.
- `npm audit` still reports dev-dependency issues: 4 moderate, 4 high, 1 critical. Not addressed.

### Android build note

Gradle was unstable under Windows antivirus file locks. The successful approach was:

```powershell
$env:GRADLE_USER_HOME = "C:\Users\tj2ng\AppData\Local\Temp\opencode\gradle-home"
$env:GRADLE_OPTS = "-Dorg.gradle.vfs.watch=false -Dorg.gradle.daemon=false"
.\gradlew.bat bundleRelease assembleRelease --no-daemon --max-workers=1 --no-parallel
```

If antivirus causes `AccessDenied` during transform/cache writes, delete `caches\8.14.3\transforms` and retry. Passing `-Dorg.gradle...` directly on the PowerShell command line was misparsed; use `GRADLE_OPTS`.

### Resume and verification

- Run web checks: `npm run check`.
- Build native assets: `npm run build:native`.
- Sync native projects: `npx cap sync`.
- Serve screenshots: `python -m http.server 4173 --directory dist-native`.
- Re-verify APK certificate: `apksigner verify --print-certs store/builds/Curnomad-1.0.0-release.apk`.
- Re-verify AAB: `jarsigner -verify store/builds/Curnomad-1.0.0-release.aab`.
- Android SDK: `C:\Users\tj2ng\AppData\Local\Android\Sdk`; Java 21 Temurin.
- Screenshot tooling: `playwright-core` in `C:\Users\tj2ng\AppData\Local\Temp\opencode\pw`; Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.

### Remaining work

- Review `git status`; commit/push only with explicit approval.
- Run the iOS workflow on macOS/GitHub Actions. Validate the unsigned archive first, then configure Apple signing secrets for a signed IPA.
- Upload the AAB/APK, listing metadata, and screenshots to Google Play/App Store Connect.
- Optionally address `npm audit` findings.

### Housekeeping

- Repaired the corrupted UTF-16LE text at the end of the previous session entry so this history file remains readable.
