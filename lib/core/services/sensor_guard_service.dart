import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';
import '../constants/app_constants.dart';

/// Sensor Guard Gate: Filters out Indian road vibrations, potholes,
/// and low-speed traffic / parking conditions.
class SensorGuardService extends ChangeNotifier {
  // Current Telemetry
  double _currentSpeedKmh = 0.0;
  double _currentLatitude = 0.0;
  double _currentLongitude = 0.0;
  bool _hasLocationLock = false;

  // Accelerometer Shock Suppression
  DateTime _shockSuppressionUntil = DateTime.fromMillisecondsSinceEpoch(0);
  double _lastPeakG = 1.0;

  // Stream Subscriptions
  StreamSubscription<Position>? _positionSubscription;
  StreamSubscription<AccelerometerEvent>? _accelSubscription;

  // Getters
  double get currentSpeedKmh => _currentSpeedKmh;
  double get currentLatitude => _currentLatitude;
  double get currentLongitude => _currentLongitude;
  bool get hasLocationLock => _hasLocationLock;
  double get lastPeakG => _lastPeakG;

  /// Gate 1: GPS Speed Check (< 10 km/h suppresses alerts)
  bool get isArmedForAlerts => _currentSpeedKmh >= AppConstants.gpsSpeedArmingThresholdKmh;

  /// Gate 2: Road Shock Filter (Active for 600ms after > 1.8G bump)
  bool get isShockActive => DateTime.now().isBefore(_shockSuppressionUntil);

  void startMonitoring() {
    _initGps();
    _initAccelerometer();
  }

  void _initGps() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('[SensorGuardService] Location services disabled');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        const locationSettings = LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 2,
        );

        _positionSubscription = Geolocator.getPositionStream(
          locationSettings: locationSettings,
        ).listen((Position position) {
          // Convert m/s to km/h (speed >= 0)
          final double speed = (position.speed * 3.6).clamp(0.0, 160.0);
          _currentSpeedKmh = speed;
          _currentLatitude = position.latitude;
          _currentLongitude = position.longitude;
          _hasLocationLock = true;
          notifyListeners();
        }, onError: (e) {
          print('[SensorGuardService] GPS Stream Error: $e');
        });
      }
    } catch (e) {
      print('[SensorGuardService] GPS init error: $e');
    }
  }

  void _initAccelerometer() {
    try {
      _accelSubscription = accelerometerEventStream().listen((AccelerometerEvent event) {
        // Calculate instantaneous G-force: sqrt(x^2 + y^2 + z^2) / 9.80665
        final double magnitude = math.sqrt(
          (event.x * event.x) + (event.y * event.y) + (event.z * event.z),
        );
        final double currentG = magnitude / 9.80665;
        _lastPeakG = currentG;

        // If sudden vertical jerk exceeds 1.8G (pothole / speed breaker)
        if (currentG >= AppConstants.shockThresholdG) {
          _shockSuppressionUntil = DateTime.now().add(
            const Duration(milliseconds: AppConstants.shockSuppressionDurationMs),
          );
          notifyListeners();
        }
      }, onError: (e) {
        print('[SensorGuardService] Accelerometer Error: $e');
      });
    } catch (e) {
      print('[SensorGuardService] Accelerometer init error: $e');
    }
  }

  void stopMonitoring() {
    _positionSubscription?.cancel();
    _accelSubscription?.cancel();
    _positionSubscription = null;
    _accelSubscription = null;
  }

  @override
  void dispose() {
    stopMonitoring();
    super.dispose();
  }
}
