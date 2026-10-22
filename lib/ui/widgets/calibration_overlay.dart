import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class CalibrationOverlay extends StatelessWidget {
  final bool isFaceCentered;
  final double currentEar;
  final bool isLocked;

  const CalibrationOverlay({
    super.key,
    required this.isFaceCentered,
    required this.currentEar,
    required this.isLocked,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _FaceOvalPainter(
        isLocked: isLocked,
        isFaceCentered: isFaceCentered,
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 180),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.75),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isLocked ? AppColors.activeGreen : AppColors.cardBorder,
                  width: 1.2,
                ),
              ),
              child: Text(
                isLocked
                    ? 'LOCKED • EAR: ${currentEar.toStringAsFixed(2)}'
                    : isFaceCentered
                        ? 'MEASURING BASELINE...'
                        : 'CENTER FACE IN OVAL',
                style: TextStyle(
                  color: isLocked ? AppColors.activeGreen : AppColors.textPrimary,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FaceOvalPainter extends CustomPainter {
  final bool isLocked;
  final bool isFaceCentered;

  _FaceOvalPainter({
    required this.isLocked,
    required this.isFaceCentered,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Rect fullRect = Rect.fromLTWH(0, 0, size.width, size.height);

    // Oval dimensions centered in the upper-middle of viewport
    final double ovalWidth = size.width * 0.72;
    final double ovalHeight = size.height * 0.48;
    final Rect ovalRect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height * 0.42),
      width: ovalWidth,
      height: ovalHeight,
    );

    // 1. Semi-transparent backdrop with cutout oval
    final Path backgroundPath = Path()..addRect(fullRect);
    final Path ovalPath = Path()..addOval(ovalRect);
    final Path maskPath = Path.combine(PathOperation.difference, backgroundPath, ovalPath);

    final Paint maskPaint = Paint()..color = Colors.black.withOpacity(0.65);
    canvas.drawPath(maskPath, maskPaint);

    // 2. High-contrast alignment oval boundary
    final Color strokeColor = isLocked
        ? AppColors.activeGreen
        : isFaceCentered
            ? AppColors.standbyAmber
            : AppColors.textSecondary.withOpacity(0.6);

    final Paint borderPaint = Paint()
      ..color = strokeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = isLocked ? 3.5 : 2.0;

    canvas.drawOval(ovalRect, borderPaint);

    // 3. Subtle alignment tick marks (top, bottom, left, right)
    final Paint tickPaint = Paint()
      ..color = strokeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    const double tickLength = 16.0;
    // Top
    canvas.drawLine(
      Offset(ovalRect.center.dx, ovalRect.top - tickLength),
      Offset(ovalRect.center.dx, ovalRect.top),
      tickPaint,
    );
    // Bottom
    canvas.drawLine(
      Offset(ovalRect.center.dx, ovalRect.bottom),
      Offset(ovalRect.center.dx, ovalRect.bottom + tickLength),
      tickPaint,
    );
    // Left
    canvas.drawLine(
      Offset(ovalRect.left - tickLength, ovalRect.center.dy),
      Offset(ovalRect.left, ovalRect.center.dy),
      tickPaint,
    );
    // Right
    canvas.drawLine(
      Offset(ovalRect.right, ovalRect.center.dy),
      Offset(ovalRect.right + tickLength, ovalRect.center.dy),
      tickPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _FaceOvalPainter oldDelegate) {
    return oldDelegate.isLocked != isLocked || oldDelegate.isFaceCentered != isFaceCentered;
  }
}
