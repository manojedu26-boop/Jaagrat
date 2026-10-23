import 'dart:async';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:provider/provider.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/services/sensor_guard_service.dart';
import '../../core/services/driver_monitor_service.dart';
import '../widgets/status_pill.dart';
import '../widgets/alert_modal_overlay.dart';
import '../widgets/long_press_button.dart';
import 'screen_language.dart';

class ScreenActiveDrive extends StatefulWidget {
  final CameraController? cameraController;
  final CameraDescription? cameraDescription;

  const ScreenActiveDrive({
    super.key,
    this.cameraController,
    this.cameraDescription,
  });

  @override
  State<ScreenActiveDrive> createState() => _ScreenActiveDriveState();
}

class _ScreenActiveDriveState extends State<ScreenActiveDrive> {
  CameraController? _cameraController;
  CameraDescription? _frontCamera;
  bool _isCameraActive = false;
  bool _isInitializingCamera = false;

  late Stopwatch _tripStopwatch;
  Timer? _tickerTimer;
  String _formattedDuration = '00:00:00';

  @override
  void initState() {
    super.initState();
    // 1. Keep phone screen on while driving
    WakelockPlus.enable();

    // 2. Start GPS Speed & Pothole Shock sensors
    context.read<SensorGuardService>().startMonitoring();

    // 3. Start trip elapsed timer
    _tripStopwatch = Stopwatch()..start();
    _tickerTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      final elapsed = _tripStopwatch.elapsed;
      setState(() {
        _formattedDuration = [
          elapsed.inHours.toString().padLeft(2, '0'),
          (elapsed.inMinutes % 60).toString().padLeft(2, '0'),
          (elapsed.inSeconds % 60).toString().padLeft(2, '0'),
        ].join(':');
      });
    });

    // 4. Auto-initialize front camera if provided or initialize fresh
    if (widget.cameraController != null && widget.cameraController!.value.isInitialized) {
      _cameraController = widget.cameraController;
      _frontCamera = widget.cameraDescription;
      _isCameraActive = true;
      _startImageStream();
    } else {
      _initFrontCamera();
    }
  }

  Future<void> _initFrontCamera() async {
    setState(() => _isInitializingCamera = true);
    try {
      final cameras = await availableCameras();
      _frontCamera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _cameraController = CameraController(
        _frontCamera!,
        ResolutionPreset.medium, // 480p is optimal for cool thermals and 15 FPS inference
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.nv21,
      );

      await _cameraController!.initialize();
      if (!mounted) return;

      setState(() {
        _isCameraActive = true;
        _isInitializingCamera = false;
      });

      _startImageStream();
    } catch (e) {
      print('[ScreenActiveDrive] Front camera init notice: $e');
      if (mounted) {
        setState(() => _isInitializingCamera = false);
      }
    }
  }

  void _startImageStream() {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    final monitorService = context.read<DriverMonitorService>();

    if (!_cameraController!.value.isStreamingImages && _frontCamera != null) {
      _cameraController!.startImageStream((CameraImage image) {
        monitorService.processCameraImage(image, _frontCamera!);
      });
    }
  }

  Future<void> _toggleCamera() async {
    if (_isCameraActive) {
      if (_cameraController != null && _cameraController!.value.isStreamingImages) {
        await _cameraController!.stopImageStream();
      }
      setState(() => _isCameraActive = false);
    } else {
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        _startImageStream();
        setState(() => _isCameraActive = true);
      } else {
        await _initFrontCamera();
      }
    }
  }

  void _onDismissAlert() {
    context.read<DriverMonitorService>().dismissAlert();
  }

  void _onEndTrip() async {
    _tripStopwatch.stop();
    _tickerTimer?.cancel();
    WakelockPlus.disable();

    final monitorService = context.read<DriverMonitorService>();
    monitorService.dismissAlert();
    context.read<SensorGuardService>().stopMonitoring();

    try {
      if (_cameraController != null && _cameraController!.value.isStreamingImages) {
        await _cameraController!.stopImageStream();
      }
      await _cameraController?.dispose();
    } catch (e) {
      print('[ScreenActiveDrive] Camera dispose notice: $e');
    }

    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const ScreenLanguage()),
      (route) => false,
    );
  }

  @override
  void dispose() {
    _tripStopwatch.stop();
    _tickerTimer?.cancel();
    WakelockPlus.disable();
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sensorGuard = context.watch<SensorGuardService>();
    final monitor = context.watch<DriverMonitorService>();

    // Determine current status indicator
    final String statusText;
    final Color statusColor;

    if (sensorGuard.isShockActive) {
      statusText = 'ROAD BUMP (SUPPRESSED)';
      statusColor = AppColors.standbyAmber;
    } else if (!sensorGuard.isArmedForAlerts) {
      statusText = 'STANDBY (<10 KM/H)';
      statusColor = AppColors.standbyAmber;
    } else {
      statusText = 'ARMED & MONITORING';
      statusColor = AppColors.activeGreen;
    }

    final double speedKmh = sensorGuard.currentSpeedKmh;

    return WillPopScope(
      onWillPop: () async => false, // Prevent accidental back gestures while driving
      child: Scaffold(
        // Clean white driver-friendly background
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 1,
          title: const Text(
            'JAAGRAT • जाग्रत',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: 0.5,
            ),
          ),
          actions: [
            // GPS Speed Readout Pill
            Container(
              margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.cardSurface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Row(
                children: [
                  const Icon(Icons.speed_rounded, size: 16, color: AppColors.primaryButton),
                  const SizedBox(width: 6),
                  Text(
                    '${speedKmh.toStringAsFixed(0)} km/h',
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        body: SafeArea(
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 1. Status Bar
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        StatusPill(
                          statusText: statusText,
                          dotColor: statusColor,
                        ),
                        Text(
                          'Trip: $_formattedDuration',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // 2. Camera Card (Clean White Frame + Face Guide)
                    Expanded(
                      flex: 5,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.cardSurface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder, width: 1.5),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            if (_isCameraActive && _cameraController != null && _cameraController!.value.isInitialized)
                              SizedBox.expand(
                                child: CameraPreview(_cameraController!),
                              )
                            else
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.videocam_off_outlined,
                                      size: 54,
                                      color: AppColors.textTertiary,
                                    ),
                                    const SizedBox(height: 12),
                                    const Text(
                                      'Camera is Stopped',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      'Tap "Start Camera" below to begin face tracking',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: AppColors.textTertiary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                            // Oval Face Guide Overlay
                            if (_isCameraActive)
                              Container(
                                width: 200,
                                height: 260,
                                decoration: BoxDecoration(
                                  shape: BoxShape.rectangle,
                                  borderRadius: BorderRadius.circular(100),
                                  border: Border.all(
                                    color: monitor.isFaceDetected
                                        ? AppColors.activeGreen.withOpacity(0.8)
                                        : Colors.white.withOpacity(0.6),
                                    width: 2.5,
                                  ),
                                ),
                              ),

                            // Camera Toggle Button Top Right
                            Positioned(
                              top: 12,
                              right: 12,
                              child: ElevatedButton.icon(
                                onPressed: _toggleCamera,
                                icon: Icon(
                                  _isCameraActive ? Icons.videocam_off : Icons.videocam,
                                  size: 16,
                                ),
                                label: Text(_isCameraActive ? 'Stop' : 'Start Camera'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _isCameraActive ? Colors.white : AppColors.primaryButton,
                                  foregroundColor: _isCameraActive ? Colors.black : Colors.white,
                                  elevation: 2,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 3. Driver Telemetry Readings Card (No nonsense words)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.cardSurface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Eye Status:',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              Text(
                                monitor.currentEar < monitor.calibratedThreshold
                                    ? '⚠️ CLOSED (${monitor.currentEar.toStringAsFixed(2)})'
                                    : 'OPEN (${monitor.currentEar.toStringAsFixed(2)})',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: monitor.currentEar < monitor.calibratedThreshold
                                      ? AppColors.criticalRed
                                      : AppColors.activeGreen,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Microsleep Counter (1.2s Trigger):',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              Text(
                                '${monitor.consecutiveClosedFrames} / 18 frames',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: monitor.consecutiveClosedFrames > 8
                                      ? AppColors.criticalRed
                                      : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 4. End Trip Button
                    LongPressEndTripButton(
                      onEndTripConfirmed: _onEndTrip,
                    ),
                  ],
                ),
              ),

              // 5. Emergency Full-Screen Siren Overlay (Visible only when microsleep or severe alert triggers)
              if (monitor.isAlertActive)
                AlertModalOverlay(
                  alertLevel: monitor.currentAlertLevel,
                  onDismiss: _onDismissAlert,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
