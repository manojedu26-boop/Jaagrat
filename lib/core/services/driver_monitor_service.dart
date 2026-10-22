import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import '../constants/app_constants.dart';
import '../constants/app_strings.dart';
import '../models/driver_profile.dart';
import '../models/fatigue_event.dart';
import 'audio_alert_service.dart';
import 'vibration_service.dart';
import 'sensor_guard_service.dart';
import 'telemetry_service.dart';

enum AlertLevel {
  none,
  level1Warning,
  level2Microsleep,
}

/// Core Driver Monitoring Service:
/// Processes 480p @ 15 FPS camera stream on-device.
/// Executes Eye Aspect Ratio (EAR) + Head Pitch + PERCLOS calculation.
/// Gate-checks against GPS Speed (>10 km/h) and Pothole Shock (>1.8G).
class DriverMonitorService extends ChangeNotifier {
  final SensorGuardService sensorGuard;
  final AudioAlertService audioAlert;
  final VibrationService vibration;
  final TelemetryService telemetry;

  DriverProfile? _profile;
  SupportedLanguage _language = SupportedLanguage.hindi;

  // MLKit Face Mesh Landmarker
  FaceMeshDetector? _meshDetector;
  bool _isProcessingFrame = false;
  DateTime _lastFrameTime = DateTime.now();

  // Dynamic Eye Aspect Ratio & Thresholds
  double _currentEar = 0.30;
  double _calibratedThreshold = AppConstants.defaultEarThreshold;
  double _headPitch = 0.0;
  bool _isFaceDetected = false;

  // Microsleep State Tracker (18 consecutive frames @ 15fps = 1.2s)
  int _consecutiveClosedFrames = 0;
  bool _isMicrosleepActive = false;

  // 60-Second Rolling Window Buffer for PERCLOS
  final List<int> _perclosRollingBuffer = <int>[]; // 1 = closed, 0 = open
  double _currentPerclosScore = 0.0;
  DateTime _lastLevel1Triggered = DateTime.fromMillisecondsSinceEpoch(0);

  // Active Alert Level
  AlertLevel _currentAlertLevel = AlertLevel.none;

  // Getters
  double get currentEar => _currentEar;
  double get calibratedThreshold => _calibratedThreshold;
  double get headPitch => _headPitch;
  bool get isFaceDetected => _isFaceDetected;
  int get consecutiveClosedFrames => _consecutiveClosedFrames;
  double get currentPerclosScore => _currentPerclosScore;
  AlertLevel get currentAlertLevel => _currentAlertLevel;
  bool get isAlertActive => _currentAlertLevel != AlertLevel.none;

  DriverMonitorService({
    required this.sensorGuard,
    required this.audioAlert,
    required this.vibration,
    required this.telemetry,
  }) {
    _initDetector();
  }

  void updateProfile(DriverProfile profile) {
    _profile = profile;
    _language = SupportedLanguage.fromCode(profile.languageCode);
  }

  void setCalibratedEarThreshold(double threshold) {
    _calibratedThreshold = threshold;
    notifyListeners();
  }

  void _initDetector() {
    _meshDetector = FaceMeshDetector(
      option: FaceMeshDetectorOptions.faceMesh,
    );
  }

