const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// ==========================================
// 1. ADD CSS FOR JOLT, HUD TOAST & WHATSAPP
// ==========================================
const additionalCss = `
    /* POTHOLE ROAD BUMP JOLT & HUD TOAST */
    @keyframes potholeJoltAnim {
      0% { transform: translateY(0) rotate(0deg); }
      15% { transform: translateY(-12px) rotate(-1.5deg) scale(0.99); }
      35% { transform: translateY(14px) rotate(1.2deg); }
      55% { transform: translateY(-8px) rotate(-0.8deg); }
      75% { transform: translateY(4px) rotate(0.4deg); }
      100% { transform: translateY(0) rotate(0deg) scale(1); }
    }
    .pothole-jolt {
      animation: potholeJoltAnim 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
    }

    .pothole-hud-toast {
      position: absolute;
      top: 50px;
      left: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.94);
      border: 1.5px solid #F59E0B;
      border-radius: 12px;
      padding: 10px 14px;
      color: #FBBF24;
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      z-index: 50;
      box-shadow: 0 4px 18px rgba(245, 158, 11, 0.4);
      display: none;
      animation: toastDrop 0.25s ease-out;
    }

    /* VEHICLE OPERATION MODE SELECTOR */
    .btn-mode-toggle {
      background: var(--surface-muted);
      border: 1.5px solid var(--border-light);
      border-radius: 12px;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .btn-mode-toggle.active {
      background: #EFF6FF;
      border-color: #2563EB;
      color: #1D4ED8;
      box-shadow: 0 2px 6px rgba(37,99,235,0.15);
    }
`;

html = html.replace('/* REAL LEAFLET MAP WRAPPER */', `${additionalCss}\n    /* REAL LEAFLET MAP WRAPPER */`);

// ==========================================
// 2. CHANGE 2: REMOVE "SIMULATE ROAD BUMP" FROM UNDER FRONT CAMERA
// ==========================================
// Old driver-actions had 3 buttons
const oldDriverActions = `            <!-- Bottom Driver Action Controls -->
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
            </div>`;

// New driver-actions: Road bump removed from mobile cockpit, only 2 essential driver buttons remain!
const newDriverActions = `            <!-- Bottom Driver Action Controls -->
            <div class="driver-actions">
              <button class="btn-primary" id="btnToggleCam" onclick="toggleFrontCamera()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span id="btnToggleCamText">Start AI Front Camera</span>
              </button>
              
              <!-- HIGH-IMPACT END SHIFT BUTTON -->
              <button class="btn-end-shift" onclick="showSummaryView()">
                <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path d="M4 4v16"/>
                </svg>
                <span id="t_endShift">🏁 End Shift & View Safety Scorecard</span>
              </button>
            </div>`;

html = html.replace(oldDriverActions, newDriverActions);

// Add pothole toast overlay inside camera card
const oldCamFallback = `              <div class="camera-fallback-graphic" id="cameraFallback">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <div style="font-size:14px; font-weight:800; color:#E2E8F0;" id="t_frontCamReady">Front Camera Ready</div>
                <div style="font-size:11px; color:#94A3B8; max-width:230px;" id="t_tapStartCam">Tap "Start AI Front Camera" below to initiate real-time facial landmark detection</div>
              </div>`;

const newCamFallback = `              <div class="pothole-hud-toast" id="potholeToast">
                ⚡ AIS-140 ACCELEROMETER: &gt;1.8G ROAD SHOCK DETECTED (False Alarms Suppressed 650ms)
              </div>
              <div class="camera-fallback-graphic" id="cameraFallback">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <div style="font-size:14px; font-weight:800; color:#E2E8F0;" id="t_frontCamReady">Front Camera Ready</div>
                <div style="font-size:11px; color:#94A3B8; max-width:230px;" id="t_tapStartCam">Tap "Start AI Front Camera" below to initiate real-time facial landmark detection</div>
              </div>`;

html = html.replace(oldCamFallback, newCamFallback);

// ==========================================
// 3. CHANGE 1: ADD SHIFT / TRAVELLING DURATION TO SCORECARD
// ==========================================
const oldSummaryMetrics = `            <div style="background:var(--surface-muted); border:1px solid var(--border-light); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:8px;">
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
            </div>`;

