import 'package:cloud_firestore/cloud_firestore.dart';
import '../constants/app_constants.dart';
import '../models/fatigue_event.dart';

class TelemetryService {
  final FirebaseFirestore _firestore;

  TelemetryService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  /// Fire-and-forget telemetry push to Firestore.
  /// Strictly minimal JSON (under 1 KB payload). Never sends video or image data.
  Future<void> logFatigueEvent(FatigueEvent event) async {
    try {
      await _firestore
          .collection(AppConstants.firestoreCollectionFatigueEvents)
          .add(event.toFirestore())
          .timeout(const Duration(seconds: 4));
    } catch (e) {
      // In case highway cellular connectivity is dead, suppress exception
      // The local driver alert takes precedence over cloud sync.
      print('[TelemetryService] Non-blocking cloud telemetry sync notice: $e');
    }
  }
}
