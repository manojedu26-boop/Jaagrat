/// Precise physical thresholds and temporal parameters
/// engineered specifically for Indian highway and commercial fleet conditions.
class AppConstants {
  // Detection Frame Rate & Resolution
  static const int targetCameraFps = 15;
  static const int cameraWidth = 640;
  static const int cameraHeight = 480;

  // Eye Aspect Ratio (EAR) Thresholds
  static const double defaultEarThreshold = 0.21;
  static const double earBlinkHysteresis = 0.03;

  // Microsleep Trigger (Level 2 Emergency)
  // Continuous eye closure > 1.2 seconds (~18 consecutive frames at 15 FPS)
  static const int microsleepDurationMs = 1200;
  static const int microsleepConsecutiveFrames = 18;

  // PERCLOS Fatigue Trend (Level 1 Alert)
  // Proportion of time eyes are closed > 80% over 60-second rolling window
  static const int perclosWindowSeconds = 60;
  static const int perclosBufferSize = 900; // 60s * 15 FPS
  static const double perclosThreshold = 0.80; // 80% threshold

  // GPS Speed Guard
  // Suppress alerts if vehicle speed is below 10 km/h (stops false alarms when parked or in traffic)
  static const double gpsSpeedArmingThresholdKmh = 10.0;

  // Accelerometer Shock Guard (Indian Pothole / Speed Bump Filter)
  // If instantaneous vertical acceleration exceeds 1.8G, ignore frames for 600ms
  static const double shockThresholdG = 1.8;
  static const int shockSuppressionDurationMs = 600;

  // Touch Target Sizing (Strict Minimum 60px for Commercial Drivers)
  static const double minTouchTargetHeight = 64.0;
  static const double buttonCornerRadius = 24.0;
  static const double cardCornerRadius = 20.0;

  // Firebase Firestore Collection
  static const String firestoreCollectionFatigueEvents = 'fatigue_events';
}