  /// Processes camera frame stream at 15 FPS without blocking the UI thread
  Future<void> processCameraImage(CameraImage image, CameraDescription camera) async {
    // 1. Throttle to target FPS (~66ms per frame = 15 FPS)
    final now = DateTime.now();
    if (now.difference(_lastFrameTime).inMilliseconds < (1000 / AppConstants.targetCameraFps)) {
      return;
    }
    _lastFrameTime = now;

    // 2. Prevent overlapping asynchronous frames
    if (_isProcessingFrame) return;

    // 3. Accelerometer Shock Guard:
    // If vertical acceleration exceeded 1.8G within 600ms, ignore detection
    if (sensorGuard.isShockActive) {
      return;
    }

    _isProcessingFrame = true;

    try {
      final inputImage = _convertCameraImageToInputImage(image, camera);
      if (inputImage == null) {
        _isProcessingFrame = false;
        return;
      }

      final List<FaceMesh> meshes = await _meshDetector!.processImage(inputImage);

      if (meshes.isEmpty) {
        _isFaceDetected = false;
        notifyListeners();
        _isProcessingFrame = false;
        return;
      }

      _isFaceDetected = true;
      final FaceMesh mesh = meshes.first;

      // Extract Eye Aspect Ratio (EAR) from FaceMesh 3D points
      final ear = _calculateFaceMeshEar(mesh);
      _currentEar = ear;

      // Evaluate whether eyes are closed relative to calibrated baseline
      final bool isEyeClosed = ear < _calibratedThreshold;

      // Update 60-Second Rolling Window for PERCLOS
      _updatePerclosBuffer(isEyeClosed ? 1 : 0);

      // Evaluate Microsleep & PERCLOS Escalation
      _evaluateFatigueState(isEyeClosed);

      notifyListeners();
    } catch (e) {
      print('[DriverMonitorService] Frame error: $e');
    } finally {
      _isProcessingFrame = false;
    }
  }

  /// Calculates real Eye Aspect Ratio (EAR) from Face Mesh landmarks
  /// Left Eye indices: 33 (lateral), 133 (medial), 160 & 144, 158 & 153 (vertical)
  /// Right Eye indices: 362 (medial), 263 (lateral), 385 & 380, 387 & 373 (vertical)
  double _calculateFaceMeshEar(FaceMesh mesh) {
    try {
      final points = mesh.points;
      if (points.length < 468) return 0.28;

      // Left Eye EAR
      final double lDistV1 = _euclideanDist(points[160], points[144]);
      final double lDistV2 = _euclideanDist(points[158], points[153]);
      final double lDistH = _euclideanDist(points[33], points[133]);
      final double leftEar = (lDistV1 + lDistV2) / (2.0 * (lDistH == 0 ? 1 : lDistH));

      // Right Eye EAR
      final double rDistV1 = _euclideanDist(points[385], points[380]);
      final double rDistV2 = _euclideanDist(points[387], points[373]);
      final double rDistH = _euclideanDist(points[362], points[263]);
      final double rightEar = (rDistV1 + rDistV2) / (2.0 * (rDistH == 0 ? 1 : rDistH));

      final double avgEar = (leftEar + rightEar) / 2.0;
      return avgEar.clamp(0.05, 0.45);
    } catch (e) {
      return 0.28;
    }
  }

