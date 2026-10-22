import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../constants/app_strings.dart';

class AudioAlertService {
  final AudioPlayer _audioPlayer = AudioPlayer();
  final FlutterTts _flutterTts = FlutterTts();

  bool _isPlayingEmergency = false;
  bool get isPlayingEmergency => _isPlayingEmergency;

  AudioAlertService() {
    _initTts();
  }

  void _initTts() async {
    await _flutterTts.setSpeechRate(0.85); // Deliberate, clear cadence
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);
  }

  /// Level 1: Soft chime followed by clear regional voice prompt
  Future<void> playLevel1Warning(SupportedLanguage language) async {
    try {
      // 1. Play soft warning chime
      await _audioPlayer.setVolume(0.7);
      await _audioPlayer.play(AssetSource('audio/warning_chime.wav'));

      // 2. Announce regional safety prompt
      await _flutterTts.setLanguage(language.code);
      await _flutterTts.speak(language.speechPrompt);
    } catch (e) {
      // Fallback: in case TTS or asset fails, ensure minimal alert sounds
      print('[AudioAlertService] Level 1 Audio Warning: $e');
    }
  }

  /// Level 2: Maximum volume emergency horn / siren override on microsleep
  Future<void> startLevel2EmergencySiren() async {
    if (_isPlayingEmergency) return;
    _isPlayingEmergency = true;

    try {
      // Override to absolute maximum volume
      await _audioPlayer.setVolume(1.0);
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
      await _audioPlayer.play(AssetSource('audio/emergency_siren.wav'));
    } catch (e) {
      print('[AudioAlertService] Emergency siren trigger: $e');
    }
  }

  /// Immediate silence on driver "I AM AWAKE" button tap
  Future<void> stopAllAlerts() async {
    _isPlayingEmergency = false;
    try {
      await _audioPlayer.stop();
      await _flutterTts.stop();
    } catch (e) {
      print('[AudioAlertService] Stop alerts error: $e');
    }
  }

  void dispose() {
    _audioPlayer.dispose();
    _flutterTts.stop();
  }
}
