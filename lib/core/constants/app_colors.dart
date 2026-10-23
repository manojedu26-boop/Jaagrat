import 'package:flutter/material.dart';

/// Clean, driver-friendly design tokens.
/// High contrast, pure white background (#FFFFFF) with crisp slate borders
/// and deep charcoal typography for maximum daylight & nighttime legibility.
class AppColors {
  // Pure White Clean Surfaces
  static const Color background = Color(0xFFFFFFFF);
  static const Color cardSurface = Color(0xFFF8FAFC);
  static const Color cardElevated = Color(0xFFF1F5F9);
  static const Color cardBorder = Color(0xFFCBD5E1);

  // Status & Telemetry (High Contrast)
  static const Color activeGreen = Color(0xFF16A34A);
  static const Color activeGreenGlow = Color(0x3316A34A);
  static const Color standbyAmber = Color(0xFFD97706);
  static const Color criticalRed = Color(0xFFDC2626);
  static const Color criticalRedGlow = Color(0x4DDC2626);

  // High-Contrast Typography
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF334155);
  static const Color textTertiary = Color(0xFF64748B);

  // Buttons & Touch Targets
  static const Color primaryButton = Color(0xFFEA580C); // Safety Orange
  static const Color primaryButtonText = Color(0xFFFFFFFF);
  static const Color secondaryButton = Color(0xFF1E293B); // Deep Navy Slate
  static const Color secondaryButtonText = Color(0xFFFFFFFF);
  static const Color emergencyButton = Color(0xFFDC2626);
  static const Color emergencyButtonText = Color(0xFFFFFFFF);
}

