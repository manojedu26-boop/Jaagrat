# Jaagrat Architecture: Low-Code Core + Micro-Engine Model

## 1. System Topology

```
┌────────────────────────────────────────────────────────┐
│                   DRIVER MOBILE NODE                   │
│  (Budget Android Smartphone mounted on dashboard)      │
│                                                        │
│  [Camera Stream 480p @ 15 FPS]                         │
│               │                                        │
│               ▼                                        │
│  [MediaPipe Face Landmarker / Edge Vision Engine]      │
│         ├── EyeBlinkLeft & EyeBlinkRight (EAR)         │
│         ├── JawOpen Blendshape (Yawn detection)        │
│         └── Head Pose Matrix (Pitch & Yaw)             │
│               │                                        │
│               ▼                                        │
│  [Hardware Defense Filters]                            │
│         ├── Accelerometer Shock Filter (>1.8G pothole) │
│         └── GPS Speed Arming Filter (>10 km/h)         │
│               │                                        │
│               ▼                                        │
│  [Fatigue Scoring Engine]                              │
│         ├── Microsleep Guard: >= 1.2s closed           │
│         ├── Rolling PERCLOS: 60s sliding window        │
│         └── Head Nod Drop: Pitch > 25° for 1.0s        │
│               │                                        │
│       ┌───────┴───────┐                                │
│       ▼               ▼                                │
│  [Local Audio/Haptic] [Firestore Event Writer]         │
│  (L1/L2 Alert Engine) (Syncs 1 KB JSON on escalation)  │
└───────────────────────┬────────────────────────────────┘
                        │ HTTPS (TLS 1.3)
                        ▼
┌────────────────────────────────────────────────────────┐
│               FIREBASE CLOUD BACKEND                   │
│                                                        │
│  [Cloud Firestore: fatigue_events]                     │
│               │ (Event Trigger)                        │
│               ▼                                        │
│  [Firebase Cloud Functions]                            │
│               │ (AlertLevel == 3)                      │
│               ▼                                        │
│  [SMS Gateway: Fast2SMS / Twilio API]                  │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│               FLEET OWNER CONSOLE                      │
│  (No-Code Web App via Retool / FlutterFlow Web)        │
│                                                        │
│  ├── Live Map (Google Maps Pin: Green / Amber / Red)   │
│  ├── Real-time Trip & Fatigue Incident Log             │
│  └── Driver Safety Scorecard & Bonus Computation       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Mathematical Formulations & Thresholds

### 1. Eye Aspect Ratio (EAR) & Blink Extraction
Given landmark coordinates for the eye corners $(p_1, p_4)$ and vertical eyelid landmarks $(p_2, p_6)$ and $(p_3, p_5)$:
$$EAR = \frac{\|p_2 - p_6\| + \|p_3 - p_5\|}{2 \|p_1 - p_4\|}$$

* Baseline Normal: $EAR_0 \approx 0.28 - 0.35$
* Eye Closure Threshold: $EAR < 0.20$ (or MediaPipe Blendshape `eyeBlink > 0.65`)
* **Microsleep Detection:** If $EAR < 0.20$ continuously for $N_{frames} \ge 18$ frames ($1.2\text{ seconds}$ at $15\text{ FPS}$), an immediate **Level 2 Emergency Alarm** triggers.

### 2. Rolling PERCLOS (Percentage of Eye Closure)
PERCLOS measures the proportion of time the driver's eyes are at least $80\%$ closed over a moving window of $T = 60\text{ seconds}$ ($W = 900\text{ frames}$ at $15\text{ FPS}$):
$$\text{PERCLOS} = \frac{1}{W} \sum_{i=1}^{W} \mathbb{I}(EAR_i < 0.20)$$

* Normal Alert Driver: $\text{PERCLOS} < 0.08$ ($< 8\%$)
* **Drowsiness Warning Trigger:** $\text{PERCLOS} \ge 0.20$ ($20\%$ eye closure over 60 seconds) triggers a **Level 1 Regional Audio Prompt**.

### 3. Head Nod / Pitch Angle
From the 3D landmark rotation matrix, head pitch $\theta_p$ is computed.
* Normal Forward Gaze: $\theta_p \in [-10^\circ, +10^\circ]$
* **Head Drop Trigger:** $\theta_p < -25^\circ$ (chin dropping to chest) for $> 1.0\text{ second}$ ($15\text{ frames}$) triggers a **Level 2 Emergency Alarm**.

### 4. Road Shock Filter (Pothole Suppressor)
Using the phone's 3-axis accelerometer $(a_x, a_y, a_z)$:
$$\|a_{\text{shock}}\| = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
If $\|a_{\text{shock}}\| > 18.0\text{ m/s}^2$ ($> 1.83G$):
* Set state `shockSuppression = true` for $600\text{ ms}$.
* All facial landmark variations during this window are discarded.

---

## 3. Sensor & Hardware Management on Budget Devices

1. **Thermal Regulation:** Budget devices (Redmi 9/10, Realme C-series, Samsung M-series) heat up when running continuous neural networks while charging on sunny dashboards.
   * Target frame rate: $15\text{ FPS}$ (processes 1 in every 2 camera frames).
   * Thermal fallback: If battery temperature $> 43^\circ\text{C}$, auto-throttle to $10\text{ FPS}$ with zero loss of microsleep accuracy.
2. **Foreground Service Exemption:** In `AndroidManifest.xml`:
   * `<service android:name="..." android:foregroundServiceType="camera|location" />`
   * Displays persistent notification: *"Jaagrat Safety Shield Active"*.
3. **No Blinding Flash:** Screen remains pure pitch black (`#000000`). Night alarms rely exclusively on high-pitched audio sirens ($1.5\text{ kHz}$) and alternating haptic vibration loops.