const newSummaryMetrics = `            <div style="background:var(--surface-muted); border:1px solid var(--border-light); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; padding-bottom:6px; border-bottom:1px solid var(--border-light);">
                <span style="color:var(--text-muted); font-weight:700;" id="t_summaryDriveTime">Shift / Travel Duration:</span>
                <strong id="summaryDriveTime" style="font-family:'JetBrains Mono'; color:#1D4ED8; font-size:13px;">00m 00s</strong>
              </div>
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
            </div>`;

html = html.replace(oldSummaryMetrics, newSummaryMetrics);

// ==========================================
// 4. CHANGE 3: WHATSAPP ESCALATION ON BUZZER >= 4 SECONDS
// ==========================================
// Add Vehicle Operation Mode to Onboarding
const oldVehicleRegGroup = `            <div class="form-group">
              <label class="form-label" id="t_vehicleReg">Vehicle Registration Number</label>
              <input type="text" class="form-input" id="inputVehicle" value="KA-01-AB-1234" placeholder="e.g. KA-01-AB-1234" style="font-family:'JetBrains Mono'; text-transform:uppercase;">
            </div>`;

const newVehicleRegGroup = `            <div class="form-group">
              <label class="form-label" id="t_vehicleReg">Vehicle Registration Number</label>
              <input type="text" class="form-input" id="inputVehicle" value="KA-01-AB-1234" placeholder="e.g. KA-01-AB-1234" style="font-family:'JetBrains Mono'; text-transform:uppercase;">
            </div>

            <div class="form-group">
              <label class="form-label">Vehicle Operation &amp; WhatsApp SOS Mode</label>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <button type="button" class="btn-mode-toggle active" id="btnModeFleet" onclick="setVehicleMode('fleet')">
                  🏢 Fleet Vehicle<br><span style="font-size:10px; font-weight:400; opacity:0.8;">Alerts Fleet Owner</span>
                </button>
                <button type="button" class="btn-mode-toggle" id="btnModeIndep" onclick="setVehicleMode('independent')">
                  🚗 Independent Driver<br><span style="font-size:10px; font-weight:400; opacity:0.8;">Alerts Driver WhatsApp</span>
                </button>
              </div>
            </div>`;

html = html.replace(oldVehicleRegGroup, newVehicleRegGroup);

// Update Level 2 Alert Modal Overlay to show live countdown & WhatsApp direct dispatch
const oldAlertModalOverlay = `        <!-- EMERGENCY SIREN MODAL (LEVEL 2) -->
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
        </div>`;

const newAlertModalOverlay = `        <!-- EMERGENCY SIREN MODAL (LEVEL 2) -->
        <div class="alert-modal-overlay" id="alertModalOverlay">
          <div class="alert-modal-content">
            <div class="alert-bell-icon">🔔</div>
            <div class="alert-title" id="alertModalTitle">CRITICAL: WAKE UP!</div>
            <div class="alert-subtitle" id="alertModalSubtitle">
              Sustained driver drowsiness detected. Loud cockpit alarm active. Pull over safely immediately.
            </div>

            <!-- AUTOMATIC ESCALATION TO WHATSAPP IF NOT RESPONDED WITHIN 4 SECONDS -->
            <div id="sirenEscalationBox" style="margin-top:14px; padding:12px; background:rgba(0,0,0,0.25); border-radius:14px; border:1px solid rgba(255,255,255,0.2); width:100%; box-sizing:border-box;">
              <div style="font-size:10px; font-weight:800; letter-spacing:0.8px; color:#FDE047; text-transform:uppercase;">
                ⚡ AIS-140 EMERGENCY PROTOCOL ESCALATION
              </div>
              <div id="sirenCountdownText" style="font-size:13px; font-weight:800; margin-top:4px; color:#FFFFFF;">
                🚨 Siren Active: 0.0s (Escalating to WhatsApp at 4.0s)
              </div>
              <div id="sirenEscalationAction" style="display:none; margin-top:10px;">
                <a id="btnWhatsAppDirectLink" href="#" target="_blank" class="btn-whatsapp-sos" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#22C55E; color:#FFFFFF; font-weight:800; font-size:12px; padding:10px 16px; border-radius:12px; text-decoration:none; box-shadow:0 4px 15px rgba(34,197,94,0.4); width:100%; box-sizing:border-box;">
                  <span>📲 Open Emergency WhatsApp SOS Chat &rarr;</span>
                </a>
              </div>
            </div>
          </div>
          <button class="btn-i-am-awake" id="btnIAmAwake" onclick="dismissEmergencyAlert()">
            <span id="t_btnIAmAwake">I AM AWAKE</span>
          </button>
        </div>`;

