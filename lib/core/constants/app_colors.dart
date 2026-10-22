import 'package:flutter/material.dart';

/// Design tokens inspired by modern high-contrast tactile interfaces.
/// High contrast, dark mode focused (#121212 / #000000) for OLED power saving
/// and anti-glare safety during night highway shifts in India.
class AppColors {
  // Pure OLED Pitch Black (ScreenActiveDrive)
  static const Color oledBlack = Color(0xFF000000);

  // Deep High-Contrast Surfaces
  static const Color background = Color(0xFF121212);
  static const Color cardSurface = Color(0xFF1C1C1E);
  static const Color cardElevated = Color(0xFF242426);
  static const Color cardBorder = Color(0xFF2E2E32);

  // Status & Telemetry
  static const Color activeGreen = Color(0xFF10B981);
  static const Color activeGreenGlow = Color(0x3310B981);
  static const Color standbyAmber = Color(0xFFF59E0B);
  static const Color criticalRed = Color(0xFFEF4444);
  static const Color criticalRedGlow = Color(0x4DEF4444);

  // Typography & Accents
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textTertiary = Color(0xFF6B7280);

  // Button & Touch Targets
  static const Color primaryButton = Color(0xFFFFFFFF);
  static const Color primaryButtonText = Color(0xFF000000);
  static const Color emergencyButton = Color(0xFFEF4444);
  static const Color emergencyButtonText = Color(0xFFFFFFFF);
}
