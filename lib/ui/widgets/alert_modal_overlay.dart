import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/services/driver_monitor_service.dart';

class AlertModalOverlay extends StatefulWidget {
  final AlertLevel alertLevel;
  final VoidCallback onDismiss;

  const AlertModalOverlay({
    super.key,
    required this.alertLevel,
    required this.onDismiss,
  });

  @override
  State<AlertModalOverlay> createState() => _AlertModalOverlayState();
}

class _AlertModalOverlayState extends State<AlertModalOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isMicrosleep = widget.alertLevel == AlertLevel.level2Microsleep;

    return Container(
      width: double.infinity,
      height: double.infinity,
      color: Colors.black.withOpacity(0.92),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Emergency flashing icon
          AnimatedBuilder(
            animation: _animController,
            builder: (context, child) {
              return Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isMicrosleep
                      ? AppColors.criticalRed.withOpacity(0.2)
                      : AppColors.standbyAmber.withOpacity(0.2),
                  border: Border.all(
                    color: isMicrosleep ? AppColors.criticalRed : AppColors.standbyAmber,
                    width: 3.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (isMicrosleep ? AppColors.criticalRed : AppColors.standbyAmber)
                          .withOpacity(0.6 * _animController.value),
                      blurRadius: 30,
                      spreadRadius: 8,
                    ),
                  ],
                ),
                child: Icon(
                  isMicrosleep ? Icons.warning_amber_rounded : Icons.visibility_off_rounded,
                  size: 54,
                  color: isMicrosleep ? AppColors.criticalRed : AppColors.standbyAmber,
                ),
              );
            },
          ),
          const SizedBox(height: 28),
          Text(
            isMicrosleep ? AppStrings.alertMicrosleepTitle : 'DROWSINESS DETECTED',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 26,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isMicrosleep
                ? AppStrings.alertMicrosleepSubtitle
                : 'Eyes closed trend detected over 60 seconds',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 48),

          // Massive >80px high-contrast "I AM AWAKE" button
          ScaleTransition(
            scale: _pulseAnimation,
            child: SizedBox(
              width: double.infinity,
              height: 84,
              child: ElevatedButton(
                onPressed: widget.onDismiss,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.activeGreen,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                  elevation: 12,
                  shadowColor: AppColors.activeGreen.withOpacity(0.6),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.check_circle_rounded, size: 32, color: Colors.black),
                    SizedBox(width: 14),
                    Text(
                      AppStrings.iAmAwake,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        color: Colors.black,
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
