# Google Play upload package

App: Dasnomad
Package: io.github.kenkanfix.dasnomad
Version: 0.1.0 (versionCode 1)

## What is in this folder

- `builds/Dasnomad-0.1.0-release.aab` - signed Android App Bundle for Play Console.
- `builds/Dasnomad-0.1.0-release.apk` - signed APK for direct device testing. Do not upload the APK to Play Console.
- `graphics/icon-512.png` - 512 x 512 app icon.
- `graphics/feature-graphic-1024x500.png` - feature graphic.
- `screenshots/phone/` - 1080 x 1920 phone screenshots.
- `screenshots/tablet-10/` - 1600 x 2560 ten-inch tablet screenshot.
- `metadata/en-US/` - copy/paste store listing, release notes, data safety, and content rating notes.

## Internal testing upload steps

1. Open Google Play Console and create the app.
   - App name: Dasnomad: Currency Converter
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
2. Complete the required declarations:
   - Privacy policy: https://kenkanfix.github.io/dasnomad/privacy.html
   - Ads: No
   - App access: No account or login required.
   - Content rating: complete the questionnaire using `metadata/en-US/content-rating.txt`.
   - Target audience: 13+ or general audience, based on the questionnaire.
   - Data safety: use `metadata/en-US/data-safety.txt`.
   - Government apps: No. Financial features: No. Health: No.
3. Set up Internal testing.
   - Create an email list of testers.
   - Upload `builds/Dasnomad-0.1.0-release.aab`.
   - Copy release notes from `metadata/en-US/release-notes.txt`.
   - Roll out the internal test and share the opt-in link.
4. Complete the store listing.
   - Copy title, short description, and full description from `metadata/en-US/`.
   - Upload the icon, feature graphic, phone screenshots, and tablet screenshot.
5. Install the APK on a test device for a final smoke test before inviting testers.

## Signing warning

The AAB is signed with the existing upload key in `android/keystore.properties`.
Keep the keystore and passwords backed up. If Play App Signing is enabled, the
upload key is still required for every future update.

## Build verification

Run these from the repository root after building:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\aapt.exe" dump badging store/builds/Dasnomad-0.1.0-release.apk
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\apksigner.bat" verify --print-certs store/builds/Dasnomad-0.1.0-release.apk
jarsigner -verify store/builds/Dasnomad-0.1.0-release.aab
```

Expected identity: io.github.kenkanfix.dasnomad, versionName 0.1.0, versionCode 1.
