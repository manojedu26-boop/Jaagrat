# Jaagrat (जाग्रत) — Aankh Khuli, Safar Safe

> **A smartphone-based driver drowsiness & fatigue alert system for Indian commercial fleets.**
> Turn any Android smartphone mounted on a dashboard into an intelligent driver drowsiness monitor that warns the driver before they fall asleep and alerts the fleet owner when critical microsleeps occur.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: FlutterFlow + Flutter](https://img.shields.io/badge/Stack-FlutterFlow%20%7C%20Flutter-blue)](https://flutterflow.io)
[![Backend: Firebase](https://img.shields.io/badge/Backend-Firebase%20Firestore-orange)](https://firebase.google.com)

---

## 🎯 The Core Philosophy: "Low-Code Core + Micro-Engine"

Pure no-code tools (Bubble, Adalo) cannot process local camera frames at 15 FPS without severe lag, thermal throttling, or expensive cloud costs. **Jaagrat** solves this with a hybrid model:

* **Visual App Shell (FlutterFlow):** Drag-and-drop UI for authentication, trip start/stop, vehicle number setup, language picker (6 Indian languages), and OLED-dimmed drive screens.
* **Micro-Engine (Custom Flutter Widget):** A single plug-and-play widget (`DriverMonitorWidget.dart`) running on-device MediaPipe Face Landmarker inference at 15 FPS.
* **Privacy By Design:** **Video never leaves the phone.** Only 1 KB event payloads sync to the cloud on alert triggers.
* **Fleet Owner Console:** 100% No-Code web console (Retool or FlutterFlow Web) backed by Firebase Firestore for real-time fleet map pins, driver fatigue trends, and automated SMS alerts.

---

## 🏗️ System Architecture

```
[Driver Phone: Dashboard Mount]
   │
   ├─► Front Camera (Low Res 480p @ 15 FPS)
   │     │
   │     ▼
   │  MediaPipe Task (On-Device Inference)
   │     │ (Blink, JawOpen, HeadPitch Blendshapes)
   │     ▼
   │  Filtering Pipeline:
   │     ├─ GPS Speed Check (> 10 km/h arming guard)
   │     ├─ Accelerometer Shock Filter (Suppress 600ms if > 1.8G pothole)
   │     └─ Rolling PERCLOS Calculator (60s buffer)
   │
   ├── Alert Engine (Local Cab)
   │     ├─ Level 1: Soft chime + Regional Voice ("कृपया ध्यान दें")
   │     ├─ Level 2: Max volume siren + Vibration loop ("I'M AWAKE" button)
   │     └─ Level 3: Emergency Escalation (Firestore Doc Write)
   │
   └─► Firebase Firestore (Syncs only event payloads: 1KB/event)
         │
         ▼
[Owner Web Dashboard (Retool / FlutterFlow Web)]
   │
   ├─ Realtime Map Pin & Status (Active, Warning, Critical)
   ├─ Cloud Functions Trigger -> Fast2SMS / Twilio SMS Alert
   └─ Driver Fatigue Scorecards & Weekly Bonus Tracker
```

---

## 📁 Repository Structure

```
Jaagrat/
├── README.md                           # Project overview & quickstart
├── ARCHITECTURE.md                     # Deep technical architecture & equations
├── flutter_flow/
│   ├── custom_widgets/
│   │   ├── DriverMonitorWidget.dart    # Drop-in custom widget for FlutterFlow
│   │   └── README.md                   # How to install in FlutterFlow
│   └── assets/
│       └── audio/                      # Audio prompts for 6 Indian languages
├── firebase/
│   ├── firestore.rules                 # Multi-tenant security rules
│   └── functions/
│       ├── index.js                    # Level-3 SMS trigger function
│       └── package.json
└── docs/
    ├── PITCH_AND_BUSINESS_MODEL.md     # Market analysis, pricing, & DPDP Act compliance
    └── PILOT_GUIDE.md                  # 30-day free pilot deployment playbook
```

---

## 🚀 Quick Setup for FlutterFlow

1. Create a new FlutterFlow project.
2. In **Custom Code > Dependencies**, add:
   ```yaml
   camera: ^0.10.5+9
   audioplayers: ^6.0.0
   vibration: ^2.0.0
   geolocator: ^12.0.0
   sensors_plus: ^5.0.1
   cloud_firestore: ^5.0.2
   google_mlkit_face_mesh_detection: ^0.1.0
   ```
3. Copy `flutter_flow/custom_widgets/DriverMonitorWidget.dart` into a new Custom Widget called `DriverMonitorWidget`.
4. Place the widget on Screen 3 (Active Drive Mode).
5. Connect your Firebase project to enable event syncing and owner alerts.

---

## 🇮🇳 Engineered for Indian Road Conditions

1. **Pothole Shock Suppressor:** Accelerometer ignores camera movement for 600ms after hitting road bumps ($> 1.8G$).
2. **Speed Arming Guard:** Automatic standby when stopped or in bumper-to-bumper traffic ($< 10\text{ km/h}$).
3. **No Blinding Flash at Night:** Never flashes bright screens at night; uses piercing high-frequency audio + vibration pulses.
4. **Local Indian Languages:** Hindi, Kannada, Tamil, Telugu, Marathi, and English.
5. **Driver Bonus Model:** Framed as a safety bonus tool, not surveillance. Drivers earning ₹50-₹100 bonus per clean shift defend the app.

---

## 📜 License
MIT License. Built with ❤️ for Indian commercial drivers.
