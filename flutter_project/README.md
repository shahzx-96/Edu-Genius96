# EduGenius AI - Native Android Flutter Application

> **Tagline:** Your Personal AI Teacher in Your Pocket.

An AI-powered native Android application for school students, college engineering students, and competitive examination candidates built with Flutter & Dart.

---

## 1. Prerequisites & SDK Versions

- **Flutter SDK:** Flutter 3.19.0 or higher (Stable Channel)
- **Dart SDK:** Dart 3.3.0 or higher
- **Android SDK:**
  - Minimum SDK version: **API 26 (Android 8.0 Oreo)**
  - Target SDK version: **API 34 (Android 14)**
  - Compile SDK version: **API 34**
  - Java/JDK: **OpenJDK 17**
- **Node.js (for Firebase Cloud Functions):** Node 18 or 20 LTS
- **Firebase CLI:** `npm install -g firebase-tools`

---

## 2. Firebase Project Setup

1. **Create Firebase Project:**
   Go to [Firebase Console](https://console.firebase.google.com/) and create a new project named `edugenius-ai`.

2. **Add Android App:**
   - Package name: `com.edugenius.ai`
   - Download the generated `google-services.json` and place it in:
     `android/app/google-services.json`

3. **Enable Firebase Products:**
   - **Authentication:** Enable Email/Password and Google Sign-In provider.
   - **Cloud Firestore:** Create Firestore in production mode.
   - **Firebase Storage:** Create Storage bucket.
   - **Cloud Functions:** Initialize with TypeScript.

4. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

---

## 3. Set Gemini API Key as Firebase Secret

> **Security Rule:** The Gemini API key must NEVER be included in the Flutter Android app. It is stored as an encrypted Firebase secret accessed only by Cloud Functions backend.

Run the following command in your terminal:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

When prompted, paste your Google Gemini API key from Google AI Studio.

Then deploy your backend functions:

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## 4. Build Release APK

To generate a signed, production-ready release APK for Android devices:

```bash
# 1. Fetch dependencies
flutter pub get

# 2. Run unit & widget checks
flutter analyze

# 3. Build optimized release APK with ProGuard obfuscation & resource shrinking
flutter build apk --release --split-per-abi
```

The output release APKs will be located at:
`build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`
`build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk`

To build a universal release APK:
```bash
flutter build apk --release
```

---

## 5. Android Permissions (`AndroidManifest.xml`)

Only the following required permissions are configured:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```
