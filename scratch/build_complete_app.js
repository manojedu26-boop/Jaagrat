const fs = require('fs');
const path = require('path');

// Extract i18n from scratch/build_full_app.js
const fullAppContent = fs.readFileSync(path.join(__dirname, 'build_full_app.js'), 'utf8');
const i18nMatch = fullAppContent.match(/const i18n = \{[\s\S]*?\n    \};\n/);
if (!i18nMatch) {
  console.error('Could not extract i18n');
  process.exit(1);
}
const i18nCode = i18nMatch[0];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Jaagrat (जाग्रत) — Commercial Driver Fatigue Detection & Fleet Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&family=Noto+Sans+Kannada:wght@500;700;800&family=Noto+Sans+Tamil:wght@500;700;800&family=Noto+Sans+Telugu:wght@500;700;800&family=Noto+Sans+Devanagari:wght@500;700;800&family=Noto+Sans+Bengali:wght@500;700;800&family=Noto+Sans+Gujarati:wght@500;700;800&family=Noto+Sans+Malayalam:wght@500;700;800&family=Noto+Sans+Gurmukhi:wght@500;700;800&family=Noto+Sans+Oriya:wght@500;700;800&display=swap" rel="stylesheet">

  <!-- Google MediaPipe Face Mesh & Camera Utils CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossorigin="anonymous"></script>

  <style>
    :root {
      --bg-canvas: #F8FAFC;
      --bg-white: #FFFFFF;
      --surface-card: #FFFFFF;
      --surface-muted: #F1F5F9;
      --border-light: #E2E8F0;
      --border-focus: #CBD5E1;
      
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-subtle: #94A3B8;
      
      --safety-orange: #EA580C;
      --safety-orange-hover: #C2410C;
      --safety-orange-light: #FFF7ED;
      
      --alert-red: #DC2626;
      --alert-red-dark: #991B1B;
      --alert-red-light: #FEF2F2;
      --alert-red-border: #FCA5A5;
      
      --status-green: #16A34A;
      --status-green-light: #F0FDF4;
      --status-amber: #D97706;
      --status-amber-light: #FEF3C7;
      
      --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06);
      --shadow-md: 0 4px 16px rgba(15, 23, 42, 0.08);
      --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.12);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', 'Noto Sans Kannada', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Bengali', 'Noto Sans Gujarati', 'Noto Sans Malayalam', 'Noto Sans Gurmukhi', 'Noto Sans Oriya', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: var(--bg-canvas);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }

    /* Top Navigation Bar */
    .top-nav {
      width: 100%;
      max-width: 1200px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 16px;
      padding: 10px 18px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-sm);
      flex-wrap: wrap;
      gap: 12px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-badge {
      background: var(--safety-orange);
      color: white;
      font-weight: 900;
      font-size: 18px;
      padding: 6px 12px;
      border-radius: 10px;
      letter-spacing: -0.5px;
    }

    .brand-meta h1 {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.3px;
    }

    .brand-meta p {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* PORTAL SWITCHER BUTTONS (Driver Cockpit vs Fleet Owner Portal) */
    .portal-nav-toggle {
      display: flex;
      background: var(--surface-muted);
      padding: 3px;
      border-radius: 12px;
      border: 1px solid var(--border-light);
    }

    .portal-tab-btn {
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 800;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .portal-tab-btn.active {
      background: var(--bg-white);
      color: var(--text-main);
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    .portal-tab-btn:hover:not(.active) {
      color: var(--text-main);
    }

    .fleet-live-badge {
      background: var(--safety-orange);
      color: white;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--status-green-light);
      color: var(--status-green);
      border: 1px solid #BBF7D0;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .badge-pill::before {
      content: "";
      width: 8px;
      height: 8px;
      background: var(--status-green);
      border-radius: 50%;
      animation: blink-dot 1.5s infinite;
    }

    /* SECTIONS */
    #driverCockpitSection {
      width: 100%;
      max-width: 1200px;
      display: grid;
      grid-template-columns: 410px 1fr;
      gap: 24px;
      align-items: start;
    }

    #fleetOwnerSection {
      width: 100%;
      max-width: 1200px;
      display: none;
      flex-direction: column;
      gap: 20px;
    }

    @media (max-width: 960px) {
      #driverCockpitSection {
        grid-template-columns: 1fr;
        justify-items: center;
      }
    }

    /* Mobile Phone Shell */
    .phone-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 390px;
    }

    .phone-frame {
      width: 100%;
      max-width: 390px;
      height: 830px;
      background: #FFFFFF;
      border: 10px solid #0F172A;
      border-radius: 46px;
      box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .phone-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 130px;
      height: 24px;
      background: #0F172A;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .phone-speaker {
      width: 42px;
      height: 4px;
      background: #334155;
      border-radius: 2px;
    }

    /* SMS Push Toast */
    .sms-toast {
      position: absolute;
      top: 26px;
      left: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      color: white;
      border-radius: 14px;
      padding: 10px 12px;
      z-index: 150;
      display: none;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      border: 1px solid rgba(255, 255, 255, 0.15);
      animation: toastDrop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes toastDrop {
      from { transform: translateY(-30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .sms-icon {
      width: 34px;
      height: 34px;
      background: var(--safety-orange);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .app-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 28px 16px 16px 16px;
      background: #FFFFFF;
      overflow-y: auto;
      position: relative;
    }

    /* 1. SPLASH SCREEN */
    .splash-view {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0F172A;
      z-index: 90;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      text-align: center;
      color: white;
    }

    .splash-badge-hindi {
      background: var(--safety-orange);
      color: white;
      font-size: 20px;
      font-weight: 900;
      padding: 8px 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      letter-spacing: 1px;
      box-shadow: 0 8px 24px rgba(234, 88, 12, 0.4);
      animation: splashScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes splashScale {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .animated-letters {
      display: flex;
      gap: 6px;
      margin-bottom: 14px;
    }

    .animated-letters .char {
      font-size: 34px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 2px;
      opacity: 0;
      transform: translateY(24px) scale(0.8);
      animation: letterPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes letterPop {
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .splash-tagline {
      font-size: 13px;
      font-weight: 600;
      color: #94A3B8;
      line-height: 1.4;
      margin-bottom: 32px;
      max-width: 260px;
    }

    .splash-loader-bar {
      width: 140px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .splash-loader-fill {
      width: 0%;
      height: 100%;
      background: var(--safety-orange);
      border-radius: 2px;
      animation: fillBar 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    }

    @keyframes fillBar {
      to { width: 100%; }
    }

    .btn-splash-skip {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #CBD5E1;
      padding: 8px 18px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-splash-skip:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }

    /* 2. DEDICATED LANGUAGE SELECTION SCREEN (12 LANGUAGES) */
    .lang-screen-view {
      display: none;
      flex-direction: column;
      height: 100%;
      padding-top: 4px;
    }

    .lang-screen-header {
      text-align: center;
      margin-bottom: 12px;
    }

    .lang-screen-title {
      font-size: 20px;
      font-weight: 900;
      color: var(--text-main);
      letter-spacing: -0.4px;
    }

    .lang-screen-sub {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .lang-grid-12 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      overflow-y: auto;
      max-height: 520px;
      padding-right: 2px;
      margin-bottom: 12px;
    }

    .lang-card-item {
      background: var(--surface-muted);
      border: 1.5px solid var(--border-light);
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
    }

    .lang-card-item:hover {
      border-color: var(--safety-orange);
      background: var(--safety-orange-light);
      transform: translateY(-1px);
    }

    .lang-card-item.active {
      border-color: var(--safety-orange);
      background: #FFF7ED;
      box-shadow: 0 2px 8px rgba(234, 88, 12, 0.15);
    }

    .lang-native-name {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .lang-english-name {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .lang-check-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--safety-orange);
      color: white;
      font-size: 9px;
      display: none;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .lang-card-item.active .lang-check-icon {
      display: flex;
    }

    /* 3. DRIVER ONBOARDING & REAL-WORLD OTP */
    .login-view {
      display: none;
      flex-direction: column;
      gap: 12px;
      padding-top: 6px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 4px;
    }

    .login-title {
      font-size: 21px;
      font-weight: 900;
      color: var(--text-main);
      letter-spacing: -0.5px;
    }

    .login-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input {
      width: 100%;
      background: var(--surface-muted);
      border: 1.5px solid var(--border-light);
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      outline: none;
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      border-color: var(--safety-orange);
      background: #FFFFFF;
    }

    .otp-row {
      display: flex;
      gap: 8px;
      justify-content: space-between;
      align-items: center;
    }

    .otp-box {
      flex: 1;
      min-width: 0;
      max-width: 58px;
      text-align: center;
      font-size: 17px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      padding: 9px 0;
      border: 1.5px solid var(--border-light);
      border-radius: 10px;
      background: var(--surface-muted);
      color: var(--text-main);
    }

    .btn-send-otp {
      background: var(--surface-muted);
      border: 1.5px solid var(--border-light);
      color: var(--text-main);
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 800;
      border-radius: 10px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .btn-send-otp:hover {
      border-color: var(--safety-orange);
      color: var(--safety-orange);
      background: #FFF7ED;
    }

    .otp-verified-badge {
      font-size: 11px;
      font-weight: 700;
      color: var(--status-green);
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }

    /* 4. ACTIVE DRIVE VIEW */
    .drive-view {
      display: none;
      flex-direction: column;
      height: 100%;
    }

    .driver-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 8px;
    }

    .driver-id-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .vehicle-tag {
      font-size: 12px;
      font-weight: 800;
      color: var(--text-main);
      background: var(--surface-muted);
      border: 1px solid var(--border-light);
      padding: 3px 8px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .driver-name-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }

    /* SPEEDOMETER PILL */
    .speed-status-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      font-family: 'JetBrains Mono', monospace;
    }

    .speed-status-pill.armed {
      background: #EFF6FF;
      color: #1D4ED8;
      border-color: #BFDBFE;
    }

    .speed-status-pill.standby {
      background: var(--surface-muted);
      color: var(--text-muted);
      border-color: var(--border-light);
    }

    .camera-card {
      width: 100%;
      height: 480px;
      background: #020617;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.8);
      margin-bottom: 10px;
    }

    .camera-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
    }

    .mesh-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: scaleX(-1);
      pointer-events: none;
    }

    .camera-fallback-graphic {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #64748B;
      text-align: center;
      padding: 24px;
    }

    .cam-hud-top {
      position: absolute;
      top: 10px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      pointer-events: none;
    }

    .cv-badge {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      background: #22C55E;
      border-radius: 50%;
      box-shadow: 0 0 6px #22C55E;
    }

    .cam-btn-expand {
      pointer-events: auto;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .face-bracket-box {
      position: absolute;
      width: 180px;
      height: 230px;
      pointer-events: none;
      transition: all 0.2s ease;
      opacity: 0.85;
    }

    .bracket {
      position: absolute;
      width: 18px;
      height: 18px;
      border-color: rgba(255, 255, 255, 0.5);
      border-style: solid;
      border-width: 0;
      transition: border-color 0.2s ease;
    }

    .bracket-tl { top: 0; left: 0; border-top-width: 2.5px; border-left-width: 2.5px; border-top-left-radius: 8px; }
    .bracket-tr { top: 0; right: 0; border-top-width: 2.5px; border-right-width: 2.5px; border-top-right-radius: 8px; }
    .bracket-bl { bottom: 0; left: 0; border-bottom-width: 2.5px; border-left-width: 2.5px; border-bottom-left-radius: 8px; }
    .bracket-br { bottom: 0; right: 0; border-bottom-width: 2.5px; border-right-width: 2.5px; border-bottom-right-radius: 8px; }

    .face-bracket-box.tracking .bracket {
      border-color: rgba(34, 197, 94, 0.8);
    }

    .face-bracket-box.yawning .bracket {
      border-color: rgba(245, 158, 11, 0.9);
    }

    .face-bracket-box.alarm .bracket {
      border-color: rgba(239, 68, 68, 1);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
    }

    /* Driver Status Card */
    .driver-status-card {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 10px 14px;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }

    .status-orb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #22C55E;
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
      flex-shrink: 0;
      transition: background 0.2s, box-shadow 0.2s;
    }

    .driver-status-card.state-yawn .status-orb {
      background: #F59E0B;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);
    }

    .driver-status-card.state-drowsy .status-orb {
      background: #EF4444;
      box-shadow: 0 0 14px rgba(239, 68, 68, 1);
      animation: blink-dot 0.5s infinite;
    }

    .status-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .status-title {
      font-size: 13px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.2px;
    }

    .status-sub {
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .closure-line-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 4px;
    }

    .closure-line-fill {
      height: 100%;
      width: 0%;
      background: var(--safety-orange);
      border-radius: 2px;
      transition: width 0.08s linear, background-color 0.2s ease;
    }

    /* Bottom Driver Action Buttons */
    .driver-actions {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-top: auto;
    }

    .btn-primary {
      width: 100%;
      background: var(--safety-orange);
      color: white;
      border: none;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.22);
      transition: background 0.15s ease;
    }

    .btn-primary:hover {
      background: var(--safety-orange-hover);
    }

    .btn-primary.btn-active-cam {
      background: #0F172A;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }

    .btn-outline {
      width: 100%;
      background: var(--bg-white);
      color: var(--text-main);
      border: 1px solid var(--border-light);
      padding: 9px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .btn-outline:hover {
      background: var(--surface-muted);
    }

    .btn-end-shift {
      width: 100%;
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
      color: var(--alert-red-dark);
      border: 1.5px solid #F87171;
      padding: 11px 16px;
      font-size: 13px;
      font-weight: 800;
      border-radius: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.12);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-end-shift:hover {
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
      border-color: #EF4444;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.22);
    }

    /* Emergency Alert Modal (Level 2) */
    .alert-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(220, 38, 38, 0.96);
      z-index: 200;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 70px 24px 36px 24px;
      text-align: center;
      color: white;
      animation: alert-flash 0.4s infinite alternate;
    }

    @keyframes alert-flash {
      from { background: rgba(220, 38, 38, 0.96); }
      to { background: rgba(153, 27, 27, 0.99); }
    }

    .alert-modal-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .alert-bell-icon {
      width: 80px;
      height: 80px;
      background: white;
      color: #DC2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      animation: bell-bounce 0.4s infinite alternate;
    }

    @keyframes bell-bounce {
      from { transform: scale(1) rotate(-8deg); }
      to { transform: scale(1.1) rotate(8deg); }
    }

    .alert-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }

    .alert-subtitle {
      font-size: 13px;
      font-weight: 600;
      opacity: 0.94;
      max-width: 290px;
      line-height: 1.4;
    }

    .btn-i-am-awake {
      width: 100%;
      background: #FFFFFF;
      color: #DC2626;
      border: 3px solid #FFFFFF;
      padding: 18px 24px;
      font-size: 19px;
      font-weight: 900;
      border-radius: 18px;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(0,0,0,0.3);
      letter-spacing: 0.5px;
      transition: transform 0.1s ease;
    }

    .btn-i-am-awake:active {
      transform: scale(0.96);
    }

    /* 5. SHIFT SUMMARY VIEW */
    .summary-view {
      display: none;
      flex-direction: column;
      gap: 14px;
      padding-top: 8px;
    }

    .score-circle-card {
      background: var(--surface-muted);
      border: 1px solid var(--border-light);
      border-radius: 16px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
    }

    .score-number {
      font-size: 48px;
      font-weight: 900;
      color: var(--status-green);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }

    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      background: var(--status-green-light);
      color: var(--status-green);
      font-size: 12px;
      font-weight: 800;
      border-radius: 20px;
      border: 1px solid #BBF7D0;
    }

    /* Right Side Telemetry & Presentation Inspector */
    .control-panel {
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .panel-section-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 8px;
    }

    .speed-demo-box {
      background: var(--surface-muted);
      border: 1.5px dashed var(--border-light);
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .speed-btn-toggle {
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      color: var(--text-main);
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .speed-btn-toggle:hover {
      border-color: var(--safety-orange);
      color: var(--safety-orange);
    }

    .btn-grid-sim {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-sim-alert {
      background: var(--surface-muted);
      border: 1px solid var(--border-light);
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.15s ease;
    }

    .btn-sim-alert:hover {
      border-color: var(--safety-orange);
      background: #FFF7ED;
    }

    .live-stream-log {
      background: #0F172A;
      color: #94A3B8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 12px;
      border-radius: 12px;
      height: 140px;
      overflow-y: auto;
      line-height: 1.6;
    }

    .log-entry {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 2px;
      margin-bottom: 2px;
    }

    /* ======================================================== */
    /* ENTERPRISE FLEET OWNER PORTAL STYLING                     */
    /* ======================================================== */
    .fleet-portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 18px;
      padding: 18px 24px;
      box-shadow: var(--shadow-sm);
    }

    .fleet-title-group h2 {
      font-size: 20px;
      font-weight: 900;
      color: var(--text-main);
      letter-spacing: -0.4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fleet-title-group p {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .fleet-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .kpi-card {
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 16px;
      padding: 16px 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      overflow: hidden;
    }

    .kpi-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 900;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.1;
    }

    .kpi-trend {
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .kpi-card.critical {
      border-color: #FCA5A5;
      background: linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%);
    }

    .kpi-card.critical .kpi-value {
      color: var(--alert-red);
    }

    /* Live GPS Map Container */
    .fleet-map-card {
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 20px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .map-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .map-svg-viewport {
      width: 100%;
      height: 380px;
      background: #0B1329;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
    }

    .fleet-map-svg {
      width: 100%;
      height: 100%;
    }

    /* Table of Fleet Vehicles */
    .fleet-table-card {
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 20px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow-x: auto;
    }

    .fleet-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      min-width: 800px;
    }

    .fleet-table th {
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid var(--border-light);
      background: var(--surface-muted);
    }

    .fleet-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
      color: var(--text-main);
    }

    .fleet-table tr:hover td {
      background: #F8FAFC;
    }

    .fleet-table tr.critical-row td {
      background: #FEF2F2 !important;
    }

    .vehicle-badge-pill {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 6px;
      background: var(--surface-muted);
      border: 1px solid var(--border-light);
      display: inline-block;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .status-chip.chip-safe {
      background: var(--status-green-light);
      color: var(--status-green);
      border: 1px solid #BBF7D0;
    }

    .status-chip.chip-warning {
      background: var(--status-amber-light);
      color: var(--status-amber);
      border: 1px solid #FDE68A;
    }

    .status-chip.chip-danger {
      background: #FEF2F2;
      color: var(--alert-red);
      border: 1px solid #FCA5A5;
      animation: alert-flash 0.8s infinite alternate;
    }

    .btn-action-sm {
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid var(--border-light);
      background: var(--bg-white);
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
    }

    .btn-action-sm:hover {
      border-color: var(--safety-orange);
      color: var(--safety-orange);
    }

    .btn-action-sm.danger {
      background: #FEF2F2;
      color: var(--alert-red);
      border-color: #FCA5A5;
    }

    .btn-action-sm.danger:hover {
      background: var(--alert-red);
      color: white;
    }

    /* Emergency Dispatch Floating Toast in Fleet Portal */
    .dispatch-alert-banner {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      color: white;
      border-radius: 14px;
      padding: 12px 18px;
      display: none;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4);
      animation: bannerSlide 0.3s ease;
    }

    @keyframes bannerSlide {
      from { transform: translateY(-15px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes blink-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  </style>
</head>
<body>

  <!-- Top Global Header -->
  <header class="top-nav">
    <div class="brand-group">
      <div class="brand-badge">जाग्रत</div>
      <div class="brand-meta">
        <h1>Jaagrat Driver Fatigue Guard</h1>
        <p>Commercial Fleet Safety System — 12 Native Indian Languages & Fleet Owner Portal</p>
      </div>
    </div>
    
    <div class="nav-actions">
      <!-- PORTAL MODE SWITCHER -->
      <div class="portal-nav-toggle">
        <button class="portal-tab-btn active" id="tabDriverCockpit" onclick="switchMainPortal('driver')">
          <span>📱 Driver Cockpit HUD</span>
        </button>
        <button class="portal-tab-btn" id="tabFleetOwner" onclick="switchMainPortal('fleet')">
          <span>🏢 Fleet Owner Portal</span>
          <span class="fleet-live-badge" id="fleetNavBadge">8 LIVE</span>
        </button>
      </div>

      <div class="badge-pill" id="globalStatusPill">Live Web Vision Active</div>
    </div>
  </header>

  <!-- ======================================================== -->
  <!-- 1. DRIVER COCKPIT SECTION                                -->
  <!-- ======================================================== -->
  <main id="driverCockpitSection">

    <!-- Phone Hardware Frame -->
    <div class="phone-wrapper">
      <div class="phone-frame">
        <div class="phone-notch">
          <div class="phone-speaker"></div>
        </div>

        <!-- SMS Toast Push Notification Simulation -->
        <div class="sms-toast" id="smsToast">
          <div class="sms-icon">💬</div>
          <div style="flex:1;">
            <div style="font-size:11px; font-weight:800; color:#CBD5E1;">SMS • JAAGRAT FLEET</div>
            <div style="font-size:12px; font-weight:700; color:#FFFFFF;">Your verification OTP is <strong style="color:var(--safety-orange);">8429</strong>. Valid for 10 mins.</div>
          </div>
        </div>

        <!-- Phone Internal Screen -->
        <div class="app-screen" id="appScreen">
          
          <!-- SCREEN 1: ANIMATED SPLASH SCREEN -->
          <div class="splash-view" id="viewSplash" onclick="skipSplash()">
            <div class="splash-badge-hindi">जाग्रत</div>
            <div class="animated-letters">
              <span class="char" style="animation-delay: 0.1s;">J</span>
              <span class="char" style="animation-delay: 0.2s;">A</span>
              <span class="char" style="animation-delay: 0.3s;">A</span>
              <span class="char" style="animation-delay: 0.4s;">G</span>
              <span class="char" style="animation-delay: 0.5s;">R</span>
              <span class="char" style="animation-delay: 0.6s;">A</span>
              <span class="char" style="animation-delay: 0.7s;">T</span>
            </div>
            <div class="splash-tagline">
              Commercial Driver Safety & Fatigue Guard<br>
              <span style="color:#64748B; font-size:11px;">Zero-Video Cloud Streaming • 100% On-Device AI</span>
            </div>
            <div class="splash-loader-bar">
              <div class="splash-loader-fill"></div>
            </div>
            <button class="btn-splash-skip" onclick="skipSplash()">Tap to Continue &rarr;</button>
          </div>

          <!-- SCREEN 2: DEDICATED LANGUAGE PICKER (12 INDIAN LANGUAGES) -->
          <div class="lang-screen-view" id="viewLanguage">
            <div class="lang-screen-header">
              <div style="font-size:22px; font-weight:900; color:var(--safety-orange); margin-bottom:2px;">जाग्रत</div>
              <div class="lang-screen-title" id="t_chooseLangTitle">Choose Your Language</div>
              <div class="lang-screen-sub" id="t_chooseLangSub">Select preferred language for voice and alerts</div>
            </div>

            <!-- 12 Indian Languages Grid -->
            <div class="lang-grid-12">
              <div class="lang-card-item active" onclick="selectLang('en')">
                <span class="lang-native-name">English</span>
                <span class="lang-english-name">English</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('hi')">
                <span class="lang-native-name">हिन्दी</span>
                <span class="lang-english-name">Hindi</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('kn')">
                <span class="lang-native-name">ಕನ್ನಡ</span>
                <span class="lang-english-name">Kannada</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('ta')">
                <span class="lang-native-name">தமிழ்</span>
                <span class="lang-english-name">Tamil</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('te')">
                <span class="lang-native-name">తెలుగు</span>
                <span class="lang-english-name">Telugu</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('mr')">
                <span class="lang-native-name">मराठी</span>
                <span class="lang-english-name">Marathi</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('bn')">
                <span class="lang-native-name">বাংলা</span>
                <span class="lang-english-name">Bengali</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('gu')">
                <span class="lang-native-name">ગુજરાતી</span>
                <span class="lang-english-name">Gujarati</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('ml')">
                <span class="lang-native-name">മലയാളം</span>
                <span class="lang-english-name">Malayalam</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('pa')">
                <span class="lang-native-name">ਪੰਜਾਬੀ</span>
                <span class="lang-english-name">Punjabi</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('or')">
                <span class="lang-native-name">ଓଡ଼ିଆ</span>
                <span class="lang-english-name">Odia</span>
                <span class="lang-check-icon">✓</span>
              </div>
              <div class="lang-card-item" onclick="selectLang('as')">
                <span class="lang-native-name">অসমীয়া</span>
                <span class="lang-english-name">Assamese</span>
                <span class="lang-check-icon">✓</span>
              </div>
            </div>

            <button class="btn-primary" style="margin-top:auto;" onclick="proceedToDriverDetails()">
              <span id="t_btnContinueLang">Continue / ಮುಂದುವರಿಸಿ &rarr;</span>
            </button>
          </div>

          <!-- SCREEN 3: DRIVER ONBOARDING & REAL-WORLD OTP (STEP 2) -->
          <div class="login-view" id="viewLogin">
            <div class="login-header">
              <div style="font-size:22px; font-weight:900; color:var(--safety-orange); margin-bottom:2px;">जाग्रत</div>
              <div class="login-title" id="t_driverOnboarding">Driver Onboarding</div>
              <div class="login-subtitle" id="t_fleetAuth">Commercial Fleet Shift Authentication</div>
            </div>

            <div class="form-group">
              <label class="form-label" id="t_driverName">Driver Full Name</label>
              <input type="text" class="form-input" id="inputDriverName" value="Ramesh Kumar" placeholder="Enter driver name">
            </div>

            <div class="form-group">
              <label class="form-label" id="t_depot">Depot / Operating Location</label>
              <input type="text" class="form-input" id="inputDepot" value="Bengaluru Central Depot" placeholder="Enter depot location">
            </div>

            <div class="form-group">
              <label class="form-label" id="t_mobile">Mobile Number (Truck / Cab Driver)</label>
              <div style="display:flex; gap:8px;">
                <input type="tel" class="form-input" id="inputMobile" value="+91 98765 43210" placeholder="+91 XXXXX XXXXX">
                <button class="btn-send-otp" id="btnSendOtp" onclick="sendRealOtp()">Send OTP</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" id="t_otp">One-Time Password (OTP)</label>
              <div class="otp-row">
                <input type="text" class="otp-box" id="otp1" value="8" maxlength="1">
                <input type="text" class="otp-box" id="otp2" value="4" maxlength="1">
                <input type="text" class="otp-box" id="otp3" value="2" maxlength="1">
                <input type="text" class="otp-box" id="otp4" value="9" maxlength="1">
              </div>
              <div class="otp-verified-badge" id="otpVerifiedBadge">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                <span id="t_otpVerified">OTP Verified Successfully</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" id="t_vehicleReg">Vehicle Registration Number</label>
              <input type="text" class="form-input" id="inputVehicle" value="KA-01-AB-1234" placeholder="e.g. KA-01-AB-1234" style="font-family:'JetBrains Mono'; text-transform:uppercase;">
            </div>

            <button class="btn-primary" style="margin-top:2px;" onclick="authenticateAndStartDrive()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span id="t_startDrive">Authenticate & Start Drive Shift</span>
            </button>
            <button class="btn-outline" style="border:none; padding:4px;" onclick="goToLanguageScreen()">
              <span>&larr; <span id="t_changeLangLink">Change Language</span></span>
            </button>
          </div>

          <!-- SCREEN 4: ACTIVE DRIVE VIEW -->
          <div class="drive-view" id="viewActiveDrive">
            <div class="driver-header">
              <div class="driver-id-group">
                <span class="vehicle-tag" id="dispVehicleTag">KA-01-AB-1234</span>
                <span class="driver-name-tag" id="dispDriverTag">Ramesh K.</span>
              </div>
              
              <!-- REAL-TIME SPEEDOMETER PILL -->
              <div class="speed-status-pill armed" id="screenSpeedPill" onclick="toggleGpsModal()" title="Click to toggle GPS / Speed simulator">
                <span id="gpsDotIcon">🛰️</span>
                <span id="speedKmhText">42 km/h</span>
                <span style="opacity:0.6;">•</span>
                <span id="speedModeText">ARMED</span>
              </div>
            </div>

            <!-- Front Camera Card -->
            <div class="camera-card" id="cameraViewport">
              <video id="webcamElement" class="camera-video" autoplay playsinline muted style="display:none;"></video>
              <canvas id="meshCanvas" class="mesh-canvas" style="display:none;"></canvas>
              
              <div class="camera-fallback-graphic" id="cameraFallback">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <div style="font-size:14px; font-weight:800; color:#E2E8F0;" id="t_frontCamReady">Front Camera Ready</div>
                <div style="font-size:11px; color:#94A3B8; max-width:230px;" id="t_tapStartCam">Tap "Start AI Front Camera" below to initiate real-time facial landmark detection</div>
              </div>

              <!-- Overlaid Top Bar -->
              <div class="cam-hud-top">
                <div class="cv-badge">
                  <span class="live-dot" id="liveDot"></span>
                  <span id="cvFpsText">AI GUARD ACTIVE</span>
                </div>
                <button class="cam-btn-expand" onclick="toggleFullscreenCam()" title="Toggle Fullscreen Cam">
                  <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </button>
              </div>

              <!-- Subtle Corner Brackets -->
              <div class="face-bracket-box" id="faceBracketBox">
                <div class="bracket bracket-tl"></div>
                <div class="bracket bracket-tr"></div>
                <div class="bracket bracket-bl"></div>
                <div class="bracket bracket-br"></div>
              </div>

              <!-- CLEAN DRIVER STATUS CARD -->
              <div class="driver-status-card" id="driverStatusCard">
                <div class="status-orb" id="statusOrb"></div>
                <div class="status-info">
                  <div class="status-title" id="driverStatusTitle">Focused & Attentive</div>
                  <div class="status-sub">
                    <span id="driverStatusSubtitle">AI Fatigue Guard Active</span>
                    <span style="opacity:0.6;">•</span>
                    <span id="sessionIncidentsBadge">0 Incidents</span>
                  </div>
                  <!-- Closure line: fills smoothly in 1.2s for microsleep, 1.5s for head drop -->
                  <div class="closure-line-track">
                    <div class="closure-line-fill" id="closureLineFill"></div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Bottom Driver Action Controls -->
            <div class="driver-actions">
              <button class="btn-primary" id="btnToggleCam" onclick="toggleFrontCamera()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span id="btnToggleCamText">Start AI Front Camera</span>
              </button>
              <button class="btn-outline" onclick="triggerPotholeShock()">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span id="t_roadBump">Simulate Road Bump (650ms Cooldown)</span>
              </button>
              
              <!-- HIGH-IMPACT END SHIFT BUTTON -->
              <button class="btn-end-shift" onclick="showSummaryView()">
                <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path d="M4 4v16"/>
                </svg>
                <span id="t_endShift">🏁 End Shift & View Safety Scorecard</span>
              </button>
            </div>
          </div>

          <!-- SCREEN 5: SHIFT SAFETY SCORECARD -->
          <div class="summary-view" id="viewSummary">
            <div class="login-header">
              <div style="font-size:22px; font-weight:900; color:var(--safety-orange); margin-bottom:2px;">जाग्रत</div>
              <div class="login-title" id="t_shiftSummaryTitle">Shift Safety Scorecard</div>
              <div class="login-subtitle" id="dispSummaryShiftTime">Commercial Fleet AI Audit</div>
            </div>

            <div class="score-circle-card">
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;" id="t_overallScoreLabel">Overall Safety Score</div>
              <div class="score-number" id="summaryScoreValue">98</div>
              <div class="score-badge" id="summaryScoreBadge">EXCELLENT SAFETY</div>
            </div>

            <div style="background:var(--surface-muted); border:1px solid var(--border-light); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span style="color:var(--text-muted);" id="t_summaryMicrosleeps">Microsleep Events (&ge;1.2s):</span>
                <strong id="summaryMicrosleeps" style="font-family:'JetBrains Mono';">0</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span style="color:var(--text-muted);" id="t_summaryHeadDrops">Head Drops (&ge;1.5s):</span>
                <strong id="summaryHeadDrops" style="font-family:'JetBrains Mono';">0</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span style="color:var(--text-muted);" id="t_summaryYawns">Yawn Fatigue Events:</span>
                <strong id="summaryYawns" style="font-family:'JetBrains Mono';">0</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span style="color:var(--text-muted);" id="t_summaryDistance">Distance Covered:</span>
                <strong id="summaryDistance" style="font-family:'JetBrains Mono';">14.2 km</strong>
              </div>
            </div>

            <button class="btn-primary" style="margin-top:auto;" onclick="returnToDrive()">
              <span>&larr; <span id="t_btnResumeShift">Resume Drive Shift</span></span>
            </button>
          </div>

        </div>

        <!-- EMERGENCY SIREN MODAL (LEVEL 2) -->
        <div class="alert-modal-overlay" id="alertModalOverlay">
          <div class="alert-modal-content">
            <div class="alert-bell-icon">🔔</div>
            <div class="alert-title" id="alertModalTitle">CRITICAL: WAKE UP!</div>
            <div class="alert-subtitle" id="alertModalSubtitle">
              Sustained driver drowsiness detected. Loud cockpit alarm active. Pull over safely immediately.
            </div>
          </div>
          <button class="btn-i-am-awake" id="btnIAmAwake" onclick="dismissEmergencyAlert()">
            <span id="t_btnIAmAwake">I AM AWAKE</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Right Side Telemetry & Live Inspector -->
    <div class="control-panel">
      <div>
        <div class="panel-section-title">
          <span>🛰️ GPS Speedometer & Telemetry</span>
        </div>
        <div class="speed-demo-box" style="margin-top:10px;">
          <div>
            <div style="font-size:11px; font-weight:700; color:var(--text-muted);">CURRENT SPEED STATUS</div>
            <div style="font-size:17px; font-weight:900; color:var(--text-main);" id="panelSpeedDisplay">42 km/h (Moving • Armed)</div>
            <div style="font-size:10px; color:#16A34A; font-weight:700; margin-top:2px;" id="gpsStatusSource">● High-Accuracy GPS Lock (AIS-140)</div>
          </div>
          <button class="speed-btn-toggle" onclick="toggleGpsModal()">Toggle Standby</button>
        </div>
      </div>

      <div>
        <div class="panel-section-title">
          <span>⚡ Live Competition Simulator</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted); margin: 6px 0 10px 0;">
          Test instant audio siren alarms & voice escalations without waiting:
        </div>
        <div class="btn-grid-sim">
          <button class="btn-sim-alert" onclick="simulateMicrosleep()">
            <strong style="color:var(--alert-red);">🚨 Test 1.2s Microsleep</strong>
            <span style="font-size:10px; color:var(--text-muted);">Triggers Level 2 Cockpit Siren</span>
          </button>
          <button class="btn-sim-alert" onclick="simulateHeadDrop()">
            <strong style="color:var(--alert-red);">💤 Test 1.5s Head Drop</strong>
            <span style="font-size:10px; color:var(--text-muted);">Nodding-off buzzer alarm</span>
          </button>
          <button class="btn-sim-alert" onclick="simulateYawn()">
            <strong style="color:var(--status-amber);">🥱 Test Yawn Escalation</strong>
            <span style="font-size:10px; color:var(--text-muted);">Chime at 2, Siren at 4+ yawns</span>
          </button>
          <button class="btn-sim-alert" onclick="triggerPotholeShock()">
            <strong style="color:#0284C7;">⚡ Test Pothole Shock</strong>
            <span style="font-size:10px; color:var(--text-muted);">650ms accelerometer suppression</span>
          </button>
        </div>
      </div>

      <div>
        <div class="panel-section-title">
          <span>📋 Edge AI Telemetry Log</span>
        </div>
        <div class="live-stream-log" id="eventLog" style="margin-top:10px;">
          <div class="log-entry">SYSTEM: Jaagrat Edge Engine Initialized.</div>
          <div class="log-entry">CONFIG: Strict 1.2s Microsleep, >=1.5s Head Drop Active.</div>
          <div class="log-entry">GPS: Geolocation armed (42 km/h simulated baseline).</div>
        </div>
      </div>
    </div>

  </main>

  <!-- ======================================================== -->
  <!-- 2. ENTERPRISE FLEET OWNER PORTAL SECTION                 -->
  <!-- ======================================================== -->
  <main id="fleetOwnerSection">
    
    <!-- Top Operations Header -->
    <div class="fleet-portal-header">
      <div class="fleet-title-group">
        <h2>
          <span>🏢</span> Jaagrat Fleet Telemetry & Operations Command Center
        </h2>
        <p>Enterprise Real-Time Driver Fatigue Monitoring • AIS-140 GPS Corridor Tracking • Automated Dispatch</p>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <button class="btn-action-sm" onclick="remoteFleetPing('ALL')">
          <span>📢 Broadcast Safety Advisory</span>
        </button>
        <button class="btn-action-sm danger" onclick="triggerEmergencyDispatch('KA-01-AB-1234')">
          <span>🚨 Remote Dispatch Siren (KA-01)</span>
        </button>
      </div>
    </div>

    <!-- Dispatch Alert Banner (Flashes when any driver triggers siren) -->
    <div class="dispatch-alert-banner" id="dispatchAlertBanner">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:24px;">🚨</span>
        <div>
          <div style="font-size:14px; font-weight:900;" id="dispatchBannerTitle">CRITICAL DRIVER EMERGENCY DETECTED</div>
          <div style="font-size:11px; opacity:0.95;" id="dispatchBannerDesc">Vehicle KA-01-AB-1234 (Ramesh Kumar) triggered Level 2 Siren on NH-44 Corridor.</div>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-action-sm" style="background:white; color:#991B1B; border:none;" onclick="acknowledgeFleetEmergency()">
          <span>Acknowledge & Dispatch Rest Patrol</span>
        </button>
      </div>
    </div>

    <!-- Executive KPI Summary Cards -->
    <div class="fleet-kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">🚛 Active Fleet Vehicles</div>
        <div class="kpi-value" id="kpiTotalVehicles">8</div>
        <div class="kpi-trend" style="color:var(--status-green);">● All 8 units streaming telemetry</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">🟢 Attentive Drivers</div>
        <div class="kpi-value" id="kpiAttentiveCount" style="color:var(--status-green);">6</div>
        <div class="kpi-trend" style="color:var(--status-green);">75% of active fleet in safe zone</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">🟡 Fatigue Advisory (Yawns)</div>
        <div class="kpi-value" id="kpiWarningCount" style="color:var(--status-amber);">1</div>
        <div class="kpi-trend" style="color:var(--status-amber);">DL-01-AX-4433 (3 yawns / 45m)</div>
      </div>
      <div class="kpi-card critical">
        <div class="kpi-label">🔴 Level 2 Siren Alarms</div>
        <div class="kpi-value" id="kpiCriticalCount">1</div>
        <div class="kpi-trend" style="color:var(--alert-red);">● Immediate supervisor dispatch required</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">🛡️ Fleet Safety Score</div>
        <div class="kpi-value" id="kpiFleetSafetyScore" style="color:var(--status-green);">94.2%</div>
        <div class="kpi-trend" style="color:var(--text-muted);">AIS-140 Intelligent Safety Standard</div>
      </div>
    </div>

    <!-- Live GPS Highway Tracking Map -->
    <div class="fleet-map-card">
      <div class="map-header">
        <div class="map-title">
          <span>🛰️ Live Highway Fleet Tracking Map (Golden Quadrilateral & Freight Corridors)</span>
        </div>
        <div style="display:flex; gap:14px; font-size:11px; font-weight:700; color:var(--text-muted);">
          <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#22C55E;"></span> Normal Attentive</span>
          <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#F59E0B;"></span> Fatigue Advisory</span>
          <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#EF4444;"></span> Level 2 Critical Siren</span>
        </div>
      </div>

      <!-- Vector GPS Map Viewport -->
      <div class="map-svg-viewport" id="mapSvgViewport">
        <svg class="fleet-map-svg" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <!-- India Freight Highway Grid Lines -->
          <defs>
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#818CF8" stop-opacity="0.6"/>
            </linearGradient>
            <radialGradient id="redRadar">
              <stop offset="0%" stop-color="#EF4444" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#EF4444" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Highway Network Paths -->
          <!-- NH-44: North-South Corridor (Delhi -> Hyderabad -> Bengaluru) -->
          <path d="M 450,40 L 480,140 L 520,240 L 490,320" fill="none" stroke="url(#routeGlow)" stroke-width="3" stroke-dasharray="6,4"/>
          <!-- NH-48: West Corridor (Delhi -> Jaipur -> Mumbai -> Pune -> Bengaluru) -->
          <path d="M 450,40 L 370,100 L 290,190 L 320,230 L 490,320" fill="none" stroke="url(#routeGlow)" stroke-width="3" stroke-dasharray="6,4"/>
          <!-- NH-16: East Coast Corridor (Kolkata -> Vizag -> Chennai) -->
          <path d="M 750,150 L 680,240 L 560,330" fill="none" stroke="url(#routeGlow)" stroke-width="2.5" stroke-dasharray="6,4"/>
          <!-- NH-27: East-West Corridor (Porbandar -> Ahmedabad -> Kanpur -> Siliguri) -->
          <path d="M 200,160 L 320,150 L 520,130 L 780,110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

          <!-- Corridor Labels -->
          <text x="510" y="270" fill="#94A3B8" font-size="11" font-weight="700">NH-44 Corridor</text>
          <text x="310" y="210" fill="#94A3B8" font-size="11" font-weight="700">NH-48 Mumbai-Pune</text>
          <text x="690" y="220" fill="#94A3B8" font-size="11" font-weight="700">NH-16 East Coast</text>
          <text x="495" y="340" fill="#F8FAFC" font-size="12" font-weight="800">📍 Bengaluru Hub</text>
          <text x="455" y="30" fill="#F8FAFC" font-size="12" font-weight="800">📍 Delhi-NCR Hub</text>

          <!-- VEHICLE MARKERS -->
          <!-- 1. KA-01-AB-1234 (Ramesh Kumar on NH-44 approaching Bengaluru) -->
          <g id="mapMarker_KA01" transform="translate(500, 290)">
            <!-- Radar ping circle for critical alert -->
            <circle cx="0" cy="0" r="22" fill="url(#redRadar)" id="radarPingKA01">
              <animate attributeName="r" values="8;28;8" dur="1.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="0" r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2" id="markerDotKA01"/>
            <rect x="12" y="-14" width="130" height="26" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#EF4444" stroke-width="1.5" id="markerBoxKA01"/>
            <text x="20" y="4" fill="#FFFFFF" font-size="10" font-weight="800" font-family="'JetBrains Mono', monospace" id="markerTextKA01">KA-01-AB-1234 (42 km/h)</text>
          </g>

          <!-- 2. MH-12-RN-8812 (Suresh Patil on NH-48 Pune) -->
          <g transform="translate(320, 230)">
            <circle cx="0" cy="0" r="7" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
            <rect x="12" y="-14" width="126" height="24" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.2)"/>
            <text x="20" y="3" fill="#FFFFFF" font-size="10" font-weight="700">MH-12-RN-8812 (64 km/h)</text>
          </g>

          <!-- 3. DL-01-AX-4433 (Gurpreet Singh on NH-48 Jaipur Corridor) -->
          <g transform="translate(390, 85)">
            <circle cx="0" cy="0" r="7" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
            <rect x="12" y="-14" width="126" height="24" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="#F59E0B"/>
            <text x="20" y="3" fill="#FFFFFF" font-size="10" font-weight="700">DL-01-AX-4433 (58 km/h)</text>
          </g>

          <!-- 4. TN-09-BK-9102 (M. Selvam on NH-16 Chennai Port) -->
          <g transform="translate(560, 325)">
            <circle cx="0" cy="0" r="7" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
            <rect x="12" y="-14" width="126" height="24" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.2)"/>
            <text x="20" y="3" fill="#FFFFFF" font-size="10" font-weight="700">TN-09-BK-9102 (48 km/h)</text>
          </g>

          <!-- 5. TS-07-UA-3011 (Venkat Rao on Hyderabad ORR) -->
          <g transform="translate(520, 235)">
            <circle cx="0" cy="0" r="7" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
            <rect x="12" y="-14" width="126" height="24" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.2)"/>
            <text x="20" y="3" fill="#FFFFFF" font-size="10" font-weight="700">TS-07-UA-3011 (52 km/h)</text>
          </g>

          <!-- 6. GJ-06-ZZ-1822 (Jignesh Shah on Vadodara Exp) -->
          <g transform="translate(270, 160)">
            <circle cx="0" cy="0" r="7" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
            <rect x="12" y="-14" width="126" height="24" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.2)"/>
            <text x="20" y="3" fill="#FFFFFF" font-size="10" font-weight="700">GJ-06-ZZ-1822 (68 km/h)</text>
          </g>

          <!-- 7. WB-19-JK-5541 (Anirban Das on Kolkata Exp) -->
          <g transform="translate(740, 150)">
            <circle cx="0" cy="0" r="7" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
            <rect x="12" y="-14" width="126" height="24" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.2)"/>
            <text x="20" y="3" fill="#FFFFFF" font-size="10" font-weight="700">WB-19-JK-5541 (61 km/h)</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- Live Fleet Telemetry Table -->
    <div class="fleet-table-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:15px; font-weight:800; color:var(--text-main);">
          <span>📋 Real-Time Commercial Fleet Roster & Buzzer Audit</span>
        </div>
        <div style="font-size:11px; font-weight:700; color:var(--text-muted);">
          <span>Auto-Sync: Live WebSocket (< 100ms)</span>
        </div>
      </div>

      <table class="fleet-table" id="fleetRosterTable">
        <thead>
          <tr>
            <th>Vehicle No</th>
            <th>Driver Name</th>
            <th>Vehicle Model</th>
            <th>Highway Corridor</th>
            <th>Speed (GPS)</th>
            <th>Driver Fatigue State</th>
            <th>Shift Buzzer Events</th>
            <th>Fatigue Rate</th>
            <th>Dispatch Actions</th>
          </tr>
        </thead>
        <tbody id="fleetTableBody">
          <!-- Dynamically populated / synced -->
        </tbody>
      </table>
    </div>

  </main>

  <!-- Sound Audio Synthesizers -->
  <script>
    ${i18nCode}

    // --- APPLICATION STATE ---
    let currentLang = 'en';
    let isArmed = true;
    let cameraActive = false;
    let faceMeshInstance = null;
    let cameraStream = null;

    // Detection Thresholds (strictly calibrated)
    const MICROSLEEP_MS = 1200; // strictly 1.20 seconds eye closure
    const HEADDROP_MS = 1500;   // strictly 1.50 seconds head drop
    const YAWN_MAR_THRESHOLD = 0.48;

    // Timers & Counters
    let eyeClosedStartTime = null;
    let headDropStartTime = null;
    let yawnStartTime = null;
    let headDropLatched = false;

    let microsleepCount = 0;
    let headDropCount = 0;
    let yawnCount = 0;
    let yawnCounted = false;

    // Smoothing & Posture Filters (EMA)
    let smoothedPitchRatio = 1.0;
    let smoothedZTilt = 0.0;
    let potholeCooldownUntil = 0;
    let isLevel2AlarmActive = false;
    let eyeOpenContinuousStart = null;

    let currentDriverState = 'focused';
    let frameCounter = 0;
    let lastFpsTime = Date.now();

    // Speedometer & GPS State
    let currentSpeedKmh = 42;
    let isGpsStationary = false;
    let geoWatchId = null;

    // Commercial Fleet Mock Database (8 Vehicles)
    const fleetVehicles = [
      {
        id: "KA-01-AB-1234",
        driver: "Ramesh Kumar",
        phone: "+91 98765 43210",
        model: "BharatBenz 3723R (Heavy Haul)",
        corridor: "NH-44 Bengaluru Mile 42",
        speed: 42,
        state: "CRITICAL",
        stateLabel: "Level 2 Siren Active",
        microsleeps: 1,
        headDrops: 1,
        yawns: 2,
        totalBuzzers: 2,
        fatigueRate: "1.45 / 100km",
        risk: "HIGH RISK"
      },
      {
        id: "MH-12-RN-8812",
        driver: "Suresh Patil",
        phone: "+91 98220 11928",
        model: "Tata Prima 4028.S (Container)",
        corridor: "NH-48 Pune Bypass",
        speed: 64,
        state: "SAFE",
        stateLabel: "Focused & Attentive",
        microsleeps: 0,
        headDrops: 0,
        yawns: 0,
        totalBuzzers: 0,
        fatigueRate: "0.00 / 100km",
        risk: "SAFE"
      },
      {
        id: "DL-01-AX-4433",
        driver: "Gurpreet Singh",
        phone: "+91 98110 33411",
        model: "Ashok Leyland 4220 (14-Wheeler)",
        corridor: "NH-48 Delhi-Jaipur",
        speed: 58,
        state: "WARNING",
        stateLabel: "Fatigue Advisory (3 Yawns)",
        microsleeps: 0,
        headDrops: 0,
        yawns: 3,
        totalBuzzers: 1,
        fatigueRate: "0.65 / 100km",
        risk: "MODERATE"
      },
      {
        id: "TN-09-BK-9102",
        driver: "M. Selvam",
        phone: "+91 94440 88219",
        model: "Eicher Pro 6028 (Reefer Truck)",
        corridor: "NH-16 Chennai Port",
        speed: 48,
        state: "SAFE",
        stateLabel: "Focused & Attentive",
        microsleeps: 0,
        headDrops: 0,
        yawns: 1,
        totalBuzzers: 0,
        fatigueRate: "0.15 / 100km",
        risk: "SAFE"
      },
      {
        id: "TS-07-UA-3011",
        driver: "Venkat Rao",
        phone: "+91 99890 55123",
        model: "Tata Signa 2823.K (Tipper)",
        corridor: "Hyderabad Outer Ring Rd",
        speed: 52,
        state: "SAFE",
        stateLabel: "Focused & Attentive",
        microsleeps: 0,
        headDrops: 0,
        yawns: 0,
        totalBuzzers: 0,
        fatigueRate: "0.00 / 100km",
        risk: "SAFE"
      },
      {
        id: "GJ-06-ZZ-1822",
        driver: "Jignesh Shah",
        phone: "+91 98250 77112",
        model: "BharatBenz 2823C (Tanker)",
        corridor: "NE-1 Ahmedabad-Vadodara",
        speed: 68,
        state: "SAFE",
        stateLabel: "Focused & Attentive",
        microsleeps: 0,
        headDrops: 0,
        yawns: 0,
        totalBuzzers: 0,
        fatigueRate: "0.00 / 100km",
        risk: "SAFE"
      },
      {
        id: "HR-26-CV-6029",
        driver: "Vikas Yadav",
        phone: "+91 98120 44901",
        model: "Mahindra Blazo X 35",
        corridor: "Manesar Freight Terminal",
        speed: 0,
        state: "STANDBY",
        stateLabel: "Depot Standby (Resting)",
        microsleeps: 0,
        headDrops: 0,
        yawns: 0,
        totalBuzzers: 0,
        fatigueRate: "0.00 / 100km",
        risk: "RESTING"
      },
      {
        id: "WB-19-JK-5541",
        driver: "Anirban Das",
        phone: "+91 98300 66299",
        model: "Tata 1616 Cowl Chassis",
        corridor: "NH-19 Kolkata-Durgapur",
        speed: 61,
        state: "SAFE",
        stateLabel: "Focused & Attentive",
        microsleeps: 0,
        headDrops: 0,
        yawns: 1,
        totalBuzzers: 0,
        fatigueRate: "0.18 / 100km",
        risk: "SAFE"
      }
    ];

    // --- AUDIO SYNTHESIZERS (WEB AUDIO API) ---
    let audioCtx = null;
    let sirenOsc1 = null;
    let sirenOsc2 = null;
    let sirenTimer = null;

    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    // Level 1 Warning Chime: Dual pleasant chime (1000Hz -> 1300Hz)
    function playWarningChime() {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1350, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch(e) {
        console.warn('Audio play error:', e);
      }
    }

    // Level 2 Cockpit Emergency Siren: Piercing Alternating Square Waves (800Hz / 1200Hz)
    function startLevel2CockpitSiren() {
      stopLevel2CockpitSiren();
      try {
        const ctx = getAudioContext();
        sirenOsc1 = ctx.createOscillator();
        sirenOsc2 = ctx.createOscillator();
        const sirenGain = ctx.createGain();

        sirenOsc1.type = 'square';
        sirenOsc2.type = 'sawtooth';
        sirenGain.gain.setValueAtTime(0.55, ctx.currentTime);

        let highPitch = false;
        sirenOsc1.frequency.setValueAtTime(820, ctx.currentTime);
        sirenOsc2.frequency.setValueAtTime(824, ctx.currentTime);

        sirenTimer = setInterval(() => {
          if (!audioCtx) return;
          highPitch = !highPitch;
          const freq = highPitch ? 1220 : 820;
          try {
            sirenOsc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
            sirenOsc2.frequency.setValueAtTime(freq + 6, audioCtx.currentTime);
          } catch(e) {}
        }, 160);

        sirenOsc1.connect(sirenGain);
        sirenOsc2.connect(sirenGain);
        sirenGain.connect(ctx.destination);

        sirenOsc1.start();
        sirenOsc2.start();
      } catch(e) {
        console.warn('Siren start error:', e);
      }
    }

    function stopLevel2CockpitSiren() {
      if (sirenTimer) {
        clearInterval(sirenTimer);
        sirenTimer = null;
      }
      try {
        if (sirenOsc1) { sirenOsc1.stop(); sirenOsc1.disconnect(); sirenOsc1 = null; }
        if (sirenOsc2) { sirenOsc2.stop(); sirenOsc2.disconnect(); sirenOsc2 = null; }
      } catch(e) {}
    }

    // Dispatch Notification Chime (for Fleet Owner Portal)
    function playDispatchChime() {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch(e) {}
    }

    // --- PORTAL SWITCHER: DRIVER COCKPIT vs FLEET OWNER PORTAL ---
    function switchMainPortal(mode) {
      const driverTab = document.getElementById('tabDriverCockpit');
      const fleetTab = document.getElementById('tabFleetOwner');
      const driverSection = document.getElementById('driverCockpitSection');
      const fleetSection = document.getElementById('fleetOwnerSection');

      if (mode === 'fleet') {
        driverTab.classList.remove('active');
        fleetTab.classList.add('active');
        driverSection.style.display = 'none';
        fleetSection.style.display = 'flex';
        renderFleetTable();
        logEvent('PORTAL: Switched to Enterprise Fleet Owner Command Center.');
      } else {
        fleetTab.classList.remove('active');
        driverTab.classList.add('active');
        fleetSection.style.display = 'none';
        driverSection.style.display = 'grid';
        logEvent('PORTAL: Switched to Driver Cockpit HUD.');
      }
    }

    // --- RENDER FLEET OWNER ROSTER TABLE ---
    function renderFleetTable() {
      const tbody = document.getElementById('fleetTableBody');
      if (!tbody) return;

      tbody.innerHTML = '';
      fleetVehicles.forEach((v, idx) => {
        const tr = document.createElement('tr');
        if (v.state === 'CRITICAL') {
          tr.className = 'critical-row';
        }

        let chipClass = 'chip-safe';
        if (v.state === 'WARNING') chipClass = 'chip-warning';
        if (v.state === 'CRITICAL') chipClass = 'chip-danger';

        tr.innerHTML = \`
          <td><span class="vehicle-badge-pill">\${v.id}</span></td>
          <td>
            <strong>\${v.driver}</strong>
            <div style="font-size:10px; color:var(--text-muted);">\${v.phone}</div>
          </td>
          <td>\${v.model}</td>
          <td>\${v.corridor}</td>
          <td><strong style="font-family:'JetBrains Mono';">\${v.speed} km/h</strong></td>
          <td>
            <span class="status-chip \${chipClass}">
              <span>●</span> \${v.stateLabel}
            </span>
          </td>
          <td>
            <span style="font-family:'JetBrains Mono'; font-weight:700;">
              🚨 \${v.microsleeps} Micro • 💤 \${v.headDrops} Nod • 🥱 \${v.yawns} Yawn
            </span>
          </td>
          <td><strong style="color:\${v.state === 'CRITICAL' ? 'var(--alert-red)' : 'var(--text-main)'};">\${v.fatigueRate}</strong></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-action-sm \${v.state === 'CRITICAL' ? 'danger' : ''}" onclick="triggerEmergencyDispatch('\${v.id}')">
                <span>🚨 Ping</span>
              </button>
              <button class="btn-action-sm" onclick="callDriver('\${v.driver}', '\${v.phone}')">
                <span>📞 Call</span>
              </button>
            </div>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function callDriver(name, phone) {
      alert('📞 INITIATING SUPERVISOR AUDIO DISPATCH CALL\\n\\nDriver: ' + name + '\\nDirect Mobile: ' + phone + '\\nConnecting via Fleet Cellular Gateway...');
    }

    function remoteFleetPing(vehicleId) {
      playDispatchChime();
      alert('📢 FLEET BROADCAST PUSHED\\n\\nSafety Advisory dispatched to all 8 vehicles: "Night Driving Protocol in effect. Maintain 3-second headway and report fatigue."');
    }

    function triggerEmergencyDispatch(vehicleId) {
      playDispatchChime();
      const banner = document.getElementById('dispatchAlertBanner');
      banner.style.display = 'flex';
      document.getElementById('dispatchBannerTitle').textContent = 'EMERGENCY DISPATCH TRIGGERED: ' + vehicleId;
      document.getElementById('dispatchBannerDesc').textContent = 'Remote alarm ping dispatched to cockpit. Nearest highway patrol notified.';
      
      // If triggered for KA-01-AB-1234, trigger cockpit siren directly!
      if (vehicleId === 'KA-01-AB-1234') {
        const dict = i18n[currentLang] || i18n.en;
        triggerEmergencyModal('DISPATCH OVERRIDE: WAKE UP!');
      }
    }

    function acknowledgeFleetEmergency() {
      const banner = document.getElementById('dispatchAlertBanner');
      banner.style.display = 'none';
      alert('✓ Emergency Acknowledged. Rest Patrol dispatched to Mile Marker 42.');
    }

    // SYNC FLEET TELEMETRY WHEN DRIVER COCKPIT TRIGGERS ALARM
    function syncFleetEmergency(reason) {
      // Update vehicle 0 (KA-01-AB-1234)
      fleetVehicles[0].state = 'CRITICAL';
      fleetVehicles[0].stateLabel = 'Level 2 Siren: ' + reason;
      fleetVehicles[0].totalBuzzers++;
      if (reason.includes('Microsleep')) fleetVehicles[0].microsleeps++;
      if (reason.includes('Head Drop')) fleetVehicles[0].headDrops++;
      fleetVehicles[0].fatigueRate = (1.45 + (fleetVehicles[0].totalBuzzers * 0.35)).toFixed(2) + ' / 100km';

      // Update KPI
      const critElem = document.getElementById('kpiCriticalCount');
      if (critElem) critElem.textContent = '1 ACTIVE';

      // Update Map pin to red
      const box = document.getElementById('markerBoxKA01');
      if (box) box.setAttribute('stroke', '#EF4444');

      // Show banner on fleet portal
      const banner = document.getElementById('dispatchAlertBanner');
      if (banner) {
        banner.style.display = 'flex';
        document.getElementById('dispatchBannerTitle').textContent = '🚨 COCKPIT SIREN ACTIVE: KA-01-AB-1234';
        document.getElementById('dispatchBannerDesc').textContent = 'Driver Ramesh Kumar triggered Level 2 Siren (' + reason + ') on NH-44.';
      }

      renderFleetTable();
    }

    // --- STEP 1: SPLASH SCREEN SKIP / TRANSITION ---
    function skipSplash() {
      const splash = document.getElementById('viewSplash');
      splash.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(0.96)';
      setTimeout(() => {
        splash.style.display = 'none';
        goToLanguageScreen();
      }, 400);
    }

    // Auto-advance splash after 2.2 seconds if not tapped
    setTimeout(() => {
      const splash = document.getElementById('viewSplash');
      if (splash && splash.style.display !== 'none') {
        skipSplash();
      }
    }, 2200);

    // --- STEP 2: LANGUAGE SELECTION (12 INDIAN LANGUAGES) ---
    function goToLanguageScreen() {
      document.getElementById('viewLogin').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'none';
      document.getElementById('viewSummary').style.display = 'none';
      
      const langView = document.getElementById('viewLanguage');
      langView.style.display = 'flex';
      logEvent('ONBOARDING: Step 1 Language Selection View loaded (12 Languages).');
    }

    function selectLang(code) {
      currentLang = code;
      const cards = document.querySelectorAll('.lang-card-item');
      cards.forEach(c => c.classList.remove('active'));
      
      if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
      }

      applyLanguage(currentLang);
      logEvent('LANGUAGE: Driver chosen language -> ' + code.toUpperCase());
    }

    function proceedToDriverDetails() {
      document.getElementById('viewLanguage').style.display = 'none';
      const loginView = document.getElementById('viewLogin');
      loginView.style.display = 'flex';
      applyLanguage(currentLang);
      logEvent('ONBOARDING: Step 2 Driver Details & SMS OTP authentication loaded.');
    }

    function applyLanguage(code) {
      const dict = i18n[code] || i18n.en;

      // Update Language Screen
      const tChooseTitle = document.getElementById('t_chooseLangTitle');
      const tChooseSub = document.getElementById('t_chooseLangSub');
      const tBtnContinueLang = document.getElementById('t_btnContinueLang');
      if (tChooseTitle) tChooseTitle.textContent = dict.chooseLangTitle;
      if (tChooseSub) tChooseSub.textContent = dict.chooseLangSub;
      if (tBtnContinueLang) tBtnContinueLang.textContent = dict.btnContinue;

      // Update Onboarding Screen
      const tDriverOnboarding = document.getElementById('t_driverOnboarding');
      const tFleetAuth = document.getElementById('t_fleetAuth');
      const tDriverName = document.getElementById('t_driverName');
      const tDepot = document.getElementById('t_depot');
      const tMobile = document.getElementById('t_mobile');
      const tOtp = document.getElementById('t_otp');
      const tOtpVerified = document.getElementById('t_otpVerified');
      const tVehicleReg = document.getElementById('t_vehicleReg');
      const tStartDrive = document.getElementById('t_startDrive');
      const tChangeLangLink = document.getElementById('t_changeLangLink');

      if (tDriverOnboarding) tDriverOnboarding.textContent = dict.driverOnboarding;
      if (tFleetAuth) tFleetAuth.textContent = dict.fleetAuth;
      if (tDriverName) tDriverName.textContent = dict.driverName;
      if (tDepot) tDepot.textContent = dict.depotLocation;
      if (tMobile) tMobile.textContent = dict.mobileNumber;
      if (tOtp) tOtp.textContent = dict.otpLabel;
      if (tOtpVerified) tOtpVerified.textContent = dict.otpVerified;
      if (tVehicleReg) tVehicleReg.textContent = dict.vehicleReg;
      if (tStartDrive) tStartDrive.textContent = dict.startDrive;
      if (tChangeLangLink) tChangeLangLink.textContent = dict.changeLangLink;

      // Update Drive View HUD
      const tRoadBump = document.getElementById('t_roadBump');
      const tEndShift = document.getElementById('t_endShift');
      const tBtnIAmAwake = document.getElementById('t_btnIAmAwake');
      if (tRoadBump) tRoadBump.textContent = dict.roadBump;
      if (tEndShift) tEndShift.textContent = '🏁 ' + dict.endShift;
      if (tBtnIAmAwake) tBtnIAmAwake.textContent = dict.iAmAwake;

      // Update Status Card
      updateDriverStatus(currentDriverState);
    }

    // --- STEP 3: REAL-WORLD SMS OTP ONBOARDING ---
    function sendRealOtp() {
      const btn = document.getElementById('btnSendOtp');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Drop down simulated SMS push toast
      setTimeout(() => {
        const toast = document.getElementById('smsToast');
        toast.style.display = 'flex';
        playWarningChime();

        setTimeout(() => {
          document.getElementById('otp1').value = '8';
          document.getElementById('otp2').value = '4';
          document.getElementById('otp3').value = '2';
          document.getElementById('otp4').value = '9';
          document.getElementById('otpVerifiedBadge').style.display = 'flex';
          btn.textContent = 'OTP Sent ✓';
          btn.style.color = 'var(--status-green)';
          btn.style.borderColor = 'var(--status-green)';
          logEvent('SMS OTP: Generated and auto-verified (8429).');
        }, 800);

        setTimeout(() => {
          toast.style.animation = 'toastDrop 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
          setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
          }, 300);
        }, 5500);
      }, 500);
    }

    function authenticateAndStartDrive() {
      const dName = document.getElementById('inputDriverName').value || 'Ramesh Kumar';
      const vReg = document.getElementById('inputVehicle').value || 'KA-01-AB-1234';

      document.getElementById('dispVehicleTag').textContent = vReg;
      document.getElementById('dispDriverTag').textContent = dName.split(' ')[0] + ' ' + (dName.split(' ')[1] ? dName.split(' ')[1][0] + '.' : '');

      document.getElementById('viewLogin').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'flex';

      startSpeedometer();
      logEvent('AUTHENTICATION: Driver ' + dName + ' (' + vReg + ') authenticated. Drive shift active.');
    }

    // --- STEP 4: REAL-TIME GPS SPEEDOMETER & SENSORS ---
    function startSpeedometer() {
      if ('geolocation' in navigator) {
        geoWatchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (pos.coords && pos.coords.speed !== null && pos.coords.speed !== undefined) {
              const kmh = Math.round(pos.coords.speed * 3.6);
              currentSpeedKmh = kmh;
              updateSpeedometerUI(kmh, false);
            }
          },
          (err) => {
            console.log('GPS watchPosition info:', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
      }
    }

    function updateSpeedometerUI(kmh, isSimulated) {
      const pill = document.getElementById('screenSpeedPill');
      const kmhText = document.getElementById('speedKmhText');
      const modeText = document.getElementById('speedModeText');
      const panelSpeed = document.getElementById('panelSpeedDisplay');

      kmhText.textContent = kmh + ' km/h';

      if (kmh < 10) {
        isArmed = false;
        pill.className = 'speed-status-pill standby';
        modeText.textContent = 'STANDBY';
        panelSpeed.textContent = kmh + ' km/h (Stationary • Standby)';
        panelSpeed.style.color = 'var(--text-muted)';
      } else {
        isArmed = true;
        pill.className = 'speed-status-pill armed';
        modeText.textContent = 'ARMED';
        panelSpeed.textContent = kmh + ' km/h (Cruising • Armed)';
        panelSpeed.style.color = '#1D4ED8';
      }
    }

    function toggleGpsModal() {
      isGpsStationary = !isGpsStationary;
      if (isGpsStationary) {
        currentSpeedKmh = 0;
        updateSpeedometerUI(0, true);
        logEvent('SPEEDOMETER: Switched to 0 km/h (Stationary Standby mode).');
      } else {
        currentSpeedKmh = 42;
        updateSpeedometerUI(42, true);
        logEvent('SPEEDOMETER: Switched to 42 km/h (Moving Armed mode).');
      }
    }

    // --- POTHOLE / ROAD BUMP SHOCK ABSORPTION ---
    function triggerPotholeShock() {
      const now = Date.now();
      potholeCooldownUntil = now + 650;
      logEvent('SENSORS: Pothole / bump shock detected. Suppression active for 650ms.');

      const badge = document.getElementById('globalStatusPill');
      badge.textContent = 'Bump Suppressed (650ms)';
      badge.style.background = '#FEF3C7';
      badge.style.color = '#D97706';

      setTimeout(() => {
        badge.textContent = 'Live Web Vision Active';
        badge.style.background = 'var(--status-green-light)';
        badge.style.color = 'var(--status-green)';
      }, 650);
    }

    // --- CAMERA & MEDIAPIPE FACE MESH INITIALIZATION ---
    async function toggleFrontCamera() {
      if (!cameraActive) {
        await startCamera();
      } else {
        stopCamera();
      }
    }

    async function startCamera() {
      const video = document.getElementById('webcamElement');
      const canvas = document.getElementById('meshCanvas');
      const fallback = document.getElementById('cameraFallback');
      const btn = document.getElementById('btnToggleCam');
      const btnText = document.getElementById('btnToggleCamText');

      try {
        btnText.textContent = 'Initializing AI Vision...';
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        cameraStream = stream;
        video.srcObject = stream;
        await video.play();

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        video.style.display = 'block';
        canvas.style.display = 'block';
        fallback.style.display = 'none';

        btn.classList.add('btn-active-cam');
        btnText.textContent = 'Stop AI Camera';
        cameraActive = true;

        if (!faceMeshInstance) {
          faceMeshInstance = new FaceMesh({
            locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/\${file}\`
          });

          faceMeshInstance.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          faceMeshInstance.onResults(onFaceMeshResults);
        }

        startDetectionLoop();
        logEvent('VISION: Front Camera started. MediaPipe FaceMesh active.');
      } catch(err) {
        console.error('Camera access error:', err);
        btnText.textContent = 'Camera Unavailable';
        alert('Camera permission denied or not available. Use simulator buttons to test all features.');
        logEvent('ERROR: Camera access denied (' + err.message + ')');
      }
    }

    function stopCamera() {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
      }
      cameraActive = false;
      document.getElementById('webcamElement').style.display = 'none';
      document.getElementById('meshCanvas').style.display = 'none';
      document.getElementById('cameraFallback').style.display = 'flex';
      
      const btn = document.getElementById('btnToggleCam');
      btn.classList.remove('btn-active-cam');
      document.getElementById('btnToggleCamText').textContent = 'Start AI Front Camera';
      logEvent('VISION: Front Camera stopped.');
    }

    async function startDetectionLoop() {
      const video = document.getElementById('webcamElement');
      while (cameraActive) {
        if (video.readyState >= 2 && faceMeshInstance) {
          try {
            await faceMeshInstance.send({ image: video });
          } catch(e) {
            console.warn('FaceMesh frame skipped:', e);
          }
        }
        await new Promise(r => requestAnimationFrame(r));
      }
    }

    // --- STATUS UPDATES ---
    function updateDriverStatus(state) {
      if (state) currentDriverState = state;
      const dict = i18n[currentLang] || i18n.en;
      const card = document.getElementById('driverStatusCard');
      const title = document.getElementById('driverStatusTitle');
      const sub = document.getElementById('driverStatusSubtitle');
      const badge = document.getElementById('sessionIncidentsBadge');
      const totalIncidents = microsleepCount + yawnCount + headDropCount;
      badge.textContent = dict.incidentsLabel.replace('{n}', totalIncidents);

      card.classList.remove('state-yawn', 'state-drowsy');

      if (currentDriverState === 'focused') {
        title.textContent = dict.focusedAlert;
        sub.textContent = dict.focusedSub;
      } else if (currentDriverState === 'yawning') {
        card.classList.add('state-yawn');
        title.textContent = dict.yawnWarning;
        sub.textContent = dict.yawnSub;
      } else if (currentDriverState === 'drowsy') {
        card.classList.add('state-drowsy');
        title.textContent = dict.drowsyWarning;
        sub.textContent = dict.drowsySub;
      } else if (currentDriverState === 'headdrop') {
        card.classList.add('state-drowsy');
        title.textContent = dict.headDropWarning;
        sub.textContent = dict.headDropSub;
      } else if (currentDriverState === 'noface') {
        title.textContent = dict.noFaceWarning;
        sub.textContent = dict.noFaceSub;
      }
    }

    // --- PROCESS FACIAL LANDMARKS WITH HEAD-SHAKE & FACE-LOSS RESILIENCE ---
    function onFaceMeshResults(results) {
      const canvas = document.getElementById('meshCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frameCounter++;
      if (Date.now() - lastFpsTime >= 1000) {
        document.getElementById('cvFpsText').textContent = 'AI GUARD ' + frameCounter + ' FPS';
        frameCounter = 0;
        lastFpsTime = Date.now();
      }

      const bracketBox = document.getElementById('faceBracketBox');
      const dict = i18n[currentLang] || i18n.en;

      // 1. SAFE FACE ABSENCE HANDLING (NO BUZZING, ZERO SPAM)
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        bracketBox.className = 'face-bracket-box';
        // Reset ongoing timers when face is not visible
        headDropStartTime = null;
        headDropLatched = false;
        eyeClosedStartTime = null;
        yawnStartTime = null;
        document.getElementById('closureLineFill').style.width = '0%';
        updateDriverStatus('noface');
        return;
      }

      const lm = results.multiFaceLandmarks[0];
      bracketBox.className = 'face-bracket-box tracking';

      // 1. EAR (Eye Aspect Ratio) - 0.23 threshold
      const leftEar = calculateEAR(lm, [33, 160, 158, 133, 153, 144]);
      const rightEar = calculateEAR(lm, [362, 385, 387, 263, 373, 380]);
      const currentEar = (leftEar + rightEar) / 2.0;

      // 2. MAR (Mouth Aspect Ratio) - 0.48 threshold
      const currentMar = calculateMAR(lm);

      // 3. HEAD SHAKE & YAW FILTER (Check mirror / horizontal head rotation)
      // Landmarks: 1 = Nose tip, 234 = Left cheek, 454 = Right cheek
      const cheekSpan = Math.abs(lm[454].x - lm[234].x);
      const leftDist = Math.abs(lm[1].x - lm[234].x);
      const rightDist = Math.abs(lm[454].x - lm[1].x);
      const yawAsymmetry = Math.abs(leftDist - rightDist) / Math.max(0.001, cheekSpan);
      const isShakingHead = yawAsymmetry > 0.35; // Head turned or shaking

      // 4. ROLL TILT FILTER (Angle between outer eye corners 33 and 263)
      const eyeDx = lm[263].x - lm[33].x;
      const eyeDy = lm[263].y - lm[33].y;
      const rollAngle = Math.abs(Math.atan2(eyeDy, eyeDx) * 180 / Math.PI);
      const isTiltingRoll = rollAngle > 16;

      // 5. PITCH & 3D DEPTH CALCULATION (Accurate Forward Nodding)
      const foreheadY = lm[10].y;
      const noseY = lm[1].y;
      const chinY = lm[152].y;
      const upperFaceH = Math.max(0.01, noseY - foreheadY);
      const lowerFaceH = Math.max(0.01, chinY - noseY);
      const rawPitchRatio = lowerFaceH / upperFaceH;
      const zTilt = (lm[152].z - lm[10].z); // Chin depth minus forehead depth

      // Exponential Moving Average (EMA) to smooth out single-frame jumps
      smoothedPitchRatio = (smoothedPitchRatio * 0.72) + (rawPitchRatio * 0.28);
      smoothedZTilt = (smoothedZTilt * 0.72) + (zTilt * 0.28);

      // Genuine downward nod requires:
      // - Nose drops close to chin (smoothedPitchRatio < 0.60)
      // - Chin is tilted back / forehead forward (smoothedZTilt > 0.035)
      // - Head is NOT shaking or turning sideways (!isShakingHead)
      // - Head is NOT rolling sideways (!isTiltingRoll)
      const isGenuineHeadDrop = (smoothedPitchRatio < 0.60) && !isShakingHead && !isTiltingRoll && (smoothedZTilt > 0.035);

      // Subtle futuristic eye tracking dots
      const eyeClosed = currentEar < 0.23;
      if (lm[468] && lm[473]) {
        ctx.fillStyle = eyeClosed ? '#EF4444' : '#22C55E';
        drawGlowCircle(ctx, canvas, lm[468], 4, eyeClosed ? '#EF4444' : '#22C55E');
        drawGlowCircle(ctx, canvas, lm[473], 4, eyeClosed ? '#EF4444' : '#22C55E');
      }

      // --- FATIGUE DETECTION BUFFERS ---
      const now = Date.now();
      const inCooldown = now < potholeCooldownUntil;
      const isYawning = currentMar > 0.48;

      // A. HEAD DROP DETECTION (STRICTLY >= 1.5 SECONDS WITH ANTI-SPAM LATCH)
      if (isGenuineHeadDrop && isArmed && !inCooldown) {
        bracketBox.className = 'face-bracket-box alarm';
        updateDriverStatus('headdrop');

        if (!headDropStartTime) headDropStartTime = now;
        const dropDur = now - headDropStartTime;

        // Visual feedback on HUD: progress bar fills smoothly in 1.5s
        const pct = Math.min(100, (dropDur / 1500) * 100);
        document.getElementById('closureLineFill').style.width = pct + '%';
        document.getElementById('closureLineFill').style.backgroundColor = '#F59E0B'; // amber while tilting

        if (dropDur >= 1500 && !isLevel2AlarmActive && !headDropLatched) {
          isLevel2AlarmActive = true;
          headDropLatched = true; // prevent repeated spamming!
          headDropCount++;
          document.getElementById('closureLineFill').style.backgroundColor = 'var(--alert-red)';
          triggerEmergencyModal(dict.criticalHeadDropTitle);
          logEvent('LEVEL 2 EMERGENCY: Head Drop confirmed (>1.5s). Incident #' + headDropCount);
          syncFleetEmergency('Head Drop (>1.5s)');
        }
      } else {
        headDropStartTime = null;
        if (smoothedPitchRatio > 0.75) {
          headDropLatched = false; // release latch once driver returns to upright posture
        }
      }

      // B. YAWN DETECTION (1.0s Duration & Escalation at 2 and 4+ Yawns)
      if (isYawning && isArmed && !inCooldown) {
        bracketBox.className = 'face-bracket-box yawning';
        updateDriverStatus('yawning');

        if (!yawnStartTime) yawnStartTime = now;
        const yawnDur = now - yawnStartTime;

        if (yawnDur >= 1000 && !yawnCounted) {
          yawnCounted = true;
          yawnCount++;
          playWarningChime();
          logEvent('LEVEL 1 ALERT: Yawn detected (' + (yawnDur/1000).toFixed(1) + 's). Total: ' + yawnCount);

          if (yawnCount >= 4 && !isLevel2AlarmActive) {
            triggerEmergencyModal(dict.criticalYawnsTitle);
            logEvent('LEVEL 2 EMERGENCY: Chronic yawns (' + yawnCount + '). Siren triggered!');
            syncFleetEmergency('Chronic Yawns (x' + yawnCount + ')');
          }
        }
      } else {
        if (currentMar < 0.40) {
          yawnStartTime = null;
          yawnCounted = false;
        }
      }

      // C. EYE CLOSURE / MICROSLEEP (STRICTLY 1.20 SECONDS)
      if (eyeClosed && isArmed && !inCooldown) {
        bracketBox.className = 'face-bracket-box alarm';
        updateDriverStatus('drowsy');

        if (!eyeClosedStartTime) eyeClosedStartTime = now;
        const closedDur = now - eyeClosedStartTime;
        const pct = Math.min(100, (closedDur / 1200) * 100);

        document.getElementById('closureLineFill').style.width = pct + '%';
        if (pct > 65) {
          document.getElementById('closureLineFill').style.backgroundColor = 'var(--alert-red)';
        }

        if (closedDur >= 1200 && !isLevel2AlarmActive) {
          isLevel2AlarmActive = true;
          microsleepCount++;
          triggerEmergencyModal(dict.criticalMicrosleepTitle);
          logEvent('LEVEL 2 EMERGENCY: Microsleep confirmed (strictly 1.2s closed). Incident #' + microsleepCount);
          syncFleetEmergency('Microsleep (1.2s)');
        }
      } else {
        eyeClosedStartTime = null;

        if (!isLevel2AlarmActive && !isGenuineHeadDrop) {
          document.getElementById('closureLineFill').style.width = '0%';
          document.getElementById('closureLineFill').style.backgroundColor = 'var(--safety-orange)';
        }

        if (!isGenuineHeadDrop && !isYawning && !eyeClosed) {
          updateDriverStatus('focused');
        }

        if (isLevel2AlarmActive) {
          if (!eyeOpenContinuousStart) eyeOpenContinuousStart = now;
          if (now - eyeOpenContinuousStart >= 2000) {
            logEvent('Driver sustained open eyes for 2.0s. Auto-disarming Level 2 siren.');
            dismissEmergencyAlert();
          }
        } else {
          eyeOpenContinuousStart = null;
        }
      }
    }

    function drawGlowCircle(ctx, canvas, point, r, color) {
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function calculateEAR(lm, idxs) {
      const p1 = lm[idxs[0]], p2 = lm[idxs[1]], p3 = lm[idxs[2]], p4 = lm[idxs[3]], p5 = lm[idxs[4]], p6 = lm[idxs[5]];
      const v1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
      const v2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
      const h = Math.hypot(p1.x - p4.x, p1.y - p4.y);
      return (v1 + v2) / (2.0 * Math.max(0.001, h));
    }

    function calculateMAR(lm) {
      const top = lm[13], bottom = lm[14], left = lm[78], right = lm[308];
      const vert = Math.hypot(top.x - bottom.x, top.y - bottom.y);
      const horiz = Math.hypot(left.x - right.x, left.y - right.y);
      return vert / Math.max(0.001, horiz);
    }

    // --- EMERGENCY ALERTS & RECOVERY ---
    function triggerEmergencyModal(titleText) {
      isLevel2AlarmActive = true;
      startLevel2CockpitSiren();
      const modal = document.getElementById('alertModalOverlay');
      const title = document.getElementById('alertModalTitle');
      title.textContent = titleText || 'CRITICAL: WAKE UP!';
      modal.style.display = 'flex';
    }

    function dismissEmergencyAlert() {
      isLevel2AlarmActive = false;
      stopLevel2CockpitSiren();
      document.getElementById('alertModalOverlay').style.display = 'none';
      document.getElementById('closureLineFill').style.width = '0%';
      document.getElementById('closureLineFill').style.backgroundColor = 'var(--safety-orange)';
      updateDriverStatus('focused');
      logEvent('RECOVERY: Driver acknowledged alert / opened eyes. Shift resumed.');
    }

    // --- PRESENTATION SIMULATOR SHORTCUTS ---
    function simulateMicrosleep() {
      const dict = i18n[currentLang] || i18n.en;
      microsleepCount++;
      triggerEmergencyModal(dict.criticalMicrosleepTitle);
      logEvent('SIMULATION: Triggered Level 2 Microsleep (1.2s closed eyes). Incident #' + microsleepCount);
      syncFleetEmergency('Simulated Microsleep (1.2s)');
    }

    function simulateHeadDrop() {
      const dict = i18n[currentLang] || i18n.en;
      headDropCount++;
      triggerEmergencyModal(dict.criticalHeadDropTitle);
      logEvent('SIMULATION: Triggered Level 2 Head Drop (>1.5s nod). Incident #' + headDropCount);
      syncFleetEmergency('Simulated Head Drop (>1.5s)');
    }

    function simulateYawn() {
      yawnCount++;
      playWarningChime();
      logEvent('SIMULATION: Yawn alert. Count: ' + yawnCount);
      if (yawnCount >= 4) {
        const dict = i18n[currentLang] || i18n.en;
        triggerEmergencyModal(dict.criticalYawnsTitle);
        syncFleetEmergency('Simulated Chronic Yawns (x' + yawnCount + ')');
      }
    }

    function toggleFullscreenCam() {
      const card = document.getElementById('cameraViewport');
      if (!document.fullscreenElement) {
        card.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    }

    function logEvent(msg) {
      const log = document.getElementById('eventLog');
      if (!log) return;
      const timeStr = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.textContent = timeStr + ' ' + msg;
      log.prepend(div);
    }

    // --- STEP 5: SHIFT SAFETY SCORECARD ---
    function showSummaryView() {
      document.getElementById('viewActiveDrive').style.display = 'none';
      const summaryView = document.getElementById('viewSummary');
      summaryView.style.display = 'flex';

      const penalty = (microsleepCount * 25) + (yawnCount * 5) + (headDropCount * 15);
      const score = Math.max(50, 100 - penalty);

      document.getElementById('summaryScoreValue').textContent = score;
      document.getElementById('summaryMicrosleeps').textContent = microsleepCount;
      document.getElementById('summaryHeadDrops').textContent = headDropCount;
      document.getElementById('summaryYawns').textContent = yawnCount;

      const badge = document.getElementById('summaryScoreBadge');
      if (score >= 90) {
        badge.textContent = 'EXCELLENT SAFETY';
        badge.style.color = 'var(--status-green)';
        badge.style.background = 'var(--status-green-light)';
      } else if (score >= 75) {
        badge.textContent = 'MODERATE FATIGUE (ADVISORY)';
        badge.style.color = 'var(--status-amber)';
        badge.style.background = 'var(--status-amber-light)';
      } else {
        badge.textContent = 'HIGH RISK — MANDATORY REST';
        badge.style.color = 'var(--alert-red)';
        badge.style.background = 'var(--alert-red-light)';
      }

      logEvent('SUMMARY: Shift ended. Score: ' + score + '/100. Incidents: ' + (microsleepCount + yawnCount + headDropCount));
    }

    function returnToDrive() {
      document.getElementById('viewSummary').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'flex';
      logEvent('SHIFT: Driver resumed trip from scorecard.');
    }

    // Initialize Fleet Table on load
    renderFleetTable();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully written complete updated Jaagrat application with Head Drop 1.5s & Fleet Owner Portal!');

