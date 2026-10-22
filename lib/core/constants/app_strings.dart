/// Supported Indian Regional Languages and Voice Prompts
enum SupportedLanguage {
  hindi('hi', 'हिन्दी', 'Hindi', 'कृपया ध्यान दें, सड़क पर नजर रखें।'),
  kannada('kn', 'ಕನ್ನಡ', 'Kannada', 'ದಯವಿಟ್ಟು ಎಚ್ಚರವಾಗಿರಿ, ರಸ್ತೆಯ ಮೇಲೆ ಗಮನವಿರಲಿ.'),
  tamil('ta', 'தமிழ்', 'Tamil', 'தயவுசெய்து கவனமாக இருங்கள், சாலையில் கவனம் செலுத்துங்கள்.'),
  telugu('te', 'తెలుగు', 'Telugu', 'దయచేసి అప్రమత్తంగా ఉండండి, రోడ్డుపై దృష్టి పెట్టండి.'),
  marathi('mr', 'मराठी', 'Marathi', 'कृपया लक्ष द्या, रस्त्याकडे पहा.'),
  english('en', 'English', 'English', 'Attention! Please stay alert and focus on the road.');

  final String code;
  final String nativeName;
  final String englishName;
  final String speechPrompt;

  const SupportedLanguage(
    this.code,
    this.nativeName,
    this.englishName,
    this.speechPrompt,
  );

  static SupportedLanguage fromCode(String? code) {
    return SupportedLanguage.values.firstWhere(
      (lang) => lang.code == code,
      orElse: () => SupportedLanguage.hindi,
    );
  }
}

class AppStrings {
  static const String appName = 'Jaagrat';
  static const String tagline = 'Aankh Khuli, Safar Safe';

  // ScreenLanguage
  static const String selectLanguageTitle = 'Select Language';
  static const String selectLanguageSubtitle = 'Choose your language for voice alerts';

  // ScreenAuth
  static const String authTitle = 'Driver Verification';
  static const String authSubtitle = 'Enter your 10-digit mobile number';
  static const String phonePlaceholder = 'Mobile Number';
  static const String sendOtp = 'Get OTP';
  static const String enterOtp = 'Enter 6-digit OTP';
  static const String verifyOtp = 'Verify & Proceed';

  // ScreenVehicleSetup
  static const String vehicleSetupTitle = 'Vehicle Details';
  static const String vehicleSetupSubtitle = 'Link today\'s vehicle & fleet';
  static const String vehicleNumberLabel = 'Vehicle Registration No.';
  static const String vehicleNumberHint = 'KA 01 AB 1234';
  static const String fleetCodeLabel = 'Fleet Owner Code';
  static const String fleetCodeHint = 'FLT-9021';
  static const String continueToCalibration = 'Continue to Calibration';

  // ScreenCalibration
  static const String calibrationTitle = 'Face Calibration';
  static const String calibrationSubtitle = 'Align your face inside the guide oval';
  static const String calibrationNeutralLook = 'Keep eyes open, look straight ahead';
  static const String calibrationSuccess = 'Face Centered & Locked';
  static const String startTrip = 'START TRIP';

  // ScreenActiveDrive
  static const String statusActive = 'MONITORING ACTIVE';
  static const String statusStandby = 'STANDBY (<10 KM/H)';
  static const String statusShock = 'ROAD SHOCK FILTER';
  static const String alertMicrosleepTitle = 'MICROSLEEP DETECTED!';
  static const String alertMicrosleepSubtitle = 'TAP BUTTON IMMEDIATELY';
  static const String iAmAwake = 'I AM AWAKE';
  static const String endTripHold = 'HOLD TO END TRIP (2s)';
}
