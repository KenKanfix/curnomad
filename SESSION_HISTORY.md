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
