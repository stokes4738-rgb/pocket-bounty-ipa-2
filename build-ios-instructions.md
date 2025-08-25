# iOS IPA Build Instructions for Pocket Bounty

Your Capacitor iOS project is ready! Since iOS builds require Xcode (macOS only), here are your options:

## Option 1: Build on Mac with Xcode

### Prerequisites:
- macOS with Xcode installed
- Your P12 certificate and provisioning profile
- Apple Developer account

### Steps:

1. **Copy the project to your Mac:**
   ```bash
   # Download the entire ios/ folder to your Mac
   ```

2. **Open in Xcode:**
   ```bash
   open ios/App/App.xcworkspace
   ```

3. **Configure Signing:**
   - Select your project in Xcode
   - Go to "Signing & Capabilities" tab
   - Set your Team and Bundle Identifier: `com.pocketbounty.app`
   - Import your P12 certificate in Keychain Access
   - Select your provisioning profile

4. **Build IPA:**
   ```bash
   # In Terminal, from the ios/App directory:
   xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS -archivePath App.xcarchive archive

   # Export IPA:
   xcodebuild -exportArchive -archivePath App.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist
   ```

## Option 2: Use GitHub Actions (CI/CD)

Create `.github/workflows/ios-build.yml`:

```yaml
name: iOS Build
on:
  workflow_dispatch:
  
jobs:
  ios-build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build web app
        run: npm run build
        
      - name: Sync Capacitor
        run: npx cap sync ios
        
      - name: Build iOS
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS -archivePath App.xcarchive archive
          
      - name: Upload IPA
        uses: actions/upload-artifact@v3
        with:
          name: pocket-bounty-ipa
          path: ios/App/build/*.ipa
```

## Option 3: Use Codemagic or Similar CI Service

1. Connect your repository to Codemagic
2. Upload your P12 certificate and provisioning profile
3. Configure build script to run Capacitor sync and Xcode build

## Required Files for Signing:

You'll need to create `ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.pocketbounty.app</key>
        <string>YOUR_PROVISIONING_PROFILE_NAME</string>
    </dict>
    <key>signingCertificate</key>
    <string>iPhone Distribution</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

## Project Configuration:

- **App Name:** Pocket Bounty
- **Bundle ID:** com.pocketbounty.app
- **Permissions:** Camera, Photo Library, Network Access
- **Orientation:** Portrait + Landscape

The iOS project is fully configured and ready for building with your P12 certificate!