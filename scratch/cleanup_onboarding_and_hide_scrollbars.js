const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// ==========================================
// 1. ADD UNIVERSAL SCROLLBAR ELIMINATION CSS
// ==========================================
const scrollbarHideCss = `
    /* ======================================================== */
    /* REMOVE ALL SCROLLBARS FOR CLEAN IMMERSIVE MOBILE SCREEN   */
    /* ======================================================== */
    *::-webkit-scrollbar,
    ::-webkit-scrollbar {
      width: 0px !important;
      height: 0px !important;
      display: none !important;
      background: transparent !important;
    }

    *,
    html,
    body,
    .app-screen,
    .lang-grid-12,
    .mobile-frame,
    .device-phone,
    .login-view,
    .summary-view,
    .drive-view,
    .control-panel,
    .live-stream-log {
      -ms-overflow-style: none !important;  /* IE and Edge */
      scrollbar-width: none !important;     /* Firefox */
    }
`;

html = html.replace('/* REAL LEAFLET MAP WRAPPER */', `${scrollbarHideCss}\n    /* REAL LEAFLET MAP WRAPPER */`);

// ==========================================
// 2. REMOVE ALL DEVELOPER GATEWAY & API KEY INPUTS FROM DRIVER ONBOARDING
// ==========================================
const oldOnboardingModeSection = `            <div class="form-group">
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
            </div>

            <!-- AUTOMATED ZERO-CLICK WHATSAPP DISPATCH (GREEN-API / CALLMEBOT) -->
            <div class="form-group" style="background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:14px; padding:12px; margin-top:4px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label class="form-label" style="color:#15803D; margin-bottom:0; font-weight:800;">⚡ Real Automated WhatsApp Dispatch Gateway</label>
                <span style="font-size:10px; font-weight:800; background:#DCFCE7; color:#16A34A; padding:2px 8px; border-radius:12px;">Zero-Click Delivery</span>
              </div>
              <div style="font-size:11px; color:#334155; margin:4px 0 8px 0; line-height:1.4;">
                Delivers actual incoming WhatsApp messages to the phone automatically when the 5s siren triggers (no drafting, zero manual clicking!).
              </div>
              
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Recipient WhatsApp Phone</label>
                  <input type="tel" class="form-input" id="cfgWhatsAppPhone" value="+91 99001 24567" placeholder="+91 XXXXXXXXXX" style="font-size:12px; padding:8px 10px;">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Green-API Instance ID</label>
                  <input type="text" class="form-input" id="cfgGreenId" placeholder="e.g. 7103123456" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
              </div>

              <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:8px; margin-top:6px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Green-API Token</label>
                  <input type="password" class="form-input" id="cfgGreenToken" placeholder="apiTokenInstance" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">CallMeBot Key (Alt)</label>
                  <input type="text" class="form-input" id="cfgWhatsAppApiKey" placeholder="API Key" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button type="button" class="btn-outline" style="border:none; padding:4px 8px; font-size:11px; color:#16A34A; font-weight:800;" onclick="testWhatsAppGateway()">
                  <span>📲 Send Instant Test WhatsApp</span>
                </button>
                <a href="https://green-api.com/" target="_blank" style="font-size:10px; color:#0284C7; font-weight:700; text-decoration:underline;">
                  Get Free Green-API in 1 min &rarr;
                </a>
              </div>
            </div>`;

const newOnboardingModeSection = `            <div class="form-group">
              <label class="form-label" id="t_vehicleReg">Vehicle Registration Number</label>
              <input type="text" class="form-input" id="inputVehicle" value="KA-01-AB-1234" placeholder="e.g. KA-01-AB-1234" style="font-family:'JetBrains Mono'; text-transform:uppercase;">
            </div>`;

html = html.replace(oldOnboardingModeSection, newOnboardingModeSection);

// ==========================================
// 3. REMOVE CALLMEBOT INPUT FROM FLEET OWNER LOGIN
// ==========================================
const oldFleetPasscode = `          <div class="form-group">
            <label class="form-label">Fleet Access Passcode</label>
            <input type="password" class="form-input" id="ownerPasscode" value="FLEET-VRL-2026" style="font-family:'JetBrains Mono';">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Automated WhatsApp Gateway API Key (CallMeBot Free API)</label>
          <input type="text" class="form-input" id="ownerCallMeBotKey" placeholder="Optional: Enter CallMeBot API Key for automatic delivery" style="font-family:'JetBrains Mono';">
        </div>`;

const newFleetPasscode = `          <div class="form-group">
            <label class="form-label">Fleet Access Passcode</label>
            <input type="password" class="form-input" id="ownerPasscode" value="FLEET-VRL-2026" style="font-family:'JetBrains Mono';">
          </div>
        </div>`;