  double _euclideanDist(FaceMeshPoint p1, FaceMeshPoint p2) {
    final double dx = p1.x - p2.x;
    final double dy = p1.y - p2.y;
    final double dz = p1.z - p2.z;
    return math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /// Updates the 60-second rolling window (900 samples at 15 FPS)
  void _updatePerclosBuffer(int state) {
    _perclosRollingBuffer.add(state);
    if (_perclosRollingBuffer.length > AppConstants.perclosBufferSize) {
      _perclosRollingBuffer.removeAt(0);
    }

    if (_perclosRollingBuffer.isNotEmpty) {
      final int closedCount = _perclosRollingBuffer.where((s) => s == 1).length;
      _currentPerclosScore = closedCount / _perclosRollingBuffer.length;
    }
  }

  /// Evaluates detection states against Sensor Guards and triggers escalation pipeline
  void _evaluateFatigueState(bool isEyeClosed) {
    // 1. GPS Speed Guard:
    // Suppress alerts if vehicle speed is below 10 km/h (stops alerts when parked or at signals)
    if (!sensorGuard.isArmedForAlerts) {
      if (_consecutiveClosedFrames > 0) {
        _consecutiveClosedFrames = 0;
      }
      return;
    }

    // 2. Track consecutive eye-closure frames
    if (isEyeClosed) {
      _consecutiveClosedFrames++;
    } else {
      _consecutiveClosedFrames = 0;
    }

    // 3. Level 2 (Microsleep Trigger): Continuous eye closure > 1.2s (~18 frames)
    if (_consecutiveClosedFrames >= AppConstants.microsleepConsecutiveFrames) {
      _triggerLevel2Alert();
      return;
    }

    // 4. Level 1 (Fatigue Trend PERCLOS): Eyes closed > 80% over 60 seconds
    if (_perclosRollingBuffer.length >= 300 &&
        _currentPerclosScore >= AppConstants.perclosThreshold) {
      final now = DateTime.now();
      // Debounce Level 1 audio warnings to once every 20 seconds
      if (now.difference(_lastLevel1Triggered).inSeconds > 20) {
        _lastLevel1Triggered = now;
        _triggerLevel1Alert();
      }
    }
  }

  void _triggerLevel1Alert() {
    if (_currentAlertLevel == AlertLevel.level2Microsleep) return;
    _currentAlertLevel = AlertLevel.level1Warning;

    // Level 1: Soft chime + short regional voice asset
    audioAlert.playLevel1Warning(_language);

    // Cloud Telemetry (Level 1 Event)
    _sendTelemetry(FatigueAlertType.level1Perclos);
  }

  void _triggerLevel2Alert() {
    if (_isMicrosleepActive) return;
    _isMicrosleepActive = true;
    _currentAlertLevel = AlertLevel.level2Microsleep;

    // Level 2: Maximum audio stream override with loud siren + continuous vibration pattern [500ms on, 500ms off]
    audioAlert.startLevel2EmergencySiren();
    vibration.startEmergencyVibration();

    // Cloud Telemetry (Level 2 Microsleep Event)
    _sendTelemetry(FatigueAlertType.level2Microsleep);
  }

  void _sendTelemetry(FatigueAlertType alertType) {
    if (_profile == null) return;

    final event = FatigueEvent(
      driverId: _profile!.phoneNumber,
      vehicleId: _profile!.vehicleNumber,
      fleetId: _profile!.fleetCode,
      timestamp: DateTime.now(),
      alertType: alertType,
      speedKmh: sensorGuard.currentSpeedKmh,
      latitude: sensorGuard.currentLatitude,
      longitude: sensorGuard.currentLongitude,
      earScore: _currentEar,
    );

    telemetry.logFatigueEvent(event);
  }

  /// Driver taps "I AM AWAKE" button:
  /// Immediately dismisses siren, cancels vibration, and resumes monitoring
  void dismissAlert() {
    _isMicrosleepActive = false;
    _consecutiveClosedFrames = 0;
    _currentAlertLevel = AlertLevel.none;

    audioAlert.stopAllAlerts();
    vibration.stopVibration();

    // Clear recent frames from PERCLOS buffer to prevent immediate re-trigger
    if (_perclosRollingBuffer.length > 60) {
      _perclosRollingBuffer.removeRange(
        _perclosRollingBuffer.length - 60,
        _perclosRollingBuffer.length,
      );
    }

    notifyListeners();
  }

  InputImage? _convertCameraImageToInputImage(CameraImage image, CameraDescription camera) {
    try {
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      final Size imageSize = Size(image.width.toDouble(), image.height.toDouble());
      final cameraRotation = InputImageRotationValue.fromRawValue(camera.sensorOrientation) ??
          InputImageRotation.rotation0deg;
      final inputImageFormat = InputImageFormatValue.fromRawValue(image.format.raw as int) ??
          InputImageFormat.nv21;

      final planeData = image.planes.map(
        (Plane plane) {
          return InputImagePlaneMetadata(
            bytesPerRow: plane.bytesPerRow,
            height: plane.height,
            width: plane.width,
          );
        },
      ).toList();

      final inputImageData = InputImageData(
        size: imageSize,
        imageRotation: cameraRotation,
        inputImageFormat: inputImageFormat,
        planeData: planeData,
      );

      return InputImage.fromBytes(
        bytes: bytes,
        inputImageData: inputImageData,
      );
    } catch (e) {
      return null;
    }
  }

  @override
  void dispose() {
    _meshDetector?.close();
    super.dispose();
  }
}
