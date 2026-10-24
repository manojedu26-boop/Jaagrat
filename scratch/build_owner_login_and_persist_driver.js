const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// 1. CSS FOR FLEET OWNER LOGIN CARD
const fleetLoginCss = `
    /* FLEET OWNER LOGIN CARD */
    .fleet-login-card {
      max-width: 580px;
      margin: 20px auto;
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 24px;
      padding: 32px 28px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .fleet-login-header {
      text-align: center;
      margin-bottom: 6px;
    }

    .fleet-login-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFF7ED;
      color: var(--safety-orange);
      border: 1px solid #FFEDD5;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 10px;
    }

    .fleet-login-title {
      font-size: 22px;
      font-weight: 900;
      color: var(--text-main);
      letter-spacing: -0.4px;
    }

    .fleet-login-sub {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
      margin-top: 3px;
    }

    .fleet-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 600px) {
      .fleet-grid-2 {
        grid-template-columns: 1fr;
      }
    }
`;

html = html.replace('/* REAL LEAFLET MAP WRAPPER */', `${fleetLoginCss}\n    /* REAL LEAFLET MAP WRAPPER */`);

// 2. WRAP FLEET OWNER SECTION IN LOGIN VIEW AND DASHBOARD VIEW
const oldFleetSection = `<main id="fleetOwnerSection">
    
    <!-- Top Operations Header -->
    <div class="fleet-portal-header">`;

const newFleetSection = `<main id="fleetOwnerSection">
    
    <!-- VIEW 1: FLEET OWNER ENTERPRISE LOGIN (AUTO-FILLED FOR DEMO) -->
    <div id="viewFleetOwnerLogin" style="width:100%;">
      <div class="fleet-login-card">
        <div class="fleet-login-header">
          <div class="fleet-login-badge">
            <span>🛡️</span>
            <span>ENTERPRISE AIS-140 FLEET GATEWAY</span>
          </div>
          <div class="fleet-login-title">Fleet Owner & Manager Portal</div>
          <div class="fleet-login-sub">Commercial Logistics Fleet Live Telemetry & GPS Tracking</div>
        </div>

        <div class="form-group">
          <label class="form-label">Fleet Company / Organization Name</label>
          <input type="text" class="form-input" id="ownerCompany" value="VRL National Logistics Ltd.">
        </div>

        <div class="fleet-grid-2">
          <div class="form-group">
            <label class="form-label">Fleet Owner / Director Name</label>
            <input type="text" class="form-input" id="ownerName" value="Vikramaditya Hegde">
          </div>
          <div class="form-group">
            <label class="form-label">Owner Mobile / Emergency Phone</label>
            <input type="tel" class="form-input" id="ownerPhone" value="+91 99001 24567">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Operating Corridors & Regional Depots</label>
          <input type="text" class="form-input" id="ownerCorridor" value="South Corridor (Bengaluru, Hyderabad, Pune, Chennai)">
        </div>

        <div class="fleet-grid-2">
          <div class="form-group">
            <label class="form-label">Active Commercial Vehicles</label>
            <input type="text" class="form-input" id="ownerVehicles" value="8 Heavy Commercial Vehicles">
          </div>
          <div class="form-group">
            <label class="form-label">Fleet Access Passcode</label>
            <input type="password" class="form-input" id="ownerPasscode" value="FLEET-VRL-2026" style="font-family:'JetBrains Mono';">
          </div>
        </div>

        <button class="btn-primary" onclick="loginFleetOwner()" style="padding:14px; font-size:15px; margin-top:4px;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          <span>Access Fleet Command Center & Live Map &rarr;</span>
        </button>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); margin-top:2px;">
          <span>✓ Credentials Auto-Filled for Competition Demo</span>
          <button class="btn-outline" style="border:none; padding:4px 8px; font-size:11px;" onclick="autofillOwnerDemo()">
            <span>⚡ Reset Demo Info</span>
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW 2: FLEET OWNER LIVE COMMAND CENTER (AFTER LOGIN) -->
    <div id="viewFleetOwnerDashboard" style="display:none; width:100%; flex-direction:column; gap:20px;">
      
      <!-- Top Operations Header -->
      <div class="fleet-portal-header">`;

html = html.replace(oldFleetSection, newFleetSection);

// Update end of fleetOwnerSection
const oldEndFleet = `    </div>

  </main>`;

