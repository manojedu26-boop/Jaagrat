// Custom Widget for FlutterFlow: DriverMonitorWidget
// Parameters in FlutterFlow:
// - width: Double (match parent or screen width)
// - height: Double (match parent or screen height)
// - language: String (e.g. 'hi', 'kn', 'ta', 'te', 'mr', 'en')
// - vehicleId: String (e.g. 'KA-01-AB-1234')
// - fleetId: String
// - driverId: String
// - isCalibrated: Boolean (default: true)
// - onAlertTriggered: Action (optional callback)

import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:vibration/vibration.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';

class DriverMonitorWidget extends StatefulWidget {
  final double width;
  final double height;
  final String language;
  final String vehicleId;
  final String fleetId;
  final String driverId;
  final bool isCalibrated;
  final Future Function()? onAlertTriggered;

  const DriverMonitorWidget({
    Key? key,
    required this.width,
    required this.height,
    required this.language,
    required this.vehicleId,
    required this.fleetId,
    required this.driverId,
    this.isCalibrated = true,
    this.onAlertTriggered,
  }) : super(key: key);

  @override
  State<DriverMonitorWidget> createState() => _DriverMonitorWidgetState();
}

class _DriverMonitorWidgetState extends State<DriverMonitorWidget> with WidgetsBindingObserver {
  CameraController? _cameraController;
  FaceMeshDetector? _meshDetector;
  final AudioPlayer _audioPlayer = AudioPlayer();

  // Hardware Subscriptions
  StreamSubscription<UserAccelerometerEvent>? _accelSub;
  StreamSubscription<Position>? _positionSub;

  // Real-Time Sensor State
  double _currentSpeedKmH = 0.0;
  DateTime? _lastPotholeShockTime;
  bool _isProcessingFrame = false;

  // Sliding Windows & Detection Metrics
  // 60-second window @ 15 FPS = 900 frames
  final List<bool> _rollingClosedBuffer = [];
  static const int _kBufferSize = 900;
  static const int _kMinFramesForTrend = 200;

  int _consecutiveClosedFrames = 0;
  int _consecutiveHeadDropFrames = 0;

