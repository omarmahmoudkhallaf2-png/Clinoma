# Clinoma Android Wrapper App

A separate Flutter-based mobile application project that wraps the Clinoma web platform (`https://clinomabank-44.pages.dev/`) inside an optimized native WebView, implementing automatic offline background caching and subscription enforcement.

---

## Caching & Offline Architecture

- **Zero modification to original web code**: All intercept and cache logic resides natively in the Android wrapper.
- **Smart Background Caching**: Intercepts HTTP/HTTPS requests in real-time. When online, all visited resources (questions, layouts, assets) are fetched, cached locally in the app documents directory, and returned. 
- **LRU Cache Limit**: Limits local cached items to the last 500 records automatically.
- **Offline Filtering**: When connectivity is lost, only resources available in the local database/cache are loaded. If a resource is not found, a beautiful custom local offline screen is shown instead of native browser error screens.
- **Grace Period (48 Hours)**: When offline, allows active users to continue using the app for up to 48 hours using their last verified authentication/subscription state. Beyond 48 hours offline, the app prompts for an internet connection to re-verify status.

---

## Instructions to Setup & Export APK

Follow these steps to compile and export the Android APK:

### 1. Prerequisites
- **Flutter SDK**: Install the Flutter SDK by following the official guide: [flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install).
- **Java Development Kit (JDK)**: Ensure JDK 17 (recommended) is installed.
- **Android Studio / Command Line Tools**: Install Android Studio to get the Android SDK, platforms, build tools, and set up an emulator or device.

---

### 2. Configure Android Permissions & Build Tools
To enable networking and WebView storage, ensure the following tags are in your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
```

Also, set `minSdkVersion` to `21` or higher in `android/app/build.gradle`.

---

### 3. Run and Verify locally
Open the terminal inside `f:\Med Prep\clinoma-android-wrapper` and run:

1. **Install dependencies**:
   ```bash
   flutter pub get
   ```
2. **Run in debug mode (on emulator or connected USB device)**:
   ```bash
   flutter run
   ```

---

### 4. Build APK (Production)
Run the following command to compile a release-optimized APK package:

```bash
flutter build apk --release
```

- The compiled APK file will be output to:
  `f:\Med Prep\clinoma-android-wrapper\build\app\outputs\flutter-apk\app-release.apk`
- You can distribute this `.apk` directly to users or install it on any Android device.
