import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Clean White Minimalist Shift Summary Modal (Step 3 Deliverable)
/// Presented when the driver ends a trip after a commercial shift.
class TripSummarySheet extends StatelessWidget {
  final String durationFormatted;
  final double averageSpeed;
  final int microsleepAlertsCount;
  final int yawnsDetectedCount;
  final int potholeBumpsSuppressed;
  final VoidCallback onClose;

  const TripSummarySheet({
    super.key,
    required this.durationFormatted,
    required this.averageSpeed,
    required this.microsleepAlertsCount,
    required this.yawnsDetectedCount,
    required this.potholeBumpsSuppressed,
    required this.onClose,
  });

  int get safetyScore {
    final penalty = (microsleepAlertsCount * 25) + (yawnsDetectedCount * 5);
    return (100 - penalty).clamp(20, 100);
  }

  @override
  Widget build(BuildContext context) {
    final score = safetyScore;
    final Color scoreColor = score >= 85
        ? AppColors.activeGreen
        : (score >= 60 ? AppColors.standbyAmber : AppColors.criticalRed);

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SHIFT SUMMARY',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textTertiary,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Trip Completed Safe',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: scoreColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: scoreColor.withOpacity(0.3)),
                ),
                child: Column(
                  children: [
                    Text(
                      '$score',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: scoreColor,
                      ),
                    ),
                    Text(
                      'SAFETY SCORE',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: scoreColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Key Metrics Grid
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              children: [
                _buildMetricRow('Shift Duration', durationFormatted, Icons.timer_outlined),
                const Divider(height: 20, thickness: 1, color: AppColors.cardBorder),
                _buildMetricRow('Average Speed', '${averageSpeed.toStringAsFixed(0)} km/h', Icons.speed_rounded),
                const Divider(height: 20, thickness: 1, color: AppColors.cardBorder),
                _buildMetricRow('Microsleep Interventions', '$microsleepAlertsCount avoided', Icons.warning_amber_rounded, isAlert: microsleepAlertsCount > 0),
                const Divider(height: 20, thickness: 1, color: AppColors.cardBorder),
                _buildMetricRow('Pothole Shocks Suppressed', '$potholeBumpsSuppressed bumps', Icons.shield_outlined),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Finish Button
          ElevatedButton(
            onPressed: onClose,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryButton,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: const Text(
              'DONE • FINISH SHIFT',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, IconData icon, {bool isAlert = false}) {
    return Row(
      children: [
        Icon(icon, size: 20, color: isAlert ? AppColors.criticalRed : AppColors.textSecondary),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: isAlert ? AppColors.criticalRed : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