html = html.replace(oldAlertModalOverlay, newAlertModalOverlay);

// Update Pitch Simulator on Right Side to include Real WhatsApp Escalation button
const oldPitchSimGrid = `        <div class="btn-grid-sim">
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
        </div>`;

const newPitchSimGrid = `        <div class="btn-grid-sim">
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
            <strong style="#0284C7;">⚡ Test Pothole Shock</strong>
            <span style="font-size:10px; color:var(--text-muted);">Jolt, bump thump &amp; 650ms filter</span>
          </button>
          <button class="btn-sim-alert" onclick="simulateSirenEscalation()" style="grid-column:span 2; background:#FEF2F2; border-color:#FCA5A5;">
            <strong style="color:#DC2626;">📲 Test &ge;4s Buzzer WhatsApp Dispatch</strong>
            <span style="font-size:10px; color:var(--text-muted);">Simulate 4s unacknowledged buzzer &amp; auto-dispatch WhatsApp SOS</span>
          </button>
        </div>`;

html = html.replace(oldPitchSimGrid, newPitchSimGrid);

// ==========================================
// 5. UPDATE JAVASCRIPT FUNCTIONS
// ==========================================

// Add translations for summaryDriveTime to all 12 languages
const timeTranslations = {
  en: 'Shift / Travel Duration:',
  hi: 'शिफ्ट / यात्रा की अवधि:',
  kn: 'ಶಿಫ್ಟ್ / ಪ್ರಯಾಣದ ಅವಧಿ:',
  ta: 'பயண கால அளவு:',
  te: 'ప్రయాణ వ్యవధి:',
  mr: 'प्रवासाचा कालावधी:',
  bn: 'ভ্রমণের সময়সীমা:',
  gu: 'મુસાફરીનો સમયગાળો:',
  ml: 'യാത്രാ ദൈർഘ്യം:',
  pa: 'ਸਫ਼ਰ ਦਾ ਸਮਾਂ:',
  or: 'ଯାତ୍ରା ସମୟସୀମା:',
  as: 'যাত্ৰাৰ সময়:'
};

Object.keys(timeTranslations).forEach(code => {
  const marker = `${code}: {`;
  const insertText = `summaryDriveTime: "${timeTranslations[code]}",\n        `;
  html = html.replace(marker, `${marker}\n        ${insertText}`);
});

// Update applyLanguage to include summaryDriveTime
const oldApplyLangScorecard = `      // 4. Shift Safety Scorecard (Complete Native Translation for all 12 Languages)
      const tShiftSummaryTitle = document.getElementById('t_shiftSummaryTitle');
      const dispSummaryShiftTime = document.getElementById('dispSummaryShiftTime');
      const tOverallScoreLabel = document.getElementById('t_overallScoreLabel');
      const tSummaryMicrosleeps = document.getElementById('t_summaryMicrosleeps');
      const tSummaryHeadDrops = document.getElementById('t_summaryHeadDrops');
      const tSummaryYawns = document.getElementById('t_summaryYawns');
      const tSummaryDistance = document.getElementById('t_summaryDistance');
      const tBtnCompleteNewShift = document.getElementById('t_btnCompleteNewShift');
      const tBtnResumeShift = document.getElementById('t_btnResumeShift');

      if (tShiftSummaryTitle) tShiftSummaryTitle.textContent = dict.shiftSummaryTitle || 'Shift Safety Scorecard';
      if (dispSummaryShiftTime) dispSummaryShiftTime.textContent = dict.dispSummaryShiftTime || 'Commercial Fleet AI Audit';
      if (tOverallScoreLabel) tOverallScoreLabel.textContent = dict.overallScoreLabel || 'Overall Safety Score';
      if (tSummaryMicrosleeps) tSummaryMicrosleeps.textContent = dict.summaryMicrosleeps || 'Microsleep Events (≥1.2s):';
      if (tSummaryHeadDrops) tSummaryHeadDrops.textContent = dict.summaryHeadDrops || 'Head Drops (≥1.5s):';
      if (tSummaryYawns) tSummaryYawns.textContent = dict.summaryYawns || 'Yawn Fatigue Events:';
      if (tSummaryDistance) tSummaryDistance.textContent = dict.summaryDistance || 'Distance Covered:';
      if (tBtnCompleteNewShift) tBtnCompleteNewShift.textContent = dict.btnCompleteNewShift || 'Complete Shift & Start New Ride';
      if (tBtnResumeShift) tBtnResumeShift.textContent = dict.btnResumeShift || 'Resume Current Shift';`;

