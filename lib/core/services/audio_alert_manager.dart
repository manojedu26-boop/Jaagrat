import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:vibration/vibration.dart';

enum AlertLevel {
  none,
  warning,    // Level 1
  emergency,  // Level 2
}

/// Dedicated Hardware Alert Manager
/// Handles low-latency audio sirens, volume overrides, loop controls,
/// and aggressive tactile vibration patterns for commercial drivers.
class AudioAlertManager {
  final AudioPlayer _sirenPlayer = AudioPlayer();
  final AudioPlayer _warningPlayer = AudioPlayer();

  bool _isEmergencyActive = false;
  Timer? _vibrationPulseTimer;

  bool get isEmergencyActive => _isEmergencyActive;

  AudioAlertManager() {
    _initAudio();
  }

  void _initAudio() async {
    try {
      await _sirenPlayer.setAudioContext(AudioContext(
        android: const AudioContextAndroid(
          isSpeakerphoneOn: true,
          stayAwake: true,
          contentType: AndroidContentType.sonification,
          usageType: AndroidUsageType.alarm,
          audioFocus: AndroidAudioFocus.gainTransientExclusive,
        ),
      ));
    } catch (e) {
      debugPrint('[AudioAlertManager] Context init notice: $e');
    }
  }

  /// Level 1: Soft Warning Prompt & Brief Haptic Tap (100ms)
  Future<void> triggerLevel1Warning({String languageCode = 'hi'}) async {
    if (_isEmergencyActive) return; // Emergency takes precedence

    try {
      // 1. Brief tactile feedback tap (100ms)
      final hasVibrator = await Vibration.hasVibrator() ?? false;
      if (hasVibrator) {
        Vibration.vibrate(duration: 100);
      }

      // 2. Play local audio prompt
      await _warningPlayer.stop();
      await _warningPlayer.setVolume(0.85);
      await _warningPlayer.play(
        AssetSource('audio/${languageCode}_focus_road.mp3'),
      );
    } catch (e) {
      debugPrint('[AudioAlertManager] Level 1 trigger error: $e');
    }
  }

  /// Level 2: Emergency Alert (Microsleep / Head Drop)
  /// Overrides volume to 100%, loops industrial siren, and engages repeating vibration
  Future<void> triggerLevel2Emergency() async {
    if (_isEmergencyActive) return;
    _isEmergencyActive = true;

    try {
      // 1. Force maximum 100% volume
      await _sirenPlayer.setVolume(1.0);
      await _sirenPlayer.setReleaseMode(ReleaseMode.loop);
      await _sirenPlayer.play(AssetSource('audio/loud_buzzer.mp3'));

      // 2. Engage aggressive repeating vibration pattern [0, 500, 200, 500, 200, 500] ms
      _startAggressiveVibration();
    } catch (e) {
      debugPrint('[AudioAlertManager] Level 2 Emergency trigger error: $e');
    }
  }

  void _startAggressiveVibration() async {
    final hasVibrator = await Vibration.hasVibrator() ?? false;
    if (!hasVibrator) return;

    final hasCustomSupport = await Vibration.hasCustomVibrationsSupport() ?? false;

    if (hasCustomSupport) {
      Vibration.vibrate(
        pattern: const [0, 500, 200, 500, 200, 500],
        repeat: 0, // Loop continuously
        intensities: const [0, 255, 0, 255, 0, 255],
      );
    } else {
      _vibrationPulseTimer?.cancel();
      _vibrationPulseTimer = Timer.periodic(const Duration(milliseconds: 1400), (_) {
        if (_isEmergencyActive) {
          Vibration.vibrate(pattern: const [0, 500, 200, 500]);
        }
      });
    }
  }

  /// Immediate silence on driver "I AM AWAKE" button tap or auto-recovery
  Future<void> stopAllAlerts() async {
    _isEmergencyActive = false;

    _vibrationPulseTimer?.cancel();
    _vibrationPulseTimer = null;
    Vibration.cancel();

    try {
      await _sirenPlayer.stop();
      await _warningPlayer.stop();
    } catch (e) {
      debugPrint('[AudioAlertManager] Stop alerts error: $e');
    }
  }

  void dispose() {
    _vibrationPulseTimer?.cancel();
    _sirenPlayer.dispose();
    _warningPlayer.dispose();
    Vibration.cancel();
  }
}
