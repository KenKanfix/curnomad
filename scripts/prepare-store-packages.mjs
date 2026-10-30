import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STORE = path.join(ROOT, "store");
const LISTING = JSON.parse(await fs.readFile(path.join(STORE, "listing.json"), "utf8"));

const AAB_SOURCE = path.join(ROOT, "android", "app", "build", "outputs", "bundle", "release", "app-release.aab");
const APK_SOURCE = path.join(ROOT, "android", "app", "build", "outputs", "apk", "release", "app-release.apk");
const AAB_NAME = `Dasnomad-${LISTING.app.version}-release.aab`;
const APK_NAME = `Dasnomad-${LISTING.app.version}-release.apk`;

const googlePlay = path.join(STORE, "google-play");
const appStore = path.join(STORE, "app-store");
const builds = path.join(STORE, "builds");

async function ensure(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copy(source, destination) {
  await ensure(path.dirname(destination));
  await fs.copyFile(source, destination);
}

async function text(relativePath, content) {
  const destination = path.join(STORE, relativePath);
  await ensure(path.dirname(destination));
  await fs.writeFile(destination, `${content.trim()}\n`, "utf8");
}

async function sha256(filePath) {
  const data = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(data).digest("hex").toUpperCase();
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

await ensure(builds);
await ensure(path.join(googlePlay, "metadata", "en-US"));
await ensure(path.join(appStore, "metadata", "en-US"));

await fs.access(AAB_SOURCE);
await fs.access(APK_SOURCE);

await copy(AAB_SOURCE, path.join(builds, AAB_NAME));
await copy(APK_SOURCE, path.join(builds, APK_NAME));
await copy(AAB_SOURCE, path.join(googlePlay, "builds", AAB_NAME));
await copy(APK_SOURCE, path.join(googlePlay, "builds", APK_NAME));

await copy(path.join(STORE, "assets", "icon-512.png"), path.join(googlePlay, "graphics", "icon-512.png"));
await copy(path.join(STORE, "assets", "feature-graphic.png"), path.join(googlePlay, "graphics", "feature-graphic-1024x500.png"));
await copy(path.join(STORE, "assets", "icon-1024.png"), path.join(appStore, "graphics", "icon-1024.png"));

await copy(path.join(STORE, "screenshots", "android-phone.png"), path.join(googlePlay, "screenshots", "phone", "01-converter.png"));
await copy(path.join(STORE, "screenshots", "android-phone-2.png"), path.join(googlePlay, "screenshots", "phone", "02-local-tip.png"));
await copy(path.join(STORE, "screenshots", "android-tablet-10.png"), path.join(googlePlay, "screenshots", "tablet-10", "01-converter.png"));

await copy(path.join(STORE, "screenshots", "iphone-6.9.png"), path.join(appStore, "screenshots", "iphone-6.9", "01-converter.png"));
await copy(path.join(STORE, "screenshots", "ipad-13.png"), path.join(appStore, "screenshots", "ipad-13", "01-converter.png"));

await text("google-play/metadata/en-US/title.txt", LISTING.googlePlay.title);
await text("google-play/metadata/en-US/short-description.txt", LISTING.googlePlay.shortDescription);
await text("google-play/metadata/en-US/full-description.txt", LISTING.googlePlay.fullDescription);
await text(
  "google-play/metadata/en-US/release-notes.txt",
  `Initial internal testing build for Dasnomad ${LISTING.app.version}.

Includes live mid-market rates, four-currency conversion, optional local currency detection, home and local clocks, local travel tips, and offline access to the last saved rates. Home and current-location cards now explain how to change their currencies, and the current-location card is clearly labelled.`,
);

await text(
  "google-play/metadata/en-US/data-safety.txt",
  `DATA SAFETY ANSWERS

Does your app collect or share any of the required user data types? Yes.

Location
- Approximate location: collected, optional, shared, app functionality, not stored by developer, encrypted in transit.
- Precise location: collected, optional, shared, app functionality, not stored by developer, encrypted in transit.

Personal info
- None.

Financial info
- None. The app does not process payments.

Messages, photos, videos, audio, files, contacts, calendar, health, web browsing
- None.

App activity / app info and performance / device or other IDs
- None collected by the developer.

Data handling
- Data is not sold.
- Data is not used for advertising or tracking.
- Location is sent to BigDataCloud for reverse geocoding and may be sent to Open-Meteo for weather.
- Exchange rates are requested from ExchangeRate-API without personal identifiers.
- Preferences and cached data stay on the device.
- No account exists, so no account deletion flow is required. Users can clear app storage or uninstall the app to remove local data.

Security
- Data is encrypted in transit using HTTPS.
- The developer does not operate a server that stores user data.`,
);

await text(
  "google-play/metadata/en-US/content-rating.txt",
  `CONTENT RATING QUESTIONNAIRE NOTES

- Category: Utility / Finance / Travel.
- Violence, sexuality, nudity, language, controlled substances, gambling: No.
- User-generated content or social features: No.
- Shares user location: Yes, optional and user initiated.
- Shares personal information: No account or profile; optional location only.
- Digital purchases: No.
- Ads: No.
- Expected rating: Everyone / PEGI 3 / ESRB E.

Review the final answers in Play Console. This file is a guide, not an uploaded asset.`,
);

await text(
  "google-play/README.md",
  `# Google Play upload package

App: ${LISTING.app.name}
Package: ${LISTING.app.bundleId}
Version: ${LISTING.app.version} (versionCode ${LISTING.app.build})

## What is in this folder

- \`builds/${AAB_NAME}\` - signed Android App Bundle for Play Console.
- \`builds/${APK_NAME}\` - signed APK for direct device testing. Do not upload the APK to Play Console.
- \`graphics/icon-512.png\` - 512 x 512 app icon.
- \`graphics/feature-graphic-1024x500.png\` - feature graphic.
- \`screenshots/phone/\` - 1080 x 1920 phone screenshots.
- \`screenshots/tablet-10/\` - 1600 x 2560 ten-inch tablet screenshot.
- \`metadata/en-US/\` - copy/paste store listing, release notes, data safety, and content rating notes.

## Internal testing upload steps

1. Open Google Play Console and create the app.
   - App name: ${LISTING.googlePlay.title}
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
2. Complete the required declarations:
   - Privacy policy: ${LISTING.app.privacyPolicyUrl}
   - Ads: No
   - App access: No account or login required.
   - Content rating: complete the questionnaire using \`metadata/en-US/content-rating.txt\`.
   - Target audience: 13+ or general audience, based on the questionnaire.
   - Data safety: use \`metadata/en-US/data-safety.txt\`.
   - Government apps: No. Financial features: No. Health: No.
3. Set up Internal testing.
   - Create an email list of testers.
   - Upload \`builds/${AAB_NAME}\`.
   - Copy release notes from \`metadata/en-US/release-notes.txt\`.
   - Roll out the internal test and share the opt-in link.
4. Complete the store listing.
   - Copy title, short description, and full description from \`metadata/en-US/\`.
   - Upload the icon, feature graphic, phone screenshots, and tablet screenshot.
5. Install the APK on a test device for a final smoke test before inviting testers.

## Signing warning

The AAB is signed with the existing upload key in \`android/keystore.properties\`.
Keep the keystore and passwords backed up. If Play App Signing is enabled, the
upload key is still required for every future update.

## Build verification

Run these from the repository root after building:

\`\`\`powershell
& "$env:LOCALAPPDATA\\Android\\Sdk\\build-tools\\36.0.0\\aapt.exe" dump badging store/builds/${APK_NAME}
& "$env:LOCALAPPDATA\\Android\\Sdk\\build-tools\\36.0.0\\apksigner.bat" verify --print-certs store/builds/${APK_NAME}
jarsigner -verify store/builds/${AAB_NAME}
\`\`\`

Expected identity: ${LISTING.app.bundleId}, versionName ${LISTING.app.version}, versionCode ${LISTING.app.build}.
`,
);

await text(
  "app-store/metadata/en-US/name.txt",
  LISTING.appStore.name,
);
await text("app-store/metadata/en-US/subtitle.txt", LISTING.appStore.subtitle);
await text("app-store/metadata/en-US/promotional-text.txt", LISTING.appStore.promotionalText);
await text("app-store/metadata/en-US/description.txt", LISTING.appStore.description);
await text("app-store/metadata/en-US/keywords.txt", LISTING.appStore.keywords);
await text("app-store/metadata/en-US/support-url.txt", LISTING.app.supportUrl);
await text("app-store/metadata/en-US/marketing-url.txt", LISTING.app.marketingUrl);
await text("app-store/metadata/en-US/privacy-policy-url.txt", LISTING.app.privacyPolicyUrl);
await text("app-store/metadata/en-US/review-notes.txt", LISTING.appStore.reviewNotes);
await text(
  "app-store/metadata/en-US/release-notes.txt",
  `Initial TestFlight build for Dasnomad ${LISTING.app.version}.

Live mid-market rates, four currencies in view, optional local currency detection, home and local clocks, local travel tips, and offline access to the last saved rates. Home and current-location cards now explain how to change their currencies, and the current-location card is clearly labelled.`,
);
await text(
  "app-store/metadata/en-US/testflight-description.txt",
  "Dasnomad is a calm, travel-friendly currency converter with live mid-market rates, four currencies in view, optional local currency detection, local tips, and offline access to your last saved rates. Please report bugs and confusing screens through TestFlight feedback.",
);
await text(
  "app-store/metadata/en-US/testflight-feedback-email.txt",
  "kenkanfix@gmail.com",
);
await text(
  "app-store/metadata/en-US/privacy-labels.txt",
  `APP PRIVACY ANSWERS

Does your app collect data? Yes.

Data Used to Track You
- None.

Data Linked to You
- None.

Data Not Linked to You
- Coarse Location: App Functionality, optional.
- Precise Location: App Functionality, optional.

Tracking
- The app does not track users across apps or websites.
- No advertising SDKs or analytics SDKs.

Notes
- Location permission is optional and only used to detect the local currency,
  reverse geocode the approximate area, and show local weather.
- The app has no account or sign-in.
- Preferences and cached data stay on the device.`,
);

await text(
  "app-store/ExportOptions.plist",
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>signingStyle</key>
  <string>manual</string>
  <key>teamID</key>
  <string>REPLACE_WITH_APPLE_TEAM_ID</string>
  <key>provisioningProfiles</key>
  <dict>
    <key>${LISTING.app.bundleId}</key>
    <string>REPLACE_WITH_PROVISIONING_PROFILE_NAME</string>
  </dict>
  <key>uploadSymbols</key>
  <true/>
  <key>destination</key>
  <string>export</string>
</dict>
</plist>`,
);

await text(
  "app-store/README.md",
  `# App Store / TestFlight upload package

App: ${LISTING.app.name}
Bundle ID: ${LISTING.app.bundleId}
Version: ${LISTING.app.version} (build ${LISTING.app.build})

Windows cannot produce a signed iOS archive or IPA. Build and upload iOS from
the included GitHub Actions workflow on a macOS runner, or from Xcode on a Mac.

## One-time Apple setup

1. Join the Apple Developer Program.
2. In Certificates, Identifiers & Profiles, create an App ID:
   - Bundle ID: \`${LISTING.app.bundleId}\`
   - Capabilities: no special capabilities required.
3. In App Store Connect, create a new app:
   - Platform: iOS
   - Name: ${LISTING.appStore.name}
   - Primary language: English (U.S.)
   - Bundle ID: select \`${LISTING.app.bundleId}\`
   - SKU: \`DASNOMAD001\`
4. Create an Apple Distribution certificate and an App Store provisioning profile for \`${LISTING.app.bundleId}\`.
5. Create an App Store Connect API key with App Manager access.
6. Add these GitHub repository secrets:
   - \`IOS_CERTIFICATE_P12\` - base64 of the distribution certificate .p12
   - \`IOS_CERTIFICATE_PASSWORD\` - password for the .p12
   - \`IOS_PROVISIONING_PROFILE\` - base64 of the .mobileprovision
   - \`IOS_TEAM_ID\` - Apple team ID
   - \`APPSTORE_ISSUER_ID\` - App Store Connect API issuer ID
   - \`APPSTORE_KEY_ID\` - API key ID
   - \`APPSTORE_PRIVATE_KEY\` - contents of the \`AuthKey_*.p8\` file

## Build and upload

The workflow at \`.github/workflows/ios.yml\` builds the native web assets, creates
a signed archive, exports an App Store IPA, uploads it to App Store Connect, and
stores the IPA as a workflow artifact.

Run it from GitHub Actions with **Build iOS > Run workflow**, or push a version tag:

\`\`\`powershell
git tag v${LISTING.app.version}
git push origin v${LISTING.app.version}
\`\`\`

After App Store Connect finishes processing the build, open TestFlight, select
the build, and add internal testers. Internal testing does not require App Review.
External testing requires a beta review.

## TestFlight information

- Beta app description: \`metadata/en-US/testflight-description.txt\`
- Feedback email: \`metadata/en-US/testflight-feedback-email.txt\` (kenkanfix@gmail.com)
- Privacy policy: ${LISTING.app.privacyPolicyUrl}
- Review notes: \`metadata/en-US/review-notes.txt\`

## App Store listing

Copy the listing text files in \`metadata/en-US/\` into App Store Connect, and use
\`metadata/en-US/privacy-labels.txt\` for the App Privacy questionnaire. Upload:
- iPhone 6.9-inch screenshot: \`screenshots/iphone-6.9/01-converter.png\`
- iPad 13-inch screenshot: \`screenshots/ipad-13/01-converter.png\`

## Local Xcode export

The workflow generates its own export options. If you archive manually in Xcode,
open \`ExportOptions.plist\`, replace \`REPLACE_WITH_APPLE_TEAM_ID\` and
\`REPLACE_WITH_PROVISIONING_PROFILE_NAME\`, then export the archive.

## Signing warning

The distribution certificate and provisioning profile are tied to the Apple
Developer account. Keep the API key private and never commit it.
`,
);

await text(
  "README.md",
  `# Store upload packages

Version ${LISTING.app.version} (build ${LISTING.app.build}) for ${LISTING.app.name}.

- \`google-play/\` - signed AAB, APK, graphics, screenshots, metadata, and internal testing instructions.
- \`app-store/\` - TestFlight instructions, App Store metadata, screenshots, icon reference, and export options template.
- \`builds/\` - canonical copies of the signed Android artifacts.
- \`listing.json\` - source of truth for app identity and store metadata.
- \`assets/\` - source icons and feature graphic.
- \`screenshots/\` - current branded screenshots used by both packages.

Apple cannot be built on Windows. Use \`.github/workflows/ios.yml\` with the
required Apple secrets, or archive in Xcode on a Mac. Google Play can be uploaded
immediately from \`google-play/builds/\`.
`,
);

const artifacts = [
  path.join(builds, AAB_NAME),
  path.join(builds, APK_NAME),
];
const lines = [
  `SHA256 checksums for Dasnomad ${LISTING.app.version} (build ${LISTING.app.build})`,
  "",
];
for (const artifact of artifacts) {
  lines.push(`${await sha256(artifact)}  ${path.basename(artifact)}`);
}
await text("builds/SHA256SUMS.txt", lines.join("\n"));

console.log(`Prepared store packages for ${LISTING.app.name} ${LISTING.app.version} (build ${LISTING.app.build}).`);
for (const artifact of artifacts) {
  const stat = await fs.stat(artifact);
  console.log(`${path.relative(ROOT, artifact)} - ${stat.size} bytes - SHA256 ${await sha256(artifact)}`);
}
