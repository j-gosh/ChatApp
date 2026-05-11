import 'dart:io';

/// Provides basic device identity strings derived from [Platform].
class DeviceInfo {
  /// A human-readable label combining OS name and hostname.
  static String get label {
    return Platform.operatingSystem + Platform.localHostname;
  }

  /// The OS name, usable as a user-agent string.
  static String get userAgent {
    return Platform.operatingSystem;
  }
}
