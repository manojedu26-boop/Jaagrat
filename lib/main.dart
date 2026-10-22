import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'core/services/storage_service.dart';
import 'core/services/sensor_guard_service.dart';
import 'core/services/audio_alert_service.dart';
import 'core/services/vibration_service.dart';
import 'core/services/telemetry_service.dart';
import 'core/services/driver_monitor_service.dart';
import 'ui/screens/screen_language.dart';
import 'ui/screens/screen_active_drive.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait orientation for dashboard phone mounts
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  // Set immersive dark system UI overlays
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF121212),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Initialize Storage
  final storageService = await StorageService.init();

  // Initialize Firebase (safeguarded against missing google-services.json in local tests)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    print('[Main] Firebase initialization note (using local mocks for standalone runs): $e');
  }

  // Core Hardware & Alert Services
  final sensorGuardService = SensorGuardService();
  final audioAlertService = AudioAlertService();
  final vibrationService = VibrationService();
  final telemetryService = TelemetryService();

  final driverMonitorService = DriverMonitorService(
    sensorGuard: sensorGuardService,
    audioAlert: audioAlertService,
    vibration: vibrationService,
    telemetry: telemetryService,
  );

  runApp(
    MultiProvider(
      providers: [
        Provider<StorageService>.value(value: storageService),
        ChangeNotifierProvider<SensorGuardService>.value(value: sensorGuardService),
        Provider<AudioAlertService>.value(value: audioAlertService),
        Provider<VibrationService>.value(value: vibrationService),
        Provider<TelemetryService>.value(value: telemetryService),
        ChangeNotifierProvider<DriverMonitorService>.value(value: driverMonitorService),
      ],
      child: const JaagratApp(),
    ),
  );
}

class JaagratApp extends StatelessWidget {
  const JaagratApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Jaagrat',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const ScreenLanguage(),
    );
  }
}
