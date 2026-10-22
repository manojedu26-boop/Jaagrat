class DriverProfile {
  final String phoneNumber;
  final String languageCode;
  final String vehicleNumber;
  final String fleetCode;

  const DriverProfile({
    required this.phoneNumber,
    required this.languageCode,
    required this.vehicleNumber,
    required this.fleetCode,
  });

  Map<String, dynamic> toJson() => {
        'phoneNumber': phoneNumber,
        'languageCode': languageCode,
        'vehicleNumber': vehicleNumber,
        'fleetCode': fleetCode,
      };

  factory DriverProfile.fromJson(Map<String, dynamic> json) => DriverProfile(
        phoneNumber: json['phoneNumber'] as String? ?? '',
        languageCode: json['languageCode'] as String? ?? 'hi',
        vehicleNumber: json['vehicleNumber'] as String? ?? '',
        fleetCode: json['fleetCode'] as String? ?? '',
      );

  DriverProfile copyWith({
    String? phoneNumber,
    String? languageCode,
    String? vehicleNumber,
    String? fleetCode,
  }) {
    return DriverProfile(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      languageCode: languageCode ?? this.languageCode,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      fleetCode: fleetCode ?? this.fleetCode,
    );
  }
}