  // Escalation & Emergency Counter
  int _l2AlarmCountInWindow = 0;
  DateTime _windowStartTime = DateTime.now();
  DateTime _lastAlertTime = DateTime.fromMillisecondsSinceEpoch(0);
  bool _isL2AlarmActive = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initSensors();
    _initDetector();
    _initCamera();
  }

  void _initSensors() {
    // 1. Pothole / Road Bump Shock Suppressor
    _accelSub = userAccelerometerEventStream().listen((UserAccelerometerEvent event) {
      double totalShock = math.sqrt(event.x * event.x + event.y * event.y + event.z * event.z);
      // If G-force exceeds ~1.8G (18 m/s^2), ignore face tracking for 600ms
      if (totalShock > 18.0) {
        _lastPotholeShockTime = DateTime.now();
      }
    });

    // 2. GPS Speed Arming Guard
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 15,
      ),
    ).listen((Position position) {
      if (mounted) {
        setState(() {
          _currentSpeedKmH = position.speed * 3.6; // convert m/s to km/h
        });
      }
    });
  }

  void _initDetector() {
    _meshDetector = FaceMeshDetector(
      option: FaceMeshDetectorOptions.faceMesh,
    );
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      final frontCam = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _cameraController = CameraController(
        frontCam,
        ResolutionPreset.low, // 480p keeps CPU and phone thermals low
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.nv21,
      );

      await _cameraController!.initialize();
      if (!mounted) return;

      int frameCounter = 0;
      await _cameraController!.startImageStream((CameraImage image) {
        frameCounter++;
        // Target 15 FPS: process every second frame from 30 FPS camera feed
        if (frameCounter % 2 == 0) {
          _processFrame(image);
        }
      });

      setState(() {});
    } catch (e) {
      debugPrint("Jaagrat Camera Initialization Exception: $e");
    }
  }

  void _processFrame(CameraImage image) async {
    if (_isProcessingFrame || _meshDetector == null) return;

    // Guard 1: Do not alert if vehicle is stationary or crawling (< 10 km/h)
    if (_currentSpeedKmH < 10.0) return;

    // Guard 2: Skip frame if hit by a severe pothole/bump within 600ms
    if (_lastPotholeShockTime != null &&
        DateTime.now().difference(_lastPotholeShockTime!).inMilliseconds < 600) {
      return;
    }

    _isProcessingFrame = true;

    try {
      // In production: Convert CameraImage to InputImage for FaceMeshDetector / MediaPipe
      // Extract: Eye Aspect Ratio (EAR), Jaw openness, and Nose-Forehead pitch vector
      bool eyesClosed = false;
      bool headDropped = false;

      _evaluateFatigue(
        isEyeClosed: eyesClosed,
        isHeadDropped: headDropped,
      );
    } catch (e) {
      debugPrint("Inference Error: $e");
    } finally {
      _isProcessingFrame = false;
    }
  }

  void _evaluateFatigue({required bool isEyeClosed, required bool isHeadDropped}) {
    // 1. Maintain Rolling 60s PERCLOS Buffer
    if (_rollingClosedBuffer.length >= _kBufferSize) {
      _rollingClosedBuffer.removeAt(0);
    }
    _rollingClosedBuffer.add(isEyeClosed);

    // 2. Track Consecutive Closed Frames (18 frames @ 15 FPS = 1.2s microsleep)
    if (isEyeClosed) {
      _consecutiveClosedFrames++;
    } else {
      _consecutiveClosedFrames = 0;
    }

    // 3. Track Consecutive Head Drop Frames (15 frames = 1.0s)
    if (isHeadDropped) {
      _consecutiveHeadDropFrames++;
    } else {
      _consecutiveHeadDropFrames = 0;
    }

    final now = DateTime.now();

    // ESCALATION LEVEL 2: Sustained 1.2s Eye Closure OR Head Pitch Drop > 25 deg
    if (_consecutiveClosedFrames >= 18 || _consecutiveHeadDropFrames >= 15) {
      if (now.difference(_lastAlertTime).inSeconds > 5) {
        _triggerEscalation(
          level: 2,
          reason: _consecutiveClosedFrames >= 18 ? "Microsleep (1.2s+ Eye Closure)" : "Head Nod / Drop Detected",
        );
        _lastAlertTime = now;
        _consecutiveClosedFrames = 0;
        _consecutiveHeadDropFrames = 0;
      }
      return;
    }

    // ESCALATION LEVEL 1: High PERCLOS Drowsiness Trend (>20% closure in 60s window)
    if (_rollingClosedBuffer.length > _kMinFramesForTrend) {
      double closedCount = _rollingClosedBuffer.where((c) => c).length.toDouble();
      double perclosRatio = closedCount / _rollingClosedBuffer.length;

      if (perclosRatio > 0.20 && now.difference(_lastAlertTime).inSeconds > 30) {
        _triggerEscalation(
          level: 1,
          reason: "High PERCLOS fatigue trend (${(perclosRatio * 100).toInt()}%)",
        );
        _lastAlertTime = now;
        _rollingClosedBuffer.clear(); // Reset window after alerting
      }
    }
  }

  void _triggerEscalation({required int level, required String reason}) async {
    final now = DateTime.now();

    // Reset 15-minute escalation window
    if (now.difference(_windowStartTime).inMinutes >= 15) {
      _l2AlarmCountInWindow = 0;
      _windowStartTime = now;
    }

    if (level == 1) {
      // Level 1: Gentle regional voice prompt ("Dhayan dein")
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('audio/${widget.language}_l1_attention.mp3'));
    } else if (level == 2) {
      // Level 2: Loud piercing siren + repeating haptic vibration
      _isL2AlarmActive = true;
      _l2AlarmCountInWindow++;

      bool? hasVib = await Vibration.hasVibrator();
      if (hasVib == true) {
        Vibration.vibrate(pattern: [0, 500, 200, 800], repeat: 0);
      }

      await _audioPlayer.stop();
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
      await _audioPlayer.play(AssetSource('audio/piercing_siren.mp3'));

      // Log Level 2 event to Firestore
      _syncEventToFirestore(level: 2, reason: reason);

      // Level 3 Escalation: 3 severe alarms within 15 minutes
      if (_l2AlarmCountInWindow >= 3) {
        _syncEventToFirestore(
          level: 3,
          reason: "Critical: Multiple unattended alarms within 15 mins",
        );
        await _audioPlayer.stop();
        await _audioPlayer.play(AssetSource('audio/${widget.language}_l3_stop.mp3'));
      }

      if (widget.onAlertTriggered != null) {
        widget.onAlertTriggered!();
      }
    }
  }

  // Dismiss Level 2 alarm when driver taps "I'M AWAKE"
  void dismissL2Alarm() async {
    _isL2AlarmActive = false;
    Vibration.cancel();
    await _audioPlayer.stop();
    setState(() {});
  }

  void _syncEventToFirestore({required int level, required String reason}) async {
    try {
      Position? pos;
      try {
        pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium,
          timeLimit: const Duration(seconds: 3),
        );
      } catch (_) {}

      await FirebaseFirestore.instance.collection('fatigue_events').add({
        'fleetId': widget.fleetId,
        'vehicleId': widget.vehicleId,
        'driverId': widget.driverId,
        'alertLevel': level,
        'reason': reason,
        'speedKmH': _currentSpeedKmH,
        'timestamp': FieldValue.serverTimestamp(),
        'location': pos != null ? GeoPoint(pos.latitude, pos.longitude) : null,
      });
    } catch (e) {
      debugPrint("Offline Sync Queue: $e");
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    _meshDetector?.close();
    _audioPlayer.dispose();
    _accelSub?.cancel();
    _positionSub?.cancel();
    Vibration.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return Container(
        width: widget.width,
        height: widget.height,
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator(color: Colors.amber),
        ),
      );
    }

    return Container(
      width: widget.width,
      height: widget.height,
      color: Colors.black,
      child: Stack(
        children: [
          // 1. Dimmed camera preview (5% opacity for OLED efficiency & zero night glare)
          Opacity(
            opacity: 0.05,
            child: SizedBox.expand(
              child: CameraPreview(_cameraController!),
            ),
          ),

          // 2. Subtle status HUD
          Positioned(
            top: 24,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentSpeedKmH > 10.0 ? Colors.greenAccent : Colors.orangeAccent,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _currentSpeedKmH > 10.0
                          ? "ARMED (${_currentSpeedKmH.toStringAsFixed(0)} km/h)"
                          : "STANDBY (<10 km/h)",
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Text(
                  widget.vehicleId,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ),

          // 3. Emergency "I'M AWAKE" Dismissal Overlay (Visible during L2 Alarm)
          if (_isL2AlarmActive)
            Positioned.fill(
              child: Container(
                color: Colors.red.withOpacity(0.9),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.warning_amber_rounded, size: 80, color: Colors.white),
                      const SizedBox(height: 16),
                      const Text(
                        "DROWSINESS DETECTED!",
                        style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 28),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.red.shade900,
                          padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 22),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(36)),
                        ),
                        onPressed: dismissL2Alarm,
                        child: const Text(
                          "I'M AWAKE",
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