const newApplyLangScorecard = `      // 4. Shift Safety Scorecard (Complete Native Translation for all 12 Languages)
      const tShiftSummaryTitle = document.getElementById('t_shiftSummaryTitle');
      const dispSummaryShiftTime = document.getElementById('dispSummaryShiftTime');
      const tOverallScoreLabel = document.getElementById('t_overallScoreLabel');
      const tSummaryDriveTime = document.getElementById('t_summaryDriveTime');
      const tSummaryMicrosleeps = document.getElementById('t_summaryMicrosleeps');
      const tSummaryHeadDrops = document.getElementById('t_summaryHeadDrops');
      const tSummaryYawns = document.getElementById('t_summaryYawns');
      const tSummaryDistance = document.getElementById('t_summaryDistance');
      const tBtnCompleteNewShift = document.getElementById('t_btnCompleteNewShift');
      const tBtnResumeShift = document.getElementById('t_btnResumeShift');

      if (tShiftSummaryTitle) tShiftSummaryTitle.textContent = dict.shiftSummaryTitle || 'Shift Safety Scorecard';
      if (dispSummaryShiftTime) dispSummaryShiftTime.textContent = dict.dispSummaryShiftTime || 'Commercial Fleet AI Audit';
      if (tOverallScoreLabel) tOverallScoreLabel.textContent = dict.overallScoreLabel || 'Overall Safety Score';
      if (tSummaryDriveTime) tSummaryDriveTime.textContent = dict.summaryDriveTime || 'Shift / Travel Duration:';
      if (tSummaryMicrosleeps) tSummaryMicrosleeps.textContent = dict.summaryMicrosleeps || 'Microsleep Events (≥1.2s):';
      if (tSummaryHeadDrops) tSummaryHeadDrops.textContent = dict.summaryHeadDrops || 'Head Drops (≥1.5s):';
      if (tSummaryYawns) tSummaryYawns.textContent = dict.summaryYawns || 'Yawn Fatigue Events:';
      if (tSummaryDistance) tSummaryDistance.textContent = dict.summaryDistance || 'Distance Covered:';
      if (tBtnCompleteNewShift) tBtnCompleteNewShift.textContent = dict.btnCompleteNewShift || 'Complete Shift & Start New Ride';
      if (tBtnResumeShift) tBtnResumeShift.textContent = dict.btnResumeShift || 'Resume Current Shift';`;

html = html.replace(oldApplyLangScorecard, newApplyLangScorecard);

// Replace triggerPotholeShock with real audible + visible + haptic bump action
const oldPotholeFunc = `    // --- POTHOLE / ROAD BUMP SHOCK ABSORPTION ---
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
    }`;

