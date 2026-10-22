# Jaagrat (जाग्रत) — Aankh Khuli, Safar Safe

> **Ultra-minimalist, zero-slop driver drowsiness & fatigue monitor built with Flutter & on-device Computer Vision for Indian commercial fleets.**

---

## 🎯 Core Engineering Principles

1. **NO AI SLOP**: No conversational chatbots, no filler dashboard widgets, no battery-draining visual graphs on the phone. The driver app has **one single job**: keep the driver awake with zero distraction.
2. **ZERO VIDEO FEED IN DRIVE MODE**: The driver must **never** see their own face while driving. Once the trip starts, the screen switches to pure OLED pitch black (`#000000`) with only a high-contrast status pill and GPS speed.
3. **100% ON-DEVICE PRIVACY**: Video frames are processed locally in RAM at 15 FPS and discarded immediately. **Zero photos or video frames ever touch storage or the network.**
4. **INDIAN ROAD RESILIENCE**: Dual physical sensor gates prevent false alarms:
   - **Accelerometer Shock Gate**: Suppresses face detection for **600ms** if vertical acceleration exceeds **1.8G** (speed breakers, highway potholes).
   - **GPS Speed Gate**: Suppresses audio alarms below **10 km/h** (standby at traffic signals or toll plazas).

---

## 📱 User Flow & Screen Architecture

```
[ScreenLanguage] ──► [ScreenAuth] ──► [ScreenVehicleSetup] ──► [ScreenCalibration] ──► [ScreenActiveDrive]
  (6-Lang Grid)        (Phone OTP)        (Vehicle & Fleet)        (Face Oval Guide)       (OLED #000000 HUD)
```

| Screen | Description | Key UX Parameters |
| :--- | :--- | :--- |
| **`ScreenLanguage`** | 2x3 tactile grid of 6 Indian languages (Hindi, Kannada, Tamil, Telugu, Marathi, English) | Persists selection to local storage; instant audio localization |
| **`ScreenAuth`** | Phone number input with fixed `+91` badge and Firebase Phone OTP verification | Massive >60px touch targets; large high-contrast keypad |
| **`ScreenVehicleSetup`** | Registration Number (e.g. `KA 01 AB 1234`) & Fleet Code (`FLT-9021`) | Formatted uppercase input fields; profile persistence |
| **`ScreenCalibration`** | Front camera preview with custom-painted alignment oval overlay | Checks face alignment; computes resting neutral EAR baseline (2-3s); unlocks "START TRIP" |
| **`ScreenActiveDrive`** | OLED pitch-black driving HUD (`#000000`) | Status pill ("ACTIVE" / "STANDBY"), GPS speed, pulsating "I AM AWAKE" button during alerts, 2s hold-to-confirm trip exit |

---

## 🧠 Detection & Hardware Logic

### 1. Computer Vision Pipeline (MediaPipe Face Mesh)
- **Target Resolution & Rate**: 480p at 15 FPS via background isolate/image stream to prevent thermal throttling.
- **Eye Aspect Ratio (EAR)**:
  $$\text{EAR} = \frac{||p_2 - p_6|| + ||p_3 - p_5||}{2 \cdot ||p_1 - p_4||}$$
- **Microsleep Detection (Level 2 Emergency)**:
  Triggered when continuous eye closure exceeds **1.2 seconds** ($\approx 18\text{ consecutive frames at }15\text{ FPS}$).
- **PERCLOS Fatigue Trend (Level 1 Warning)**:
  Maintains a 60-second rolling buffer (900 samples). Triggers if eyes are closed $> 80\%$ of the rolling window.

### 2. Sensor Gates
- **GPS Speed Guard**: Automatically disarms alert sounds when vehicle speed $< 10\text{ km/h}$.
- **Accelerometer Shock Guard**: Any vertical acceleration spike $> 1.8G$ suppresses facial detection for **600ms** to eliminate pothole false positives.

