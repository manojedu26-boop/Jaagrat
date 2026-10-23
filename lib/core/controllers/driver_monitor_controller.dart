import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:camera/camera.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../services/audio_alert_manager.dart';
import '../services/telemetry_service.dart';
import '../models/fatigue_event.dart';

/// Centralized Hardware, Sensor, and Computer Vision Controller for Jaagrat.
/// Strictly on-device processing at 15 FPS / 480p VGA.
/// Zero cloud-video transmission.
class DriverMonitorController extends ChangeNotifier {
  final AudioAlertManager alertManager;
  final String vehicleId;
  final String fleetId;
  final String languageCode;

  // Camera Subsystem
  CameraController? _cameraController;
  CameraDescription? _frontCamera;
  bool _isCameraInitialized = false;
  bool _isProcessingFrame = false;
  DateTime _lastFrameTimestamp = DateTime.now();
  static const int _targetFrameDeltaMs = 66; // 15 FPS throttle target

  // Sensor Subsystem
  StreamSubscription<Position>? _positionSubscription;
  StreamSubscription<UserAccelerometerEvent>? _accelerometerSubscription;
  double _currentSpeed = 0.0; // km/h
  bool _isArmed = false;
  DateTime? _potholeCooldownUntil;
  static const double _kPotholeShockThreshold = 18.0; // ~1.8G bump

  // Face Mesh Computer Vision Subsystem
  FaceMeshDetector? _meshDetector;
  bool _isFaceDetected = false;
  double _currentEar = 0.30;
  double _calibratedBaselineEar = 0.30;
  double _earClosedThreshold = 0.20;
  double _currentMar = 0.15;
  double _currentPitch = 0.0; // degrees
  bool _isCalibrated = false;

  // Temporal Fatigue Trackers
  int _consecutiveClosedFrames = 0;
  int _consecutiveHeadDropFrames = 0;
  DateTime? _yawnStartTime;
  int _consecutiveOpenEyeFramesAfterAlarm = 0;

  // 60-Second Rolling Buffer for PERCLOS (60s @ 15 FPS = 900 samples)
  final List<bool> _rollingClosedBuffer = <bool>[];
  static const int _kBufferSize = 900;
  double _perclosScore = 0.0;

  // Multi-Stage Alert States & Escalation
  AlertLevel _alertLevel = AlertLevel.none;
  final List<DateTime> _yawnHistory = <DateTime>[];
  final List<DateTime> _level2AlarmHistory = <DateTime>[];
  DateTime _lastLevel1Triggered = DateTime.fromMillisecondsSinceEpoch(0);
  String? _debugStatus = 'STANDBY_PAUSED (<10 km/h)';

  // Public Getters
  bool get isCameraInitialized => _isCameraInitialized;
  CameraController? get cameraController => _cameraController;
  bool get isCalibrated => _isCalibrated;
  double get currentSpeed => _currentSpeed;
  bool get isArmed => _isArmed;
  AlertLevel get alertLevel => _alertLevel;
  String? get debugStatus => _debugStatus;
  double get currentEar => _currentEar;
  double get currentMar => _currentMar;
  double get currentPitch => _currentPitch;
  double get perclosScore => _perclosScore;
  int get consecutiveClosedFrames => _consecutiveClosedFrames;
  bool get isFaceDetected => _isFaceDetected;

  DriverMonitorController({
    required this.alertManager,
    this.vehicleId = 'KA-01-AB-1234',
    this.fleetId = 'DEFAULT_FLEET',
    this.languageCode = 'hi',
  }) {
    _initDetector();
    _initSensors();
  }

  void _initDetector() {
    _meshDetector = FaceMeshDetector(
      option: FaceMeshDetectorOptions.faceMesh,
    );
  }

  // ---------------------------------------------------------------------------
  // 1. SENSOR GUARDS & FILTERS
  // ---------------------------------------------------------------------------