const newPotholeFunc = `    // --- POTHOLE / ROAD BUMP SHOCK ABSORPTION & AUDIO THUMP ---
    function playPotholeSound() {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch(e) {}
    }

    function triggerPotholeShock() {
      const now = Date.now();
      potholeCooldownUntil = now + 650;
      playPotholeSound();

      // Physical road shock vibration jolt animation on mobile frame & camera
      const phone = document.getElementById('devicePhone');
      if (phone) {
        phone.classList.remove('pothole-jolt');
        void phone.offsetWidth; // trigger reflow
        phone.classList.add('pothole-jolt');
        setTimeout(() => {
          phone.classList.remove('pothole-jolt');
        }, 600);
      }

      // Camera HUD floating toast
      const toast = document.getElementById('potholeToast');
      if (toast) {
        toast.style.display = 'block';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 650);
      }

      // Suppress false alarms & reset active eye closure / head drop
      eyeClosedStartTime = null;
      headDropStartTime = null;
      yawnStartTime = null;
      const fill = document.getElementById('closureLineFill');
      if (fill) {
        fill.style.width = '0%';
        fill.style.backgroundColor = 'var(--safety-orange)';
      }

      const badge = document.getElementById('globalStatusPill');
      if (badge) {
        badge.textContent = '⚡ BUMP (>1.8G) SUPPRESSED (650ms)';
        badge.style.background = '#FEF3C7';
        badge.style.color = '#D97706';
        setTimeout(() => {
          badge.textContent = 'Live Web Vision Active';
          badge.style.background = 'var(--status-green-light)';
          badge.style.color = 'var(--status-green)';
        }, 650);
      }

      logEvent('SENSORS: Pothole / bump shock (>1.8G) detected. Accelerometer suppression gate active for 650ms.');
    }`;

html = html.replace(oldPotholeFunc, newPotholeFunc);

// Add shiftStartTime, isVehicleFleetMode, and WhatsApp Escalation functions
const oldAlertRecoveryFuncs = `    // --- EMERGENCY ALERTS & RECOVERY ---
    function speakVoiceAlert(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const ut = new SpeechSynthesisUtterance(text);
          ut.rate = 1.05;
          window.speechSynthesis.speak(ut);
        } catch(e) {}
      }
    }

    function triggerEmergencyModal(titleText) {
      speakVoiceAlert(titleText || 'Warning! Critical driver drowsiness detected.');
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
    }`;