html = html.replace(oldFleetPasscode, newFleetPasscode);

// ==========================================
// 4. CLEAN UP EMERGENCY SIREN MODAL
// ==========================================
const oldSirenBox = `            <!-- AUTOMATIC ESCALATION TO WHATSAPP IF UNRESPONSIVE FOR 5 SECONDS -->
            <div id="sirenEscalationBox" style="margin-top:14px; padding:12px; background:rgba(0,0,0,0.35); border-radius:14px; border:1px solid rgba(255,255,255,0.25); width:100%; box-sizing:border-box;">
              <div style="font-size:10px; font-weight:800; letter-spacing:0.8px; color:#FDE047; text-transform:uppercase;">
                ⚡ AIS-140 AUTOMATIC CLOUD EMERGENCY ESCALATION
              </div>
              <div id="sirenCountdownText" style="font-size:13px; font-weight:800; margin-top:4px; color:#FFFFFF;">
                🚨 Siren Active: 0.0s (Auto-dispatching to WhatsApp at 5.0s)
              </div>
              <div id="sirenEscalationAction" style="display:none; margin-top:10px; background:rgba(34,197,94,0.2); border:1px solid #22C55E; border-radius:10px; padding:10px;">
                <div style="font-size:11px; font-weight:900; color:#86EFAC;">
                  ✓ AUTOMATIC WHATSAPP ALERT SENT TO OWNER!
                </div>
                <div style="font-size:10px; color:#E2E8F0; margin-top:2px;" id="sirenAutoSentDetails">
                  Dispatched to Fleet Owner (+91 99001 24567) via AIS-140 Telemetry Gateway. Driver intervention not required.
                </div>
              </div>
            </div>`;

const newSirenBox = `            <!-- AIS-140 AUTOMATIC CLOUD EMERGENCY ESCALATION (>= 5s) -->
            <div id="sirenEscalationBox" style="margin-top:14px; padding:12px; background:rgba(0,0,0,0.4); border-radius:14px; border:1px solid rgba(255,255,255,0.2); width:100%; box-sizing:border-box;">
              <div style="font-size:10px; font-weight:800; letter-spacing:0.8px; color:#FDE047; text-transform:uppercase;">
                ⚡ AIS-140 FLEET SAFETY ESCALATION
              </div>
              <div id="sirenCountdownText" style="font-size:13px; font-weight:800; margin-top:4px; color:#FFFFFF;">
                🚨 Siren Active: 0.0s (Fleet Command Escalation at 5.0s)
              </div>
              <div id="sirenEscalationAction" style="display:none; margin-top:10px; background:rgba(239,68,68,0.25); border:1px solid #EF4444; border-radius:10px; padding:10px;">
                <div style="font-size:11px; font-weight:900; color:#FCA5A5;">
                  🚨 CRITICAL FATIGUE: FLEET OPERATIONS RED ALERT LOGGED!
                </div>
                <div style="font-size:10px; color:#E2E8F0; margin-top:2px;" id="sirenAutoSentDetails">
                  Driver unresponsive for &gt;5.0s. High-decibel cockpit siren sounding. Telemetry transmitted to Fleet Operations Center.
                </div>
              </div>
            </div>`;

html = html.replace(oldSirenBox, newSirenBox);

// ==========================================
// 5. UPDATE PITCH SIMULATOR BUTTON
// ==========================================
html = html.replace(
  '<strong style="color:#DC2626;">📲 Test &ge;5s Buzzer WhatsApp Auto-Dispatch</strong>\n            <span style="font-size:10px; color:var(--text-muted);">Auto-dispatches to WhatsApp after 5s without driver clicking</span>',
  '<strong style="color:#DC2626;">🚨 Test &ge;5s Unresponsive Siren Escalation</strong>\n            <span style="font-size:10px; color:var(--text-muted);">Simulates 5s unacknowledged buzzer &amp; dispatches AIS-140 Fleet Red Alert</span>'
);

// ==========================================
// 6. CLEAN UP JAVASCRIPT ESCALATION LOGIC (NO API KEYS / TOKENS)
// ==========================================
const oldEscalationTimerJs = `        const elapsedSec = (Date.now() - sirenStartTime) / 1000;
        if (text) {
          if (elapsedSec < 5.0) {
            text.innerHTML = '🚨 Siren Active: <strong style="color:#F87171;">' + elapsedSec.toFixed(1) + 's</strong> <span style="opacity:0.8; font-size:11px;">(Auto-dispatching to WhatsApp at 5.0s)</span>';
          } else {
            text.innerHTML = '🚨 <strong style="color:#EF4444;">UNRESPONSIVE (' + elapsedSec.toFixed(1) + 's)!</strong> <span style="color:#86EFAC;">AUTOMATIC WHATSAPP ALERT SENT!</span>';
          }
        }

        if (elapsedSec >= 5.0 && !isWhatsAppDispatched) {
          isWhatsAppDispatched = true;
          dispatchEmergencyWhatsApp();
        }`;

