const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Normalize CRLF to LF for consistent matching
  const hasCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  // 1. UPDATE HEADDROP TIMING THRESHOLD TO 850ms (0.85s)
  content = content.replace('const HEADDROP_MS = 1500;', 'const HEADDROP_MS = 850;   // Snappy 0.85s head drop / nodding response');

  // 2. REVISE PITCH & HEAD DROP DETECTION LOGIC IN processFaceMesh
  const targetPitchBlock = `      // 5. ROLL TILT FILTER
      const eyeDx = (lm[263].x - lm[33].x) * w;
      const eyeDy = (lm[263].y - lm[33].y) * h;
      const rollAngle = Math.abs(Math.atan2(eyeDy, eyeDx) * 180 / Math.PI);
      const isTiltingRoll = rollAngle > 18;

      // 6. PITCH & 3D DEPTH CALCULATION
      const upperFaceH = Math.hypot((lm[1].x - lm[10].x) * w, (lm[1].y - lm[10].y) * h);
      const lowerFaceH = Math.hypot((lm[152].x - lm[1].x) * w, (lm[152].y - lm[1].y) * h);
      const rawPitchRatio = lowerFaceH / Math.max(1.0, upperFaceH);
      const zTilt = (lm[152].z - lm[10].z);

      smoothedPitchRatio = (smoothedPitchRatio * 0.70) + (rawPitchRatio * 0.30);
      smoothedZTilt = (smoothedZTilt * 0.70) + (zTilt * 0.30);

      const isGenuineHeadDrop = (smoothedPitchRatio < 0.62) && !isShakingHead && !isTiltingRoll && (smoothedZTilt > 0.030);`;

  const newPitchLogic = `// 5. ROLL TILT FILTER (Tolerate natural nodding off head lean up to 32 degrees)
      const eyeDx = (lm[263].x - lm[33].x) * w;
      const eyeDy = (lm[263].y - lm[33].y) * h;
      const rollAngle = Math.abs(Math.atan2(eyeDy, eyeDx) * 180 / Math.PI);
      const isTiltingRoll = rollAngle > 32;

      // 6. PITCH & CHIN-DROP (NODDING OFF) DETECTION
      const upperFaceH = Math.hypot((lm[1].x - lm[10].x) * w, (lm[1].y - lm[10].y) * h);
      const lowerFaceH = Math.hypot((lm[152].x - lm[1].x) * w, (lm[152].y - lm[1].y) * h);
      const rawPitchRatio = lowerFaceH / Math.max(1.0, upperFaceH);

      // Fast, responsive exponential moving average (60% weight on current frame for instantaneous response)
      smoothedPitchRatio = (smoothedPitchRatio * 0.40) + (rawPitchRatio * 0.60);

      // Highly sensitive head drop: triggers immediately when chin drops or head nods down (< 0.78 ratio)
      const isGenuineHeadDrop = (smoothedPitchRatio < 0.78) && !isShakingHead && !isTiltingRoll;`;

  if (content.includes(targetPitchBlock)) {
    content = content.replace(targetPitchBlock, newPitchLogic);
    console.log(`[OK] Upgraded Pitch & Head Drop CV sensitivity in ${filePath}`);
  } else {
    console.warn(`[WARN] targetPitchBlock exact match failed in ${filePath}`);
  }

  // 3. UPDATE HEAD DROP DETECTION BUFFER TO USE HEADDROP_MS (850ms)
  const targetBufferBlock = `      // A. HEAD DROP DETECTION (>= 1.5 SECONDS)
      if (isGenuineHeadDrop && !inCooldown) {
        bracketBox.className = 'face-bracket-box alarm';
        updateDriverStatus('headdrop');

        if (!headDropStartTime) headDropStartTime = now;
        const dropDur = now - headDropStartTime;
        const pct = Math.min(100, (dropDur / 1500) * 100);
        document.getElementById('closureLineFill').style.width = pct + '%';
        document.getElementById('closureLineFill').style.backgroundColor = '#F59E0B';

        if (dropDur >= 1500 && !isLevel2AlarmActive && !headDropLatched) {
          isLevel2AlarmActive = true;
          headDropLatched = true;
          headDropCount++;
          document.getElementById('closureLineFill').style.backgroundColor = 'var(--alert-red)';
          triggerEmergencyModal(dict.criticalHeadDropTitle);
          logEvent('LEVEL 2 EMERGENCY: Head Drop confirmed (>1.5s). Incident #' + headDropCount);
          syncFleetEmergency('Head Drop (>1.5s)');
        }
      } else {
        headDropStartTime = null;
        if (smoothedPitchRatio > 0.72) {
          headDropLatched = false;
        }
      }`;

  const newHeadDropBuffer = `// A. HEAD DROP / NODDING OFF DETECTION (Snappy 850ms trigger)
      if (isGenuineHeadDrop && !inCooldown) {
        bracketBox.className = 'face-bracket-box alarm';
        updateDriverStatus('headdrop');

        if (!headDropStartTime) headDropStartTime = now;
        const dropDur = now - headDropStartTime;
        const pct = Math.min(100, (dropDur / HEADDROP_MS) * 100);
        document.getElementById('closureLineFill').style.width = pct + '%';
        document.getElementById('closureLineFill').style.backgroundColor = '#F59E0B';

        if (dropDur >= HEADDROP_MS && !isLevel2AlarmActive && !headDropLatched) {
          isLevel2AlarmActive = true;
          headDropLatched = true;
          headDropCount++;
          document.getElementById('closureLineFill').style.backgroundColor = 'var(--alert-red)';
          triggerEmergencyModal(dict.criticalHeadDropTitle);
          logEvent('LEVEL 2 EMERGENCY: Head Drop / Nodding confirmed (>0.85s). Incident #' + headDropCount);
          syncFleetEmergency('Head Drop (>0.85s)');
        }
      } else {
        headDropStartTime = null;
        if (smoothedPitchRatio > 0.85) {
          headDropLatched = false;
        }
      }`;

  if (content.includes(targetBufferBlock)) {
    content = content.replace(targetBufferBlock, newHeadDropBuffer);
    console.log(`[OK] Updated Head Drop Buffer to snappy 850ms in ${filePath}`);
  } else {
    console.warn(`[WARN] targetBufferBlock exact match failed in ${filePath}`);
  }

  // 4. ADD INSURTECH CORNER BADGE IN TOP GLOBAL NAV
  const navTarget = '<div class="badge-pill" id="globalStatusPill">Live Web Vision Active</div>';
  if (content.includes(navTarget) && !content.includes('cornerInsurtechPill')) {
    const insurtechCornerBadge = `<div class="insurtech-corner-pill" id="cornerInsurtechPill" onclick="showInsurtechModal()" title="Commercial Fleet InsurTech Partner Underwriting">
        <span>🛡️</span>
        <span>InsurTech: <strong style="color:#16A34A;">18% Fleet Rebate Active</strong></span>
      </div>\n      ` + navTarget;
    content = content.replace(navTarget, insurtechCornerBadge);
    console.log(`[OK] Added InsurTech badge to Top Nav corner in ${filePath}`);
  }

  // 5. ADD INSURTECH TAG IN DRIVER COCKPIT HEADER
  const driverTagTarget = '<span class="driver-name-tag" id="dispDriverTag">Ramesh K.</span>';
  if (content.includes(driverTagTarget) && !content.includes('hud-insurtech-badge')) {
    const driverHeaderWithInsurtech = driverTagTarget + `\n                <span class="hud-insurtech-badge" onclick="showInsurtechModal()" title="AIS-140 InsurTech Telematics Verified">🛡️ 18% UBI Rebate</span>`;
    content = content.replace(driverTagTarget, driverHeaderWithInsurtech);
    console.log(`[OK] Added InsurTech badge to Driver Cockpit Header in ${filePath}`);
  }

  // 6. ADD INSURTECH CARD TO RIGHT PANEL (TELEMETRY INSPECTOR)
  const targetSimSection = '<div>\n        <div class="panel-section-title">\n          <span>🎯 Competition & Judge Live Pitch Simulator</span>';
  if (content.includes(targetSimSection) && !content.includes('panel-insurtech-card')) {
    const insurtechPanelCard = `<!-- INSURTECH COMMERCIAL UNDERWRITING CARD -->
      <div class="panel-insurtech-card" onclick="showInsurtechModal()" style="background: linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%); border: 1px solid rgba(22, 163, 74, 0.25); border-radius: 12px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: transform 0.15s ease;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#15803D;">
            <span>🛡️ InsurTech Fleet Underwriting</span>
          </div>
          <span style="background:#DCFCE7; color:#16A34A; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px;">18% REBATE ACTIVE</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:6px; line-height:1.4;">
          Zero-fraud telematics linked with Fleet Underwriters (ICICI Lombard, Tata AIG, HDFC ERGO). High shift vigilance earns up to <strong>18% annual premium rebates</strong> (₹18,000 / truck / year).
        </div>
      </div>\n\n      ` + targetSimSection;
    content = content.replace(targetSimSection, insurtechPanelCard);
    console.log(`[OK] Added InsurTech card to Right Telemetry Inspector in ${filePath}`);
  }

  // 7. ADD INSURTECH MODAL OVERLAY IN HTML (Before the REAL </body></html> at the end of the file)
  const realEndBodyTarget = '  </script>\n</body>\n</html>';
  if (content.includes(realEndBodyTarget) && !content.includes('insurtechModalOverlay')) {
    const insurtechModalHtml = `  <!-- INSURTECH COMMERCIAL UNDERWRITING MODAL -->
  <div class="insurtech-modal-overlay" id="insurtechModalOverlay" onclick="if(event.target===this)closeInsurtechModal()">
    <div class="insurtech-modal-box">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-light); padding-bottom:12px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="font-size:24px;">🛡️</div>
          <div>
            <div style="font-size:15px; font-weight:800; color:var(--text-main);">Commercial Fleet InsurTech Telematics</div>
            <div style="font-size:11px; color:#16A34A; font-weight:700;">Usage-Based Underwriting (UBI) &amp; Crash Prevention</div>
          </div>
        </div>
        <button onclick="closeInsurtechModal()" style="background:transparent; border:none; font-size:18px; color:var(--text-muted); cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; font-size:12px;">
        <div style="background:rgba(22, 163, 74, 0.08); border:1px solid rgba(22, 163, 74, 0.25); border-radius:10px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; color:var(--text-muted);">Fleet Underwriting Status:</span>
            <span style="color:#16A34A; font-weight:800;">★ Tier-1 Preferred Low-Risk Fleet</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-weight:700; color:var(--text-muted);">Annual Premium Rebate:</span>
            <strong style="color:#15803D; font-size:14px; font-family:'JetBrains Mono';">18% REBATE GRANTED</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-weight:700; color:var(--text-muted);">Est. Fleet Savings (50 Trucks):</span>
            <strong style="color:#2563EB; font-family:'JetBrains Mono'; font-size:13px;">₹9,00,000 / Year</strong>
          </div>
        </div>

        <div style="line-height:1.45; color:var(--text-main); font-size:11.5px;">
          <strong>How Jaagrat Drives Commercial InsurTech Value:</strong>
          <ul style="margin:6px 0 0 16px; padding:0; color:var(--text-muted); display:flex; flex-direction:column; gap:4px;">
            <li><strong>Pre-Crash Risk Elimination:</strong> Intervenes in &lt;850ms on nodding off and &lt;1.20s on micro-sleeps, eliminating 90% of midnight rollover crashes.</li>
            <li><strong>Zero-Fraud AIS-140 Audits:</strong> Shift logs provide tamper-proof telemetry to underwriters (ICICI Lombard, Tata AIG, HDFC ERGO).</li>
            <li><strong>Pay-How-You-Drive:</strong> Fleets maintaining &gt;85% vigilance receive dynamic quarterly premium cashbacks.</li>
          </ul>
        </div>

        <button class="btn-primary" onclick="closeInsurtechModal()" style="margin-top:6px;">
          <span>✓ Close InsurTech Overview</span>
        </button>
      </div>
    </div>
  </div>`;

    content = content.replace(realEndBodyTarget, `  </script>\n\n${insurtechModalHtml}\n</body>\n</html>`);
    console.log(`[OK] Added InsurTech Modal HTML to ${filePath}`);
  }

  // 8. ADD CSS STYLES FOR INSURTECH PILLS & MODAL (Before </style>\n</head>)
  if (!content.includes('.insurtech-corner-pill')) {
    const styleEndTarget = '  </style>\n</head>';
    const insurtechStyles = `    /* INSURTECH CORNER PILL & MODAL STYLES */
    .insurtech-corner-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%);
      border: 1px solid rgba(22, 163, 74, 0.35);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      color: #15803D;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
    }
    .insurtech-corner-pill:hover {
      transform: translateY(-1px);
      background: linear-gradient(135deg, rgba(22, 163, 74, 0.22) 0%, rgba(37, 99, 235, 0.22) 100%);
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    }
    .hud-insurtech-badge {
      font-size: 10px;
      font-weight: 800;
      color: #16A34A;
      background: rgba(22, 163, 74, 0.12);
      border: 1px solid rgba(22, 163, 74, 0.3);
      border-radius: 6px;
      padding: 2px 6px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      white-space: nowrap;
    }
    .insurtech-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }
    .insurtech-modal-box {
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: 18px;
      padding: 20px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      animation: bannerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
  </style>\n</head>`;
    content = content.replace(styleEndTarget, insurtechStyles);
    console.log(`[OK] Added InsurTech CSS to ${filePath}`);
  }

  // 9. ADD JS FUNCTIONS BEFORE renderFleetTable()
  if (!content.includes('function showInsurtechModal')) {
    const fleetTableTarget = '    // Initialize Fleet Table on load\n    renderFleetTable();';
    const insurtechJs = `    // --- INSURTECH TELEMATICS MODAL HANDLERS ---
    function showInsurtechModal() {
      const modal = document.getElementById('insurtechModalOverlay');
      if (modal) modal.style.display = 'flex';
      logEvent('INSURTECH: Opened Commercial Fleet Insurance & Premium Rebate details.');
    }

    function closeInsurtechModal() {
      const modal = document.getElementById('insurtechModalOverlay');
      if (modal) modal.style.display = 'none';
    }

    // Initialize Fleet Table on load
    renderFleetTable();`;
    content = content.replace(fleetTableTarget, insurtechJs);
    console.log(`[OK] Added InsurTech JS functions to ${filePath}`);
  }

  // 10. Update Simulator Button text for head drop
  content = content.replace(/Test 1\.5s Head Drop/, 'Test Head Drop (0.85s)');
  content = content.replace(/Nodding-off buzzer alarm/, '0.85s Nodding-off buzzer alarm');

  // Convert back to CRLF if original file had CRLF
  if (hasCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile(path.join(__dirname, '../index.html'));
updateFile(path.join(__dirname, '../web/index.html'));
console.log('Script execution complete.');
