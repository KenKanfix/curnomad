# Store upload packages

Version 0.1.0 (build 1) for Dasnomad.

- `google-play/` - signed AAB, APK, graphics, screenshots, metadata, and internal testing instructions.
- `app-store/` - TestFlight instructions, App Store metadata, screenshots, icon reference, and export options template.
- `builds/` - canonical copies of the signed Android artifacts.
- `listing.json` - source of truth for app identity and store metadata.
- `assets/` - source icons and feature graphic.
- `screenshots/` - current branded screenshots used by both packages.

Apple cannot be built on Windows. Use `.github/workflows/ios.yml` with the
required Apple secrets, or archive in Xcode on a Mac. Google Play can be uploaded
immediately from `google-play/builds/`.
