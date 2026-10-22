class CalibrationData {
  final double neutralEar;
  final double thresholdEar;
  final bool isCalibrated;
  final DateTime? calibratedAt;

  const CalibrationData({
    required this.neutralEar,
    required this.thresholdEar,
    required this.isCalibrated,
    this.calibratedAt,
  });

  factory CalibrationData.initial() => const CalibrationData(
        neutralEar: 0.30,
        thresholdEar: 0.21,
        isCalibrated: false,
      );

  factory CalibrationData.fromNeutralEar(double ear) {
    // Threshold set dynamically to 70% of driver's resting open-eye ratio
    final double calculatedThreshold = (ear * 0.70).clamp(0.18, 0.25);
    return CalibrationData(
      neutralEar: ear,
      thresholdEar: calculatedThreshold,
      isCalibrated: true,
      calibratedAt: DateTime.now(),
    );
  }
}
