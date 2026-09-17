# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# expo-task-manager boots the app's JS in a headless process to handle notification
# actions while the app is killed; both names below are resolved via Class.forName at
# runtime, so R8 must not rename or remove them.
-keep class expo.modules.taskManager.** { *; }
-keep class expo.modules.ExpoModulesPackageList { *; }
-keep class expo.modules.adapters.react.apploader.** { *; }

# @generated begin expo-build-properties - expo prebuild (DO NOT MODIFY)
-keep class expo.modules.notifications.** { *; }
-keep class * extends android.content.BroadcastReceiver { *; }
-keep class * extends android.app.Service { *; }
# @generated end expo-build-properties