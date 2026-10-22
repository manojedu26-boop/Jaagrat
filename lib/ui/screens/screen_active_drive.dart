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
  late Stopwatch _tripStopwatch;
  Timer? _tickerTimer;
  String _formattedDuration = '00:00:00';

  @override
  void initState() {
    super.initState();
    // 1. Prevent phone screen from sleeping while driving
    WakelockPlus.enable();

    // 2. Start GPS & Accelerometer sensors
    context.read<SensorGuardService>().startMonitoring();

    // 3. Start trip timer
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

    // 4. Ensure camera stream is actively driving inference
    _ensureCameraStreaming();
  }

  void _ensureCameraStreaming() {
    final camera = widget.cameraController;
    final description = widget.cameraDescription;
    final monitorService = context.read<DriverMonitorService>();

    if (camera != null && camera.value.isInitialized && description != null) {
      if (!camera.value.isStreamingImages) {
        camera.startImageStream((CameraImage image) {
          monitorService.processCameraImage(image, description);
        });
      }
    }
  }

  void _onDismissAlert() {
    context.read<DriverMonitorService>().dismissAlert();
  }

  void _onEndTrip() async {
    _tripStopwatch.stop();
    _tickerTimer?.cancel();

    // Turn off wakelock
    WakelockPlus.disable();

    // Stop sensors & alerts
    final monitorService = context.read<DriverMonitorService>();
    monitorService.dismissAlert();
    context.read<SensorGuardService>().stopMonitoring();

    // Safely stop camera stream
    try {
      if (widget.cameraController != null &&
          widget.cameraController!.value.isStreamingImages) {
        await widget.cameraController!.stopImageStream();
      }
      await widget.cameraController?.dispose();
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
      statusText = AppStrings.statusShock;
      statusColor = AppColors.standbyAmber;
    } else if (!sensorGuard.isArmedForAlerts) {
      statusText = AppStrings.statusStandby;
      statusColor = AppColors.standbyAmber;
    } else {
      statusText = AppStrings.statusActive;
      statusColor = AppColors.activeGreen;
    }

    final double speedKmh = sensorGuard.currentSpeedKmh;

    return WillPopScope(
      onWillPop: () async => false, // Prevent accidental Android back gestures while driving
      child: Scaffold(
        // Pitch black OLED background (#000000) for zero glare and maximum power efficiency
        backgroundColor: AppColors.oledBlack,
        body: SafeArea(
          child: Stack(
            children: [
              // 1. Clean, Zero-Distraction OLED Driving HUD
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  children: [
                    // Top Telemetry Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Left: Active Status Pill
                        StatusPill(
                          statusText: statusText,
                          dotColor: statusColor,
                        ),

                        // Right: GPS Speed Readout Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.cardSurface,
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(color: AppColors.cardBorder, width: 1.2),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.speed_rounded,
                                size: 16,
                                color: AppColors.textSecondary,
                              ),
                              const SizedBox(width: 8),
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

                    const Spacer(),

                    // Minimalist Center Time & Trip Counter (Zero Video Feed)
                    Column(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.cardSurface,
                            border: Border.all(color: AppColors.cardBorder),
                          ),
                          child: const Icon(
                            Icons.shield_outlined,
                            size: 40,
                            color: AppColors.activeGreen,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          _formattedDuration,
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2.0,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'TRIP IN PROGRESS • VISION ENGINE ACTIVE',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1.0,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Bottom 2-second Long-Press End Trip Button
                    LongPressEndTripButton(
                      onEndTripConfirmed: _onEndTrip,
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),

              // 2. High-Contrast Alert Overlay (Appears ONLY during alert)
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
