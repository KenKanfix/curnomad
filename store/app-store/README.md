# App Store / TestFlight upload package

App: Dasnomad
Bundle ID: io.github.kenkanfix.dasnomad
Version: 0.1.0 (build 1)

Windows cannot produce a signed iOS archive or IPA. Build and upload iOS from
the included GitHub Actions workflow on a macOS runner, or from Xcode on a Mac.

## One-time Apple setup

1. Join the Apple Developer Program.
2. In Certificates, Identifiers & Profiles, create an App ID:
   - Bundle ID: `io.github.kenkanfix.dasnomad`
   - Capabilities: no special capabilities required.
3. In App Store Connect, create a new app:
   - Platform: iOS
   - Name: Dasnomad
   - Primary language: English (U.S.)
   - Bundle ID: select `io.github.kenkanfix.dasnomad`
   - SKU: `DASNOMAD001`
4. Create an Apple Distribution certificate and an App Store provisioning profile for `io.github.kenkanfix.dasnomad`.
5. Create an App Store Connect API key with App Manager access.
6. Add these GitHub repository secrets:
   - `IOS_CERTIFICATE_P12` - base64 of the distribution certificate .p12
   - `IOS_CERTIFICATE_PASSWORD` - password for the .p12
   - `IOS_PROVISIONING_PROFILE` - base64 of the .mobileprovision
   - `IOS_TEAM_ID` - Apple team ID
   - `APPSTORE_ISSUER_ID` - App Store Connect API issuer ID
   - `APPSTORE_KEY_ID` - API key ID
   - `APPSTORE_PRIVATE_KEY` - contents of the `AuthKey_*.p8` file

## Build and upload

The workflow at `.github/workflows/ios.yml` builds the native web assets, creates
a signed archive, exports an App Store IPA, uploads it to App Store Connect, and
stores the IPA as a workflow artifact.

Run it from GitHub Actions with **Build iOS > Run workflow**, or push a version tag:

```powershell
git tag v0.1.0
git push origin v0.1.0
```

After App Store Connect finishes processing the build, open TestFlight, select
the build, and add internal testers. Internal testing does not require App Review.
External testing requires a beta review.

## TestFlight information

- Beta app description: `metadata/en-US/testflight-description.txt`
- Feedback email: `metadata/en-US/testflight-feedback-email.txt` (kenkanfix@gmail.com)
- Privacy policy: https://kenkanfix.github.io/dasnomad/privacy.html
- Review notes: `metadata/en-US/review-notes.txt`

## App Store listing

Copy the listing text files in `metadata/en-US/` into App Store Connect, and use
`metadata/en-US/privacy-labels.txt` for the App Privacy questionnaire. Upload:
- iPhone 6.9-inch screenshot: `screenshots/iphone-6.9/01-converter.png`
- iPad 13-inch screenshot: `screenshots/ipad-13/01-converter.png`

## Local Xcode export

The workflow generates its own export options. If you archive manually in Xcode,
open `ExportOptions.plist`, replace `REPLACE_WITH_APPLE_TEAM_ID` and
`REPLACE_WITH_PROVISIONING_PROFILE_NAME`, then export the archive.

## Signing warning

The distribution certificate and provisioning profile are tied to the Apple
Developer account. Keep the API key private and never commit it.