### 3. Escalation Pipeline
- **Level 1 (Fatigue Build-up)**: Soft chime + regional speech prompt in selected Indian language:
  - *Hindi*: "कृपया ध्यान दें, सड़क पर नजर रखें।"
  - *Kannada*: "ದಯವಿಟ್ಟು ಎಚ್ಚರವಾಗಿರಿ, ರಸ್ತೆಯ ಮೇಲೆ ಗಮನವಿರಲಿ."
  - *Tamil*: "தயவுசெய்து கவனமாக இருங்கள், சாலையில் கவனம் செலுத்துங்கள்."
  - *Telugu*: "దయచేసి అప్రమత్తంగా ఉండండి, రోడ్డుపై దృష్టి పెట్టండి."
  - *Marathi*: "कृपया लक्ष द्या, रस्त्याकडे पहा."
  - *English*: "Attention! Please stay alert and focus on the road."
- **Level 2 (Microsleep Detected)**:
  - Maximum audio stream override with loud horn/siren sound.
  - Continuous tactile vibration pattern `[500ms on, 500ms off]`.
  - Massive high-contrast "I AM AWAKE" button appears on screen.
- **Cloud Telemetry**:
  Non-blocking async Firestore write to `fatigue_events`:
  ```json
  {
    "driver_id": "+919886011204",
    "vehicle_id": "KA 01 AB 1234",
    "fleet_id": "FLT-9021",
    "timestamp": "2026-10-22T21:50:00Z",
    "alert_type": "LEVEL_2_MICROSLEEP",
    "speed_kmh": 64.2,
    "latitude": 12.9716,
    "longitude": 77.5946,
    "ear_score": 0.14
  }
  ```

---

## 📁 Clean Project Structure

```
c:/Jaagrat_Manoj_Adithi/
├── pubspec.yaml                          # Core dependencies (camera, mlkit, sensors, etc.)
├── analysis_options.yaml                 # Strict linter configuration
├── android/
│   └── app/src/main/AndroidManifest.xml  # Foreground services, camera, wakelock, GPS permissions
├── assets/
│   └── audio/                            # Emergency siren and warning chime
├── lib/
│   ├── main.dart                         # Entrypoint & MultiProvider setup
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart           # OLED #000000, #121212, and high-contrast tokens
│   │   │   ├── app_constants.dart        # 1.2s microsleep, 15 FPS, 1.8G shock, 10 km/h gates
│   │   │   └── app_strings.dart          # Regional phrases & localizations
│   │   ├── theme/
│   │   │   └── app_theme.dart            # Tactile dark theme with 20px card radii & 64px touch targets
│   │   ├── models/
│   │   │   ├── driver_profile.dart       # Phone, vehicle, fleet, language state
│   │   │   ├── fatigue_event.dart        # Firestore telemetry model
│   │   │   └── calibration_data.dart     # Dynamic EAR baseline calibration
│   │   └── services/
│   │       ├── storage_service.dart      # SharedPreferences persistence
│   │       ├── audio_alert_service.dart  # Level 1 Chime + TTS, Level 2 siren override
│   │       ├── vibration_service.dart    # 500ms on / 500ms off emergency pulse
│   │       ├── sensor_guard_service.dart # GPS Speed & Accelerometer Shock gates
│   │       ├── telemetry_service.dart    # Non-blocking Firestore push
│   │       └── driver_monitor_service.dart # 15 FPS on-device FaceMesh EAR & PERCLOS engine
│   └── ui/
│       ├── widgets/
│       │   ├── primary_button.dart       # >64px massive driver-friendly touch button
│       │   ├── status_pill.dart          # Top HUD status pill with glowing dot
│       │   ├── language_card.dart        # Tactile card with native Indian scripts
│       │   ├── calibration_overlay.dart  # CustomPainter face alignment oval
│       │   ├── alert_modal_overlay.dart  # Pulsing "I AM AWAKE" dismiss button
│       │   └── long_press_button.dart    # 2-second hold-to-end-trip progress button
│       └── screens/
│           ├── screen_language.dart      # Language selection grid
│           ├── screen_auth.dart          # Firebase Phone OTP login
│           ├── screen_vehicle_setup.dart # Vehicle & fleet code configuration
│           ├── screen_calibration.dart   # Camera alignment & resting EAR lock
│           └── screen_active_drive.dart  # Pure #000000 OLED HUD with emergency button
└── README.md
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   flutter pub get
   ```

2. **Add Firebase Credentials**:
   Place your `google-services.json` inside `android/app/`.

3. **Run on Connected Android Device**:
   ```bash
   flutter run -d <device_id>
   ```

Built with ❤️ for Indian commercial drivers.
