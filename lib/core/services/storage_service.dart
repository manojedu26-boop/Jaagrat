import 'package:shared_preferences/shared_preferences.dart';
import '../models/driver_profile.dart';

class StorageService {
  static const String _keyLanguage = 'selected_language';
  static const String _keyPhone = 'driver_phone';
  static const String _keyVehicle = 'vehicle_number';
  static const String _keyFleet = 'fleet_code';
  static const String _keyNeutralEar = 'neutral_ear';

  final SharedPreferences _prefs;

  StorageService(this._prefs);

  static Future<StorageService> init() async {
    final prefs = await SharedPreferences.getInstance();
    return StorageService(prefs);
  }

  String getSelectedLanguage() {
    return _prefs.getString(_keyLanguage) ?? 'hi';
  }

  Future<void> saveSelectedLanguage(String languageCode) async {
    await _prefs.setString(_keyLanguage, languageCode);
  }

  DriverProfile getDriverProfile() {
    return DriverProfile(
      phoneNumber: _prefs.getString(_keyPhone) ?? '',
      languageCode: getSelectedLanguage(),
      vehicleNumber: _prefs.getString(_keyVehicle) ?? '',
      fleetCode: _prefs.getString(_keyFleet) ?? '',
    );
  }

  Future<void> saveDriverProfile(DriverProfile profile) async {
    await _prefs.setString(_keyPhone, profile.phoneNumber);
    await _prefs.setString(_keyLanguage, profile.languageCode);
    await _prefs.setString(_keyVehicle, profile.vehicleNumber);
    await _prefs.setString(_keyFleet, profile.fleetCode);
  }

  double getNeutralEar() {
    return _prefs.getDouble(_keyNeutralEar) ?? 0.30;
  }

  Future<void> saveNeutralEar(double ear) async {
    await _prefs.setDouble(_keyNeutralEar, ear);
  }

  bool isSetupComplete() {
    final phone = _prefs.getString(_keyPhone);
    final vehicle = _prefs.getString(_keyVehicle);
    return phone != null && phone.isNotEmpty && vehicle != null && vehicle.isNotEmpty;
  }
}