const newAlertRecoveryFuncs = `    // --- VEHICLE MODE & DRIVE SHIFT DURATION ---
    let shiftStartTime = Date.now();
    let isVehicleFleetMode = true; // true = Fleet, false = Independent
    let sirenStartTime = null;
    let sirenEscalationTimer = null;
    let isWhatsAppDispatched = false;

    function setVehicleMode(mode) {
      isVehicleFleetMode = (mode === 'fleet');
      const btnFleet = document.getElementById('btnModeFleet');
      const btnIndep = document.getElementById('btnModeIndep');
      if (btnFleet && btnIndep) {
        if (isVehicleFleetMode) {
          btnFleet.classList.add('active');
          btnIndep.classList.remove('active');
        } else {
          btnIndep.classList.add('active');
          btnFleet.classList.remove('active');
        }
      }
      logEvent('CONFIG: Vehicle mode set to ' + (isVehicleFleetMode ? 'Fleet Truck (Owner Alerts)' : 'Independent Driver (Driver Alerts)'));
    }

    // --- EMERGENCY ALERTS & >=4s WHATSAPP ESCALATION ---
    function speakVoiceAlert(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const ut = new SpeechSynthesisUtterance(text);
          ut.rate = 1.05;
          window.speechSynthesis.speak(ut);
        } catch(e) {}
      }
    }

    function triggerEmergencyModal(titleText) {
      speakVoiceAlert(titleText || 'Warning! Critical driver drowsiness detected.');
      isLevel2AlarmActive = true;
      startLevel2CockpitSiren();
      const modal = document.getElementById('alertModalOverlay');
      const title = document.getElementById('alertModalTitle');
      if (title) title.textContent = titleText || 'CRITICAL: WAKE UP!';
      if (modal) modal.style.display = 'flex';
      
      startEmergencyEscalation();
    }

    function startEmergencyEscalation() {
      sirenStartTime = Date.now();
      isWhatsAppDispatched = false;
      const box = document.getElementById('sirenEscalationBox');
      const text = document.getElementById('sirenCountdownText');
      const action = document.getElementById('sirenEscalationAction');
      if (box) box.style.display = 'block';
      if (action) action.style.display = 'none';

      if (sirenEscalationTimer) clearInterval(sirenEscalationTimer);

      sirenEscalationTimer = setInterval(() => {
        if (!isLevel2AlarmActive) {
          clearInterval(sirenEscalationTimer);
          sirenEscalationTimer = null;
          return;
        }

        const elapsedSec = (Date.now() - sirenStartTime) / 1000;
        if (text) {
          if (elapsedSec < 4.0) {
            text.innerHTML = '🚨 Siren Active: <strong style="color:#F87171;">' + elapsedSec.toFixed(1) + 's</strong> <span style="opacity:0.8; font-size:11px;">(Escalating to WhatsApp at 4.0s)</span>';
          } else {
            text.innerHTML = '🚨 <strong style="color:#EF4444;">UNRESPONSIVE (' + elapsedSec.toFixed(1) + 's)!</strong> <span style="color:#86EFAC;">WhatsApp SOS Dispatched!</span>';
          }
        }

        if (elapsedSec >= 4.0 && !isWhatsAppDispatched) {
          isWhatsAppDispatched = true;
          dispatchEmergencyWhatsApp();
        }
      }, 100);
    }

    function dispatchEmergencyWhatsApp() {
      const vReg = document.getElementById('dispVehicleTag')?.textContent || 'KA-01-AB-1234';
      const dName = document.getElementById('dispDriverTag')?.textContent || 'Ramesh Kumar';
      const dMobile = document.getElementById('inputMobile')?.value || '+91 98765 43210';
      const speed = document.getElementById('speedKmhText')?.textContent || '42 km/h';
      
      // Fleet Owner vs Independent Driver target
      const ownerMobile = document.getElementById('ownerPhone')?.value || '+91 99001 24567';
      const ownerName = document.getElementById('ownerName')?.value || 'Vikramaditya Hegde';
      const company = document.getElementById('ownerCompany')?.value || 'VRL National Logistics Ltd.';
      
      const recipientPhone = isVehicleFleetMode ? ownerMobile : dMobile;
      const recipientLabel = isVehicleFleetMode ? 'Fleet Owner (' + ownerName + ' • ' + ownerMobile + ')' : 'Independent Driver (' + dName + ' • ' + dMobile + ')';
      const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

      const waLines = [
        '🚨 *JAAGRAT AIS-140 CRITICAL SOS: DRIVER UNRESPONSIVE* 🚨',
        '----------------------------------------',
        '⚠️ *IMMEDIATE ATTENTION REQUIRED:* Cockpit fatigue siren has sounded for >4 SECONDS without driver acknowledgement!',
        '',
        '🚛 *Vehicle Registration:* ' + vReg,
        '👤 *Driver Name:* ' + dName + ' (' + dMobile + ')',
        '🏢 *Operations Profile:* ' + (isVehicleFleetMode ? company : 'Independent Commercial Driver'),
        '⚡ *Speed:* ' + speed + ' (Moving • High Risk)',
        '📍 *Corridor:* South Corridor (Bengaluru - Hyderabad NH-44)',
        '⏰ *Alert Time:* ' + new Date().toLocaleTimeString(),
        '',
        '🚨 *REQUIRED SAFETY PROTOCOL:*',
        '1. Call driver immediately to verify consciousness.',
        '2. Live Fleet Radar: https://jaagrat01.vercel.app/'
      ];

      const waMsg = waLines.join('\\n');
      const waUrl = 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(waMsg);

      const action = document.getElementById('sirenEscalationAction');
      const link = document.getElementById('btnWhatsAppDirectLink');
      if (link) {
        link.href = waUrl;
        link.innerHTML = '<span>📲 WhatsApp SOS Sent to ' + (isVehicleFleetMode ? 'Owner (' + ownerMobile + ')' : 'Driver (' + dMobile + ')') + ' &rarr;</span>';
      }
      if (action) action.style.display = 'block';

      // Automatically attempt window.open to open real WhatsApp chat
      try {
        window.open(waUrl, '_blank');
      } catch(e) {
        console.log('Automated popup blocked, clickable link displayed in modal.');
      }

      logEvent('CRITICAL SOS: Cockpit siren >4s unresponsive. Real WhatsApp emergency alert dispatched to ' + recipientLabel);
      playDispatchChime();
    }

    function dismissEmergencyAlert() {
      isLevel2AlarmActive = false;
      if (sirenEscalationTimer) {
        clearInterval(sirenEscalationTimer);
        sirenEscalationTimer = null;
      }
      stopLevel2CockpitSiren();
      document.getElementById('alertModalOverlay').style.display = 'none';
      document.getElementById('closureLineFill').style.width = '0%';
      document.getElementById('closureLineFill').style.backgroundColor = 'var(--safety-orange)';
      updateDriverStatus('focused');
      logEvent('RECOVERY: Driver acknowledged alert / opened eyes. Shift resumed.');
    }

    function simulateSirenEscalation() {
      triggerEmergencyModal('TEST: >4s UNRESPONSIVE SIREN ESCALATION');
      logEvent('SIMULATION: Testing 4-second buzzer WhatsApp escalation.');
    }`;