const newEscalationTimerJs = `        const elapsedSec = (Date.now() - sirenStartTime) / 1000;
        if (text) {
          if (elapsedSec < 5.0) {
            text.innerHTML = '🚨 Siren Active: <strong style="color:#F87171;">' + elapsedSec.toFixed(1) + 's</strong> <span style="opacity:0.8; font-size:11px;">(Fleet Red Alert at 5.0s)</span>';
          } else {
            text.innerHTML = '🚨 <strong style="color:#EF4444;">UNRESPONSIVE (' + elapsedSec.toFixed(1) + 's)!</strong> <span style="color:#FCA5A5;">AIS-140 FLEET RED ALERT ACTIVE!</span>';
          }
        }

        if (elapsedSec >= 5.0 && !isWhatsAppDispatched) {
          isWhatsAppDispatched = true;
          dispatchEmergencyEscalation();
        }`;

html = html.replace(oldEscalationTimerJs, newEscalationTimerJs);

// Replace dispatchEmergencyWhatsApp with clean AIS-140 Fleet Escalation
const oldFullDispatchFunction = `    function dispatchEmergencyWhatsApp() {
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
      const autoSentDetails = document.getElementById('sirenAutoSentDetails');
      if (autoSentDetails) {
        autoSentDetails.textContent = 'Auto-dispatched to ' + recipientLabel + ' via AIS-140 Telemetry Gateway at ' + new Date().toLocaleTimeString() + '. Unconscious driver protocol engaged.';
      }
      if (action) action.style.display = 'block';

      // 1. Direct Automated Delivery via Green-API or CallMeBot (Zero-click automatic delivery!)
      const greenId = document.getElementById('cfgGreenId')?.value || localStorage.getItem('jaagrat_green_id') || '';
      const greenToken = document.getElementById('cfgGreenToken')?.value || localStorage.getItem('jaagrat_green_token') || '';
      const apiKey = document.getElementById('cfgWhatsAppApiKey')?.value || document.getElementById('ownerCallMeBotKey')?.value || localStorage.getItem('jaagrat_callmebot_key') || '';
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : ('+' + cleanPhone);

      if (greenId && greenToken) {
        // GREEN-API DIRECT CLOUD DISPATCH (Official linked device REST gateway)
        const greenHost = greenId.startsWith('7') ? '7103' : '1103';
        const greenUrl = 'https://' + greenHost + '.api.green-api.com/waInstance' + greenId + '/sendMessage/' + greenToken;
        fetch(greenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: cleanPhone + '@c.us',
            message: waMsg
          })
        }).then(res => res.json()).then(data => {
          logEvent('GREEN-API: Real WhatsApp message delivered to ' + cleanPhone + ' (Message ID: ' + (data.idMessage || 'OK') + ')');
          if (autoSentDetails) {
            autoSentDetails.innerHTML = '✓ <strong style="color:#86EFAC;">REAL WHATSAPP DELIVERED</strong> to ' + recipientPhone + ' via Green-API Gateway! (No manual click required)';
          }
        }).catch(err => {
          console.warn('Green-API fetch error:', err);
        });
      } else if (apiKey) {
        // CALLMEBOT GATEWAY
        const callMeBotUrl = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(formattedPhone) + '&text=' + encodeURIComponent(waMsg) + '&apikey=' + encodeURIComponent(apiKey);
        fetch(callMeBotUrl, { mode: 'no-cors' })
          .then(() => {
            logEvent('CALLMEBOT: Real WhatsApp message delivered to ' + formattedPhone + ' via CallMeBot API.');
            if (autoSentDetails) {
              autoSentDetails.innerHTML = '✓ <strong style="color:#86EFAC;">REAL WHATSAPP DELIVERED</strong> to ' + formattedPhone + ' via CallMeBot API! (No manual click required)';
            }
          })
          .catch((e) => {
            console.warn('CallMeBot fetch error:', e);
          });
      } else {
        // Fallback: launches WhatsApp directly
        try {
          window.open(waUrl, '_blank');
        } catch(e) {
          console.log('Automated popup note: Handled via cloud telemetry dispatch.');
        }
      }

      // Also trigger emergency advisory dispatch to fleet dashboard
      syncFleetEmergency('AUTOMATIC WHATSAPP SOS: ' + vReg + ' (>5s Unresponsive)');

      logEvent('CRITICAL SOS: Cockpit siren >=5s unresponsive. Automatic WhatsApp emergency alert dispatched to ' + recipientLabel);
      playDispatchChime();
    }

    function testWhatsAppGateway() {
      const phoneInput = document.getElementById('cfgWhatsAppPhone')?.value || document.getElementById('ownerPhone')?.value || '+91 99001 24567';
      const greenId = document.getElementById('cfgGreenId')?.value || localStorage.getItem('jaagrat_green_id') || '';
      const greenToken = document.getElementById('cfgGreenToken')?.value || localStorage.getItem('jaagrat_green_token') || '';
      const keyInput = document.getElementById('cfgWhatsAppApiKey')?.value || document.getElementById('ownerCallMeBotKey')?.value || localStorage.getItem('jaagrat_callmebot_key') || '';
      
      const clean = phoneInput.replace(/[^0-9]/g, '');
      const formatted = '+' + clean;
      const testMsg = '🚨 *JAAGRAT AIS-140 REAL-TIME TEST* 🚨\\n✓ Automated WhatsApp Cloud Gateway is ACTIVE!\\nEmergency fatigue alerts will be delivered directly to this chat without manual clicks.';

      if (greenId && greenToken) {
        localStorage.setItem('jaagrat_green_id', greenId);
        localStorage.setItem('jaagrat_green_token', greenToken);
        const greenHost = greenId.startsWith('7') ? '7103' : '1103';
        const greenUrl = 'https://' + greenHost + '.api.green-api.com/waInstance' + greenId + '/sendMessage/' + greenToken;
        fetch(greenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: clean + '@c.us',
            message: testMsg
          })
        }).then(res => res.json()).then(data => {
          alert('✓ Real WhatsApp Test Message DELIVERED to ' + formatted + ' via Green-API! (ID: ' + (data.idMessage || 'SENT') + ')');
          logEvent('GATEWAY: Delivered Green-API test WhatsApp to ' + formatted);
        }).catch(err => {
          alert('Error dispatching test message via Green-API: ' + err.message);
        });
        return;
      }

      if (keyInput) {
        localStorage.setItem('jaagrat_callmebot_key', keyInput);
        const testUrl = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(formatted) + '&text=' + encodeURIComponent(testMsg) + '&apikey=' + encodeURIComponent(keyInput);
        fetch(testUrl, { mode: 'no-cors' })
          .then(() => {
            alert('✓ Test WhatsApp message dispatched to ' + formatted + '! Check your phone.');
            logEvent('GATEWAY: Sent real test WhatsApp to ' + formatted);
          })
          .catch(err => {
            alert('Error dispatching test message: ' + err.message);
          });
        return;
      }

      alert('⚡ ZERO-CLICK REAL WHATSAPP GATEWAY SETUP:\\n\\nOption 1 (Recommended - Green-API):\\n1. Go to green-api.com and sign up free\\n2. Under Linked Devices, scan the QR code with your WhatsApp\\n3. Enter your Instance ID & Token above, and messages will arrive automatically without clicking send!\\n\\nOption 2 (Direct WhatsApp):\\nLeave blank and Jaagrat will launch your WhatsApp with the emergency SOS alert pre-loaded.');
    }`;

