import 'dart:async';
import 'package:vibration/vibration.dart';

class VibrationService {
  Timer? _vibrationTimer;
  bool _isVibrating = false;

  /// Starts repeating 500ms on / 500ms off vibration pattern
  Future<void> startEmergencyVibration() async {
    if (_isVibrating) return;
    _isVibrating = true;

    final hasVibrator = await Vibration.hasVibrator() ?? false;
    if (!hasVibrator) return;

    final hasCustomVibrations = await Vibration.hasCustomVibrationsSupport() ?? false;

    if (hasCustomVibrations) {
      // Repeat pattern: 500ms wait, 500ms vibrate
      Vibration.vibrate(
        pattern: [500, 500, 500, 500],
        repeat: 0, // 0-indexed repeat loop
        intensities: [0, 255, 0, 255],
      );
    } else {
      // Fallback pulse timer
      _vibrationTimer = Timer.periodic(const Duration(milliseconds: 1000), (timer) {
        Vibration.vibrate(duration: 500);
      });
    }
  }

  /// Cancels vibration instantly when awake button is pressed
  void stopVibration() {
    _isVibrating = false;
    _vibrationTimer?.cancel();
    _vibrationTimer = null;
    Vibration.cancel();
  }
}
