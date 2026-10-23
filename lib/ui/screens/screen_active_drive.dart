import 'dart:async';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:provider/provider.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/constants/app_colors.dart';
import '../../core/controllers/driver_monitor_controller.dart';
import '../../core/services/audio_alert_manager.dart';
import '../widgets/status_pill.dart';
import '../widgets/alert_modal_overlay.dart';
import '../widgets/long_press_button.dart';
import 'screen_language.dart';

class ScreenActiveDrive extends StatefulWidget {
  const ScreenActiveDrive({super.key});

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
    // 1. Keep phone screen and CPU alive on dashboard mount
    WakelockPlus.enable();

    // 2. Start trip duration counter
    _tripStopwatch = Stopwatch()..start();
    _tickerTimer = Timer.periodic(const Duration(seconds: 1), (_) {
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

    // 3. Auto-initialize front camera stream on launch
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<DriverMonitorController>();
      if (!controller.isCameraInitialized) {
        controller.initializeCamera();
      }
    });
  }

  void _onToggleCamera() {
    final controller = context.read<DriverMonitorController>();
    if (controller.isCameraInitialized) {
      controller.stopCamera();
    } else {
      controller.initializeCamera();
    }
  }

  void _onDismissAlert() {
    context.read<DriverMonitorController>().dismissAlert();
  }

  void _onEndTrip() async {
    _tripStopwatch.stop();
    _tickerTimer?.cancel();
    WakelockPlus.disable();

    final controller = context.read<DriverMonitorController>();
    controller.dismissAlert();
    await controller.stopCamera();

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
    final controller = context.watch<DriverMonitorController>();

    // Determine status styling
    final bool isEmergency = controller.alertLevel == AlertLevel.emergency;
    final bool isWarning = controller.alertLevel == AlertLevel.warning;

    final Color statusColor;
    if (isEmergency) {
      statusColor = AppColors.criticalRed;
    } else if (isWarning || !controller.isArmed) {
      statusColor = AppColors.standbyAmber;
    } else {
      statusColor = AppColors.activeGreen;
    }

    return WillPopScope(
      onWillPop: () async => false, // Prevent accidental back gesture while driving
      child: Scaffold(
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
                    '${controller.currentSpeed.toStringAsFixed(0)} km/h',
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
                          statusText: controller.debugStatus ?? 'ARMED & MONITORING',
                          dotColor: statusColor,
                        ),
                        Text(
                          'Shift: $_formattedDuration',
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
                            if (controller.isCameraInitialized &&
                                controller.cameraController != null &&
                                controller.cameraController!.value.isInitialized)
                              SizedBox.expand(
                                child: CameraPreview(controller.cameraController!),
                              )
                            else
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
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
                            if (controller.isCameraInitialized)
                              Container(
                                width: 200,
                                height: 260,
                                decoration: BoxDecoration(
                                  shape: BoxShape.rectangle,
                                  borderRadius: BorderRadius.circular(100),
                                  border: Border.all(
                                    color: controller.isFaceDetected
                                        ? AppColors.activeGreen.withOpacity(0.85)
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
                                onPressed: _onToggleCamera,
                                icon: Icon(
                                  controller.isCameraInitialized ? Icons.videocam_off : Icons.videocam,
                                  size: 16,
                                ),
                                label: Text(controller.isCameraInitialized ? 'Stop' : 'Start Camera'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: controller.isCameraInitialized ? Colors.white : AppColors.primaryButton,
                                  foregroundColor: controller.isCameraInitialized ? Colors.black : Colors.white,
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
                                controller.currentEar < 0.20
                                    ? '⚠️ CLOSED (${controller.currentEar.toStringAsFixed(2)})'
                                    : 'OPEN (${controller.currentEar.toStringAsFixed(2)})',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: controller.currentEar < 0.20
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
                                '${controller.consecutiveClosedFrames} / 18 frames',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: controller.consecutiveClosedFrames > 8
                                      ? AppColors.criticalRed
                                      : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                '60s Fatigue Trend (PERCLOS):',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              Text(
                                '${(controller.perclosScore * 100).toInt()}%',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: controller.perclosScore > 0.18
                                      ? AppColors.criticalRed
                                      : AppColors.activeGreen,
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
              if (isEmergency)
                AlertModalOverlay(
                  alertLevel: AlertLevel.level2Microsleep,
                  onDismiss: _onDismissAlert,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
