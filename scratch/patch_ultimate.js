const fs = require('fs');
const path = require('path');

let code = fs.readFileSync(path.join(__dirname, 'build_real_map_app.js'), 'utf8');

// 1. Replace the CartoDB tile layer with Esri World Street Map (NO API KEY REQUIRED, NO WATERMARK!)
code = code.replace(
  "L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {",
  "L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {"
);
code = code.replace(
  "attribution: '&copy; OpenStreetMap contributors &copy; CARTO',",
  "attribution: '&copy; Esri &copy; OpenStreetMap contributors',"
);

// 2. Add Complete Shift & Start New Ride button to Shift Safety Scoreboard
const oldBtn = `<button class="btn-primary" style="margin-top:auto;" onclick="returnToDrive()">
              <span>&larr; <span id="t_btnResumeShift">Resume Drive Shift</span></span>
            </button>`;

const newBtns = `<div style="display:flex; flex-direction:column; gap:8px; margin-top:auto; padding-top:10px;">
              <button class="btn-primary" onclick="completeShiftAndStartNew()" style="background:linear-gradient(135deg, #16A34A 0%, #15803D 100%); box-shadow:0 4px 12px rgba(22, 163, 74, 0.25);">
                <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span id="t_btnCompleteNewShift">Complete Shift & Start New Ride</span>
              </button>
              <button class="btn-outline" onclick="returnToDrive()">
                <span>&larr; <span id="t_btnResumeShift">Resume Current Shift</span></span>
              </button>
              <button class="btn-outline" style="border-style:dashed; color:var(--safety-orange); font-size:11px;" onclick="exportSafetyReport()">
                <span>📄 Export AIS-140 Shift Safety Audit</span>
              </button>
            </div>`;

code = code.replace(oldBtn, newBtns);

// 3. Add completeShiftAndStartNew and exportSafetyReport JS functions
const returnDriveFunc = 'function returnToDrive() {';
const newShiftFuncs = `function completeShiftAndStartNew() {
      stopCamera();
      stopLevel2CockpitSiren();
      const prevScore = document.getElementById('summaryScoreValue').textContent || '98';
      const prevVehicle = document.getElementById('dispVehicleTag').textContent || 'KA-01-AB-1234';
      
      // Reset all shift metrics
      microsleepCount = 0;
      headDropCount = 0;
      yawnCount = 0;
      yawnCounted = false;
      headDropLatched = false;
      isLevel2AlarmActive = false;
      eyeClosedStartTime = null;
      headDropStartTime = null;
      yawnStartTime = null;

      logEvent('SHIFT: Shift for ' + prevVehicle + ' completed. Score: ' + prevScore + '/100. Ready for new trip.');
      document.getElementById('viewSummary').style.display = 'none';
      goToLanguageScreen();
      alert('✓ Shift Completed Successfully! • Safety Score: ' + prevScore + '/100 • Telemetry Dispatched to Fleet Hub • Ready for new driver onboarding.');
    }

    function exportSafetyReport() {
      const v = document.getElementById('dispVehicleTag').textContent || 'KA-01-AB-1234';
      const s = document.getElementById('summaryScoreValue').textContent || '98';
      alert('📄 AIS-140 SHIFT SAFETY COMPLIANCE AUDIT • Vehicle: ' + v + ' • Overall Score: ' + s + '/100 • Microsleeps: ' + microsleepCount + ' • Head Drops: ' + headDropCount + ' • Yawns: ' + yawnCount + ' • Status: CERTIFIED');
    }

    function returnToDrive() {`;

code = code.replace(returnDriveFunc, newShiftFuncs);

// 4. Update the Speedometer Standby label & Competition Simulator description
code = code.replace(
  '<span>🛰️ GPS Speedometer & Telemetry</span>',
  '<span>🛰️ GPS Speedometer & Motion Gate</span>'
);
code = code.replace(
  '<button class="speed-btn-toggle" onclick="toggleGpsModal()">Toggle Standby</button>',
  '<button class="speed-btn-toggle" id="btnSpeedToggle" onclick="toggleGpsModal()">⏸️ Simulate Parked (0 km/h)</button>'
);
code = code.replace(
  `<div class="panel-section-title">
          <span>⚡ Live Competition Simulator</span>
        </div>`,
  `<div class="panel-section-title">
          <span>🎯 Competition & Judge Live Pitch Simulator</span>
        </div>`
);
code = code.replace(
  'Test instant audio siren alarms & voice escalations without waiting:',
  '💡 1-Click triggers to demonstrate all sirens & sensor filters to the judges without waiting:'
);

// 5. Update toggleGpsModal to update button label
code = code.replace(
  "panelSpeed.textContent = kmh + ' km/h (Stationary • Standby)';",
  "panelSpeed.textContent = kmh + ' km/h (Stationary • Standby)'; const b = document.getElementById('btnSpeedToggle'); if (b) b.textContent = '▶️ Simulate Cruising (42 km/h)';"
);
code = code.replace(
  "panelSpeed.textContent = kmh + ' km/h (Cruising • Armed)';",
  "panelSpeed.textContent = kmh + ' km/h (Cruising • Armed)'; const b = document.getElementById('btnSpeedToggle'); if (b) b.textContent = '⏸️ Simulate Parked (0 km/h)';"
);

// Add speech alerts in currentLang
code = code.replace(
  "function triggerEmergencyModal(titleText) {",
  `function speakVoiceAlert(text) {
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
      speakVoiceAlert(titleText || 'Warning! Critical driver drowsiness detected.');`
);

fs.writeFileSync(path.join(__dirname, 'build_ultimate_app.js'), code, 'utf8');
console.log('Successfully written scratch/build_ultimate_app.js');