html = html.replace(oldAlertRecoveryFuncs, newAlertRecoveryFuncs);

// Update authenticateAndStartDrive to initialize shiftStartTime
const oldAuthDrive = `      startSpeedometer();
      logEvent('AUTHENTICATION: Driver ' + dName + ' (' + vReg + ') authenticated. Drive shift active.');
    }`;

const newAuthDrive = `      startSpeedometer();
      shiftStartTime = Date.now();
      logEvent('AUTHENTICATION: Driver ' + dName + ' (' + vReg + ') authenticated. Drive shift active.');
    }`;

html = html.replace(oldAuthDrive, newAuthDrive);

// Update showSummaryView to compute and display Travel Duration
const oldShowSummary = `      document.getElementById('summaryScoreValue').textContent = score;
      document.getElementById('summaryMicrosleeps').textContent = microsleepCount;
      document.getElementById('summaryHeadDrops').textContent = headDropCount;
      document.getElementById('summaryYawns').textContent = yawnCount;`;

const newShowSummary = `      document.getElementById('summaryScoreValue').textContent = score;
      document.getElementById('summaryMicrosleeps').textContent = microsleepCount;
      document.getElementById('summaryHeadDrops').textContent = headDropCount;
      document.getElementById('summaryYawns').textContent = yawnCount;

      // Compute and format shift / travelling time
      const elapsedMs = Date.now() - shiftStartTime;
      const totalSec = Math.max(5, Math.floor(elapsedMs / 1000));
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      let timeStr = '';
      if (hrs > 0) {
        timeStr = hrs + 'h ' + String(mins).padStart(2, '0') + 'm ' + String(secs).padStart(2, '0') + 's';
      } else {
        timeStr = mins + 'm ' + String(secs).padStart(2, '0') + 's';
      }

      const driveTimeEl = document.getElementById('summaryDriveTime');
      if (driveTimeEl) driveTimeEl.textContent = timeStr;

      const subtitleEl = document.getElementById('dispSummaryShiftTime');
      if (subtitleEl) {
        const dict = i18n[currentLang] || i18n.en;
        subtitleEl.textContent = (dict.dispSummaryShiftTime || 'Commercial Fleet AI Audit') + ' • ' + timeStr;
      }`;

html = html.replace(oldShowSummary, newShowSummary);

// Update completeShiftAndStartNew to reset shiftStartTime for fresh trip
const oldCompleteShiftReset = `      // 2. Driver remains logged in forever! Start new ride directly in Active Drive view!
      document.getElementById('viewSummary').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'flex';
      updateDriverStatus('focused');`;

const newCompleteShiftReset = `      // 2. Driver remains logged in forever! Start new ride directly in Active Drive view!
      shiftStartTime = Date.now();
      document.getElementById('viewSummary').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'flex';
      updateDriverStatus('focused');`;

html = html.replace(oldCompleteShiftReset, newCompleteShiftReset);

// Write to index.html and web/index.html
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully written index.html and web/index.html with all 3 features!');