const newEndFleet = `      </div>
    </div>

  </main>`;

html = html.replace(oldEndFleet, newEndFleet);

// Update Header in Fleet Command Center to show Logged-in Organization & Sign Out button
const oldFleetHeaderContent = `<div class="fleet-title-group">
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
      </div>`;

const newFleetHeaderContent = `<div class="fleet-title-group">
        <h2>
          <span>🏢</span> <span id="dispOwnerOrgHeader">VRL National Logistics Ltd.</span>
        </h2>
        <p id="dispOwnerNameHeader">Director: Vikramaditya Hegde • 📞 +91 99001 24567 • 8 Commercial Trucks Monitored (AIS-140 Gateway)</p>
      </div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <button class="btn-action-sm" onclick="remoteFleetPing('ALL')">
          <span>📢 Broadcast Advisory</span>
        </button>
        <button class="btn-action-sm danger" onclick="triggerEmergencyDispatch('KA-01-AB-1234')">
          <span>🚨 Remote Dispatch Siren (KA-01)</span>
        </button>
        <button class="btn-action-sm" style="background:var(--surface-muted);" onclick="logoutFleetOwner()" title="Sign Out of Organization">
          <span>🚪 Switch Org</span>
        </button>
      </div>`;

html = html.replace(oldFleetHeaderContent, newFleetHeaderContent);

// 3. UPDATE completeShiftAndStartNew TO START NEW RIDE DIRECTLY IN ACTIVE DRIVE (NEVER ASKS LANGUAGE/ONBOARDING AGAIN!)
const oldCompleteShiftFunc = `function completeShiftAndStartNew() {
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
    }`;

const newCompleteShiftFunc = `function completeShiftAndStartNew() {
      stopCamera();
      stopLevel2CockpitSiren();
      const prevScore = document.getElementById('summaryScoreValue').textContent || '98';
      const prevVehicle = document.getElementById('dispVehicleTag').textContent || 'KA-01-AB-1234';
      const prevDriver = document.getElementById('dispDriverTag').textContent || 'Ramesh K.';
      
      // 1. Reset all shift & trip metrics for clean fresh ride
      microsleepCount = 0;
      headDropCount = 0;
      yawnCount = 0;
      yawnCounted = false;
      headDropLatched = false;
      isLevel2AlarmActive = false;
      eyeClosedStartTime = null;
      headDropStartTime = null;
      yawnStartTime = null;

      const badge = document.getElementById('sessionIncidentsBadge');
      if (badge) {
        const dict = i18n[currentLang] || i18n.en;
        badge.textContent = dict.incidentsLabel.replace('{n}', 0);
      }
      const fill = document.getElementById('closureLineFill');
      if (fill) {
        fill.style.width = '0%';
        fill.style.backgroundColor = 'var(--safety-orange)';
      }

      // 2. Driver remains logged in forever! Start new ride directly in Active Drive view!
      document.getElementById('viewSummary').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'flex';
      updateDriverStatus('focused');

      logEvent('NEW RIDE: Shift for ' + prevVehicle + ' archived (Score: ' + prevScore + '/100). Driver ' + prevDriver + ' started new trip directly.');
      
      const pill = document.getElementById('globalStatusPill');
      if (pill) {
        pill.textContent = '✓ New Ride Active (' + prevVehicle + ')';
        pill.style.background = 'var(--status-green-light)';
        pill.style.color = 'var(--status-green)';
        setTimeout(() => {
          pill.textContent = 'Live Web Vision Active';
        }, 3000);
      }
    }

    function switchDriverOrLanguage() {
      stopCamera();
      stopLevel2CockpitSiren();
      document.getElementById('viewSummary').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'none';
      goToLanguageScreen();
      logEvent('DRIVER SESSION: Driver logged out to switch account or change language.');
    }`;

html = html.replace(oldCompleteShiftFunc, newCompleteShiftFunc);

// Add discrete "Switch Driver / Change Language" button on Scoreboard below buttons
const oldScoreboardBtns = `<button class="btn-outline" style="border-style:dashed; color:var(--safety-orange); font-size:11px;" onclick="exportSafetyReport()">
                <span>📄 Export AIS-140 Shift Safety Audit</span>
              </button>
            </div>`;

