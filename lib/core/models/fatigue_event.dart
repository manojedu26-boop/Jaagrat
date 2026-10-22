import 'package:cloud_firestore/cloud_firestore.dart';

enum FatigueAlertType {
  level1Perclos('LEVEL_1_PERCLOS'),
  level2Microsleep('LEVEL_2_MICROSLEEP');

  final String value;
  const FatigueAlertType(this.value);
}

class FatigueEvent {
  final String driverId;
  final String vehicleId;
  final String fleetId;
  final DateTime timestamp;
  final FatigueAlertType alertType;
  final double speedKmh;
  final double latitude;
  final double longitude;
  final double? earScore;

  const FatigueEvent({
    required this.driverId,
    required this.vehicleId,
    required this.fleetId,
    required this.timestamp,
    required this.alertType,
    required this.speedKmh,
    required this.latitude,
    required this.longitude,
    this.earScore,
  });

  Map<String, dynamic> toFirestore() => {
        'driver_id': driverId,
        'vehicle_id': vehicleId,
        'fleet_id': fleetId,
        'timestamp': FieldValue.serverTimestamp(),
        'alert_type': alertType.value,
        'speed_kmh': speedKmh,
        'latitude': latitude,
        'longitude': longitude,
        'ear_score': earScore,
      };

  Map<String, dynamic> toJson() => {
        'driver_id': driverId,
        'vehicle_id': vehicleId,
        'fleet_id': fleetId,
        'timestamp': timestamp.toIso8601String(),
        'alert_type': alertType.value,
        'speed_kmh': speedKmh,
        'latitude': latitude,
        'longitude': longitude,
        'ear_score': earScore,
      };
}