  void _initSensors() {
    // A. GPS Speed Guard
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((Position position) {
      _currentSpeed = position.speed * 3.6; // Convert m/s to km/h
      _isArmed = _currentSpeed >= 10.0;

      if (!_isArmed && _alertLevel != AlertLevel.emergency) {
        _debugStatus = 'STANDBY_PAUSED (<10 km/h)';
      } else if (_isArmed && _alertLevel == AlertLevel.none) {
        _debugStatus = 'ARMED & MONITORING';
      }
      notifyListeners();
    }, onError: (err) {
      debugPrint('[DriverMonitorController] GPS stream notice: $err');
    });

    // B. Pothole / Shock Filter (Linear Accelerometer)
    _accelerometerSubscription = userAccelerometerEventStream().listen((UserAccelerometerEvent event) {
      final double dynamicShock = math.sqrt(
        event.x * event.x + event.y * event.y + event.z * event.z,
      );

      // If bump > 18.0 m/s^2 (~1.8G), suppress face data for 650ms
      if (dynamicShock > _kPotholeShockThreshold) {
        _potholeCooldownUntil = DateTime.now().add(const Duration(milliseconds: 650));
        _debugStatus = 'ROAD BUMP (SUPPRESSED 650ms)';
        notifyListeners();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. CAMERA INITIALIZATION & 15 FPS STREAM
  // ---------------------------------------------------------------------------

  Future<void> initializeCamera() async {
    try {
      final cameras = await availableCameras();
      _frontCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _cameraController = CameraController(
        _frontCamera!,
        ResolutionPreset.low, // 480p VGA for thermal efficiency
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.nv21,
      );

      await _cameraController!.initialize();
      _isCameraInitialized = true;
      notifyListeners();

      // Start 15 FPS Image Stream
      await _cameraController!.startImageStream((CameraImage image) {
        _processFrame(image);
      });
    } catch (e) {
      debugPrint('[DriverMonitorController] Camera init error: $e');
      _isCameraInitialized = false;
      _debugStatus = 'Camera Error: $e';
      notifyListeners();
    }
  }

  Future<void> stopCamera() async {
    if (_cameraController != null && _cameraController!.value.isStreamingImages) {
      await _cameraController!.stopImageStream();
    }
    await _cameraController?.dispose();
    _cameraController = null;
    _isCameraInitialized = false;
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // 3. COMPUTER VISION INFERENCE PIPELINE
  // ---------------------------------------------------------------------------

  void _processFrame(CameraImage image) async {
    // Throttle to 15 FPS: drop frame if delta < 66ms
    final now = DateTime.now();
    if (now.difference(_lastFrameTimestamp).inMilliseconds < _targetFrameDeltaMs) {
      return;
    }
    _lastFrameTimestamp = now;

    // Guard: Prevent overlapping inference
    if (_isProcessingFrame || _meshDetector == null) return;

    // Guard: Pothole bump suppression (650ms)
    if (_potholeCooldownUntil != null && now.isBefore(_potholeCooldownUntil!)) {
      return;
    }

    _isProcessingFrame = true;

    try {
      final inputImage = _convertCameraImageToInputImage(image, _frontCamera!);
      if (inputImage == null) {
        _isProcessingFrame = false;
        return;
      }

      final List<FaceMesh> meshes = await _meshDetector!.processImage(inputImage);

      if (meshes.isEmpty) {
        _isFaceDetected = false;
        _isProcessingFrame = false;
        notifyListeners();
        return;
      }

      _isFaceDetected = true;
      final FaceMesh mesh = meshes.first;
      final List<FaceMeshPoint> points = mesh.points;

      // Ensure 468 landmark mesh points exist
      if (points.length < 468) {
        _isProcessingFrame = false;
        return;
      }

      // 1. Calculate Eye Aspect Ratio (EAR)
      final double leftEar = _computeEar(points, 33, 159, 145, 133);
      final double rightEar = _computeEar(points, 362, 386, 374, 263);
      _currentEar = (leftEar + rightEar) / 2.0;

      // 2. Calculate Mouth Aspect Ratio (MAR)
      _currentMar = _computeMar(points, 13, 14, 78, 308);

      // 3. Calculate Head Pose Pitch Angle
      _currentPitch = _computePitchAngle(points, 1, 10, 152);

      // Evaluate Fatigue Rules
      _evaluateFatigueLogic(now);
    } catch (e) {
      debugPrint('[DriverMonitorController] Inference error: $e');
    } finally {
      _isProcessingFrame = false;
      notifyListeners();
    }
  }

  // ---------------------------------------------------------------------------
  // 4. METRIC COMPUTATIONS (EAR, MAR, PITCH)
  // ---------------------------------------------------------------------------

  /// EAR = (||p_top - p_bottom||) / (||p_left - p_right||)
  double _computeEar(List<FaceMeshPoint> pts, int leftIdx, int topIdx, int bottomIdx, int rightIdx) {
    final pLeft = pts[leftIdx];
    final pRight = pts[rightIdx];
    final pTop = pts[topIdx];
    final pBottom = pts[bottomIdx];

    final vertical = math.hypot(pTop.x - pBottom.x, pTop.y - pBottom.y);
    final horizontal = math.hypot(pLeft.x - pRight.x, pLeft.y - pRight.y);

    if (horizontal == 0) return 0.30;
    return vertical / horizontal;
  }

  /// MAR = (||p_top - p_bottom||) / (||p_left - p_right||)
  double _computeMar(List<FaceMeshPoint> pts, int topIdx, int bottomIdx, int leftIdx, int rightIdx) {
    final pTop = pts[topIdx];
    final pBottom = pts[bottomIdx];
    final pLeft = pts[leftIdx];
    final pRight = pts[rightIdx];

    final vertical = math.hypot(pTop.x - pBottom.x, pTop.y - pBottom.y);
    final horizontal = math.hypot(pLeft.x - pRight.x, pLeft.y - pRight.y);

    if (horizontal == 0) return 0.15;
    return vertical / horizontal;
  }

  /// Pitch Angle: Evaluates vertical nose-to-forehead vs chin tilt
  double _computePitchAngle(List<FaceMeshPoint> pts, int noseIdx, int foreheadIdx, int chinIdx) {
    final nose = pts[noseIdx];
    final forehead = pts[foreheadIdx];
    final chin = pts[chinIdx];

    final double faceHeight = math.hypot(forehead.x - chin.x, forehead.y - chin.y);
    if (faceHeight == 0) return 0.0;

    // Normal baseline nose ratio is ~0.50. Forward tilt pulls nose down towards chin
    final double noseToForehead = math.hypot(forehead.x - nose.x, forehead.y - nose.y);
    final double ratio = noseToForehead / faceHeight;

    // Deviation in degrees (pitch downwards past 20 degrees is positive tilt)
    return (ratio - 0.52) * 120.0;
  }

  // ---------------------------------------------------------------------------
  // 5. FATIGUE EVALUATION & ESCALATION RULES
  // ---------------------------------------------------------------------------

  void _evaluateFatigueLogic(DateTime now) {
    // Auto-calibration baseline: use first 30 frames
    if (!_isCalibrated) {
      _calibratedBaselineEar = (_calibratedBaselineEar * 0.9) + (_currentEar * 0.1);
      _earClosedThreshold = math.min(0.20, _calibratedBaselineEar * 0.70);
      if (_rollingClosedBuffer.length > 30) {
        _isCalibrated = true;
      }
    }

    final bool isClosed = _currentEar < _earClosedThreshold;

    // Maintain 60-Second Rolling PERCLOS Buffer
    if (_rollingClosedBuffer.length >= _kBufferSize) {
      _rollingClosedBuffer.removeAt(0);
    }
    _rollingClosedBuffer.add(isClosed);

    final int closedCount = _rollingClosedBuffer.where((c) => c).length;
    _perclosScore = _rollingClosedBuffer.isNotEmpty ? (closedCount / _rollingClosedBuffer.length) : 0.0;

    // Eye Closure Frame Counter
    if (isClosed) {
      _consecutiveClosedFrames++;
      _consecutiveOpenEyeFramesAfterAlarm = 0;
    } else {
      _consecutiveClosedFrames = 0;
      if (_alertLevel == AlertLevel.emergency) {
        _consecutiveOpenEyeFramesAfterAlarm++;
        // Auto-dismiss emergency if eyes remain open for > 2.0 seconds (30 frames)
        if (_consecutiveOpenEyeFramesAfterAlarm >= 30) {
          dismissAlert();
        }
      }
    }

    // Head Nod Frame Counter (> 20 degrees forward nod)
    if (_currentPitch > 20.0) {
      _consecutiveHeadDropFrames++;
    } else {
      _consecutiveHeadDropFrames = 0;
    }

    // Deep Yawn Tracking (MAR > 0.65 sustained for >= 2.0s = 30 frames)
    if (_currentMar > 0.65) {
      _yawnStartTime ??= now;
      if (now.difference(_yawnStartTime!).inMilliseconds >= 2000) {
        _yawnHistory.add(now);
        _yawnStartTime = null; // Reset
      }
    } else {
      _yawnStartTime = null;
    }

    // Clean old yawns outside 90 seconds
    _yawnHistory.removeWhere((t) => now.difference(t).inSeconds > 90);

    // =========================================================================
    // ARMING GUARD: All alarms suppressed if stopped or speed < 10 km/h
    // =========================================================================
    if (!_isArmed) {
      return;
    }

    // =========================================================================
    // LEVEL 2: EMERGENCY ALERT (Microsleep: >= 1.2s closure OR Head Drop > 1.2s)
    // =========================================================================
    if (_consecutiveClosedFrames >= 18 || _consecutiveHeadDropFrames >= 18) {
      _triggerLevel2Emergency(
        _consecutiveClosedFrames >= 18
            ? 'Microsleep: Eyes closed >= 1.2s'
            : 'Head Drop: Pitch > 20 deg for 1.2s',
      );
      return;
    }

    // =========================================================================
    // LEVEL 1: SOFT WARNING (PERCLOS > 18% OR 2 Deep Yawns in 90s)
    // =========================================================================
    final bool isPerclosHigh = _perclosScore > 0.18 && _rollingClosedBuffer.length > 200;
    final bool isYawnCluster = _yawnHistory.length >= 2;

    if ((isPerclosHigh || isYawnCluster) &&
        _alertLevel == AlertLevel.none &&
        now.difference(_lastLevel1Triggered).inSeconds > 30) {
      _triggerLevel1Warning(
        isPerclosHigh
            ? 'Drowsiness trend: PERCLOS ${(_perclosScore * 100).toInt()}%'
            : 'Yawn cluster detected (2 yawns in 90s)',
      );
    }
  }

  void _triggerLevel1Warning(String reason) {
    _alertLevel = AlertLevel.warning;
    _lastLevel1Triggered = DateTime.now();
    _debugStatus = 'LEVEL 1: $reason';
    alertManager.triggerLevel1Warning(languageCode: languageCode);
    notifyListeners();

    // Auto-clear Level 1 warning state after 6 seconds
    Future.delayed(const Duration(seconds: 6), () {
      if (_alertLevel == AlertLevel.warning) {
        _alertLevel = AlertLevel.none;
        _debugStatus = 'ARMED & MONITORING';
        notifyListeners();
      }
    });
  }

  void _triggerLevel2Emergency(String reason) {
    _alertLevel = AlertLevel.emergency;
    _debugStatus = 'LEVEL 2 EMERGENCY: $reason';
    alertManager.triggerLevel2Emergency();

    final now = DateTime.now();
    _level2AlarmHistory.add(now);

    // Clean old alarms outside 15 minutes
    _level2AlarmHistory.removeWhere((t) => now.difference(t).inMinutes > 15);

    // Level 3 Escalation: 3 severe alarms in 15 minutes
    if (_level2AlarmHistory.length >= 3) {
      _dispatchLevel3Telemetry('Repeated Microsleeps (3x in 15 mins)');
    }

    notifyListeners();
  }

  /// Driver taps "I AM AWAKE" button
  void dismissAlert() {
    _alertLevel = AlertLevel.none;
    _consecutiveClosedFrames = 0;
    _consecutiveHeadDropFrames = 0;
    _consecutiveOpenEyeFramesAfterAlarm = 0;
    _debugStatus = _isArmed ? 'ARMED & MONITORING' : 'STANDBY_PAUSED (<10 km/h)';
    alertManager.stopAllAlerts();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // 6. LEVEL 3 CLOUD TELEMETRY (< 1 KB Payload)
  // ---------------------------------------------------------------------------

  void _dispatchLevel3Telemetry(String triggerReason) async {
    try {
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium,
          timeLimit: const Duration(seconds: 3),
        );
      } catch (_) {}

      final telemetry = TelemetryService();
      await telemetry.logFatigueEvent(FatigueEvent(
        driverId: 'DRIVER_ACTIVE',
        vehicleId: vehicleId,
        fleetId: fleetId,
        timestamp: DateTime.now(),
        alertType: FatigueAlertType.level2Microsleep,
        speedKmh: _currentSpeed,
        latitude: position?.latitude ?? 0.0,
        longitude: position?.longitude ?? 0.0,
        earScore: _currentEar,
      ));
      debugPrint('[DriverMonitorController] Level 3 telemetry queued/synced via TelemetryService.');
    } catch (e) {
      debugPrint('[DriverMonitorController] Level 3 telemetry dispatch notice: $e');
    }
  }

  // ---------------------------------------------------------------------------
  // 7. INPUT IMAGE CONVERSION HELPER
  // ---------------------------------------------------------------------------

  InputImage? _convertCameraImageToInputImage(CameraImage image, CameraDescription camera) {
    final format = InputImageFormatValue.fromRawValue(image.format.raw);
    if (format == null) return null;

    final plane = image.planes.first;

    return InputImage.fromBytes(
      bytes: plane.bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: InputImageRotationValue.fromRawValue(camera.sensorOrientation) ??
            InputImageRotation.rotation0deg,
        format: format,
        bytesPerRow: plane.bytesPerRow,
      ),
    );
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _accelerometerSubscription?.cancel();
    _meshDetector?.close();
    stopCamera();
    alertManager.dispose();
    super.dispose();
  }
}