const newScoreboardBtns = `<button class="btn-outline" style="border-style:dashed; color:var(--safety-orange); font-size:11px;" onclick="exportSafetyReport()">
                <span>📄 Export AIS-140 Shift Safety Audit</span>
              </button>
              <button class="btn-outline" style="border:none; padding:4px; font-size:11px; color:var(--text-muted); margin-top:2px;" onclick="switchDriverOrLanguage()">
                <span>👤 Switch Driver Account / Change Language</span>
              </button>
            </div>`;

html = html.replace(oldScoreboardBtns, newScoreboardBtns);

// 4. FLEET OWNER AUTH JAVASCRIPT
const ownerAuthJs = `
    let isOwnerLoggedIn = false;

    function loginFleetOwner() {
      const company = document.getElementById('ownerCompany').value || 'VRL National Logistics Ltd.';
      const owner = document.getElementById('ownerName').value || 'Vikramaditya Hegde';
      const phone = document.getElementById('ownerPhone').value || '+91 99001 24567';
      const vehicles = document.getElementById('ownerVehicles').value || '8 Vehicles';

      isOwnerLoggedIn = true;
      document.getElementById('viewFleetOwnerLogin').style.display = 'none';
      const dash = document.getElementById('viewFleetOwnerDashboard');
      dash.style.display = 'flex';

      document.getElementById('dispOwnerOrgHeader').textContent = company;
      document.getElementById('dispOwnerNameHeader').textContent = 'Director: ' + owner + ' • 📞 ' + phone + ' • ' + vehicles + ' (AIS-140 Gateway)';

      renderFleetTable();
      setTimeout(() => {
        initRealFleetMap();
      }, 120);

      logEvent('OWNER AUTH: ' + owner + ' (' + company + ') authenticated into Fleet Command Center.');
    }

    function logoutFleetOwner() {
      isOwnerLoggedIn = false;
      document.getElementById('viewFleetOwnerDashboard').style.display = 'none';
      document.getElementById('viewFleetOwnerLogin').style.display = 'block';
      logEvent('OWNER AUTH: Logged out from Fleet Command Center.');
    }

    function autofillOwnerDemo() {
      document.getElementById('ownerCompany').value = 'VRL National Logistics Ltd.';
      document.getElementById('ownerName').value = 'Vikramaditya Hegde';
      document.getElementById('ownerPhone').value = '+91 99001 24567';
      document.getElementById('ownerCorridor').value = 'South Corridor (Bengaluru, Hyderabad, Pune, Chennai)';
      document.getElementById('ownerVehicles').value = '8 Heavy Commercial Vehicles';
      document.getElementById('ownerPasscode').value = 'FLEET-VRL-2026';
    }
`;

// Insert ownerAuthJs and update switchMainPortal
const oldSwitchPortal = `function switchMainPortal(mode) {
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
        setTimeout(() => {
          initRealFleetMap();
        }, 120);
        logEvent('PORTAL: Switched to Enterprise Fleet Owner Command Center.');
      } else {
        fleetTab.classList.remove('active');
        driverTab.classList.add('active');
        fleetSection.style.display = 'none';
        driverSection.style.display = 'grid';
        logEvent('PORTAL: Switched to Driver Cockpit HUD.');
      }
    }`;

const newSwitchPortal = `${ownerAuthJs}
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

        if (!isOwnerLoggedIn) {
          document.getElementById('viewFleetOwnerLogin').style.display = 'block';
          document.getElementById('viewFleetOwnerDashboard').style.display = 'none';
          logEvent('PORTAL: Fleet Owner Login page displayed.');
        } else {
          document.getElementById('viewFleetOwnerLogin').style.display = 'none';
          document.getElementById('viewFleetOwnerDashboard').style.display = 'flex';
          renderFleetTable();
          setTimeout(() => {
            initRealFleetMap();
          }, 120);
          logEvent('PORTAL: Switched to Enterprise Fleet Owner Command Center.');
        }
      } else {
        fleetTab.classList.remove('active');
        driverTab.classList.add('active');
        fleetSection.style.display = 'none';
        driverSection.style.display = 'grid';
        logEvent('PORTAL: Switched to Driver Cockpit HUD.');
      }
    }`;

html = html.replace(oldSwitchPortal, newSwitchPortal);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully written index.html & web/index.html with Owner Login & Persistent Driver Sessions!');