const newFullDispatchFunction = `    function dispatchEmergencyEscalation() {
      const vReg = document.getElementById('dispVehicleTag')?.textContent || 'KA-01-AB-1234';
      const dName = document.getElementById('dispDriverTag')?.textContent || 'Ramesh Kumar';
      const speed = document.getElementById('speedKmhText')?.textContent || '42 km/h';

      const action = document.getElementById('sirenEscalationAction');
      const autoSentDetails = document.getElementById('sirenAutoSentDetails');
      if (autoSentDetails) {
        autoSentDetails.textContent = 'Driver ' + dName + ' (' + vReg + ') unresponsive for >5.0s at ' + speed + '. High-decibel cockpit siren sounding. Telemetry transmitted to Fleet Operations Center.';
      }
      if (action) action.style.display = 'block';

      // Dispatches AIS-140 emergency escalation to Fleet Portal Command Center
      syncFleetEmergency('CRITICAL FATIGUE: ' + vReg + ' (>5s Unresponsive)');

      logEvent('AIS-140 EMERGENCY: Vehicle ' + vReg + ' driver unresponsive for >=5.0s! Emergency telemetry logged to Fleet Hub.');
      playDispatchChime();
    }`;

html = html.replace(oldFullDispatchFunction, newFullDispatchFunction);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully removed developer API keys and added universal scrollbar suppression!');
