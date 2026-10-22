import 'dart:async';
import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';

class LongPressEndTripButton extends StatefulWidget {
  final VoidCallback onEndTripConfirmed;
  final Duration holdDuration;

  const LongPressEndTripButton({
    super.key,
    required this.onEndTripConfirmed,
    this.holdDuration = const Duration(seconds: 2),
  });

  @override
  State<LongPressEndTripButton> createState() => _LongPressEndTripButtonState();
}

class _LongPressEndTripButtonState extends State<LongPressEndTripButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  Timer? _hapticTimer;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      vsync: this,
      duration: widget.holdDuration,
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          Vibration.vibrate(duration: 100);
          widget.onEndTripConfirmed();
        }
      });
  }

  void _onPointerDown(PointerDownEvent event) {
    _progressController.forward();
    // Light initial tick
    Vibration.vibrate(duration: 30);
  }

  void _onPointerUp(PointerUpEvent event) {
    if (_progressController.status != AnimationStatus.completed) {
      _progressController.reverse();
    }
  }

  void _onPointerCancel(PointerCancelEvent event) {
    _progressController.reverse();
  }

  @override
  void dispose() {
    _progressController.dispose();
    _hapticTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      onPointerDown: _onPointerDown,
      onPointerUp: _onPointerUp,
      onPointerCancel: _onPointerCancel,
      child: AnimatedBuilder(
        animation: _progressController,
        builder: (context, child) {
          final progress = _progressController.value;

          return Container(
            width: double.infinity,
            height: AppConstants.minTouchTargetHeight,
            decoration: BoxDecoration(
              color: AppColors.cardSurface,
              borderRadius: BorderRadius.circular(AppConstants.buttonCornerRadius),
              border: Border.all(
                color: progress > 0 ? AppColors.criticalRed : AppColors.cardBorder,
                width: progress > 0 ? 2.0 : 1.2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppConstants.buttonCornerRadius),
              child: Stack(
                children: [
                  // Smooth linear progress fill
                  FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: progress,
                    child: Container(
                      color: AppColors.criticalRed.withOpacity(0.35),
                    ),
                  ),
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.power_settings_new_rounded,
                          size: 20,
                          color: progress > 0 ? AppColors.criticalRed : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          progress > 0
                              ? 'HOLDING... ${(progress * 100).toInt()}%'
                              : 'HOLD TO END TRIP (2s)',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: progress > 0 ? AppColors.textPrimary : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
