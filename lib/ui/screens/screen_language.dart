import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/services/storage_service.dart';
import '../widgets/language_card.dart';
import '../widgets/primary_button.dart';
import 'screen_auth.dart';

class ScreenLanguage extends StatefulWidget {
  const ScreenLanguage({super.key});

  @override
  State<ScreenLanguage> createState() => _ScreenLanguageState();
}

class _ScreenLanguageState extends State<ScreenLanguage> {
  SupportedLanguage _selectedLanguage = SupportedLanguage.hindi;

  @override
  void initState() {
    super.initState();
    _loadSavedLanguage();
  }

  void _loadSavedLanguage() {
    final storage = context.read<StorageService>();
    final code = storage.getSelectedLanguage();
    setState(() {
      _selectedLanguage = SupportedLanguage.fromCode(code);
    });
  }

  Future<void> _onProceed() async {
    final storage = context.read<StorageService>();
    await storage.saveSelectedLanguage(_selectedLanguage.code);

    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ScreenAuth(selectedLanguage: _selectedLanguage),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.appName),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.cardSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: const Text(
                  'v1.0',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              const Text(
                AppStrings.selectLanguageTitle,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                AppStrings.selectLanguageSubtitle,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 24),

              // 2x3 Grid of Indian Regional Languages
              Expanded(
                child: GridView.builder(
                  physics: const BouncingScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 1.35,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                  ),
                  itemCount: SupportedLanguage.values.length,
                  itemBuilder: (context, index) {
                    final lang = SupportedLanguage.values[index];
                    return LanguageCard(
                      language: lang,
                      isSelected: _selectedLanguage == lang,
                      onTap: () {
                        setState(() {
                          _selectedLanguage = lang;
                        });
                      },
                    );
                  },
                ),
              ),

              // Bottom proceed button (>60px height)
              PrimaryButton(
                label: 'CONTINUE (${_selectedLanguage.nativeName})',
                onPressed: _onProceed,
                backgroundColor: AppColors.primaryButton,
                textColor: AppColors.primaryButtonText,
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
