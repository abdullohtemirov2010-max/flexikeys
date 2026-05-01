# Building FlexiKeys as an Android APK

The web app is wrapped with **Capacitor**. To produce an installable `.apk`, run these
commands locally on your machine (the Lovable cloud sandbox cannot run Android Studio /
Gradle, so the actual compile must happen on your computer).

## Prerequisites (one-time)

1. Install **Android Studio** → https://developer.android.com/studio
2. During the Android Studio setup wizard, install:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
3. Install **Java 17 JDK** (Android Studio bundles one — set `JAVA_HOME` to it).
4. Install **Node.js 20+** and **bun** (or npm).

## First-time project setup

After cloning the repo locally:

```bash
# 1. Install JS dependencies
bun install

# 2. Build the web app (outputs to dist/)
bun run build

# 3. Add the Android platform (creates the android/ folder)
bunx cap add android

# 4. Copy the built web assets into the native project
bunx cap sync android
```

> Note: The `android/` folder is **not** committed to this repo. The first
> `cap add android` call generates it locally. Re-run `cap sync android` after
> every web rebuild.

## Build a debug APK (for testing on your own device)

```bash
bun run build && bunx cap sync android
cd android
./gradlew assembleDebug
```

The APK appears at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy that file to your Android phone and install it (you'll need to enable
"Install unknown apps" for your file manager).

## Build a release APK (for distribution)

1. Generate a keystore (one-time):
   ```bash
   keytool -genkey -v -keystore flexikeys.keystore \
     -alias flexikeys -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add signing config to `android/app/build.gradle` inside the `android { ... }` block:
   ```gradle
   signingConfigs {
       release {
           storeFile file("/absolute/path/to/flexikeys.keystore")
           storePassword "YOUR_STORE_PASSWORD"
           keyAlias "flexikeys"
           keyPassword "YOUR_KEY_PASSWORD"
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
       }
   }
   ```

3. Build:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   Signed APK lands at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Open the project in Android Studio (recommended)

```bash
bunx cap open android
```

From there: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

## Updating after web changes

Every time you change the web app:
```bash
bun run build && bunx cap sync android
```
Then rebuild from Android Studio or `./gradlew assembleDebug`.

## App identity

- **App ID:** `app.lovable.flexikeys`
- **App name:** FlexiKeys
- Both configured in `capacitor.config.ts`. Change there before the first
  `cap add android`, or edit `android/app/build.gradle` afterwards.
