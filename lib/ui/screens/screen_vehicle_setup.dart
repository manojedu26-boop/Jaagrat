import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/services/storage_service.dart';
import '../../core/services/driver_monitor_service.dart';
import '../widgets/primary_button.dart';
import 'screen_calibration.dart';

class ScreenVehicleSetup extends StatefulWidget {
  final String driverPhone;

  const ScreenVehicleSetup({super.key, required this.driverPhone});

  @override
  State<ScreenVehicleSetup> createState() => _ScreenVehicleSetupState();
}

class _ScreenVehicleSetupState extends State<ScreenVehicleSetup> {
  final TextEditingController _vehicleController = TextEditingController();
  final TextEditingController _fleetController = TextEditingController();

  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadExistingProfile();
  }

  void _loadExistingProfile() {
    final storage = context.read<StorageService>();
    final profile = storage.getDriverProfile();
    if (profile.vehicleNumber.isNotEmpty) {
      _vehicleController.text = profile.vehicleNumber;
    }
    if (profile.fleetCode.isNotEmpty) {
      _fleetController.text = profile.fleetCode;
    }
  }

  @override
  void dispose() {
    _vehicleController.dispose();
    _fleetController.dispose();
    super.dispose();
  }

  Future<void> _proceedToCalibration() async {
    final vehicle = _vehicleController.text.trim().toUpperCase();
    final fleet = _fleetController.text.trim().toUpperCase();

    if (vehicle.isEmpty) {
      setState(() => _errorMessage = 'Please enter Vehicle Registration Number');
      return;
    }
    if (fleet.isEmpty) {
      setState(() => _errorMessage = 'Please enter Fleet Owner Code');
      return;
    }

    final storage = context.read<StorageService>();
    final currentProfile = storage.getDriverProfile();
    final updatedProfile = currentProfile.copyWith(
      phoneNumber: widget.driverPhone,
      vehicleNumber: vehicle,
      fleetCode: fleet,
    );

    await storage.saveDriverProfile(updatedProfile);

    // Update DriverMonitorService with active profile
    if (!mounted) return;
    context.read<DriverMonitorService>().updateProfile(updatedProfile);

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const ScreenCalibration(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.vehicleSetupTitle),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              const Text(
                'Vehicle Setup',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                AppStrings.vehicleSetupSubtitle,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 32),

              // Vehicle Registration Number
              const Text(
                AppStrings.vehicleNumberLabel,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _vehicleController,
                textCapitalization: TextCapitalization.characters,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                  color: AppColors.textPrimary,
                ),
                decoration: const InputDecoration(
                  hintText: 'KA 01 AB 1234',
                  prefixIcon: Icon(Icons.local_shipping_outlined, color: AppColors.textSecondary),
                ),
              ),
              const SizedBox(height: 24),

              // Fleet Owner Code
              const Text(
                AppStrings.fleetCodeLabel,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _fleetController,
                textCapitalization: TextCapitalization.characters,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                  color: AppColors.textPrimary,
                ),
                decoration: const InputDecoration(
                  hintText: 'FLT-9021',
                  prefixIcon: Icon(Icons.business_outlined, color: AppColors.textSecondary),
                ),
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.criticalRed.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.criticalRed.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, size: 18, color: AppColors.criticalRed),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            color: AppColors.criticalRed,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const Spacer(),

              // Continue to Calibration (>60px height)
              PrimaryButton(
                label: AppStrings.continueToCalibration,
                onPressed: _proceedToCalibration,
                icon: Icons.camera_alt_outlined,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
