const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const hasCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  // 1. UPDATE HEADDROP TIMING THRESHOLD TO 1100ms
  content = content.replace(/const HEADDROP_MS = \d+;[^\n]*/, 'const HEADDROP_MS = 1100;  // 1.10s sustained head bend required before siren');

  // 2. ADD uprightPitchBaseline DECLARATION
  if (!content.includes('let uprightPitchBaseline')) {
    content = content.replace('let smoothedPitchRatio = 1.0;', 'let smoothedPitchRatio = 1.0;\n    let uprightPitchBaseline = 0.95;');
    console.log(`[OK] Added uprightPitchBaseline to ${filePath}`);
  }

  // 3. REVISE YAW & PITCH CV SECTION
  const targetOldCvRegex = /\/\/ 4\. HEAD YAW & SIDE TURN FILTER[\s\S]*?const isGenuineHeadDrop =[\s\S]*?;/;
  const newCvSection = `// 4. HEAD YAW & SIDE TURN FILTER (Detects looking sideways / checking mirrors)
      const cheekSpan = Math.hypot((lm[454].x - lm[234].x) * w, (lm[454].y - lm[234].y) * h);
      const leftDist = Math.hypot((lm[1].x - lm[234].x) * w, (lm[1].y - lm[234].y) * h);
      const rightDist = Math.hypot((lm[454].x - lm[1].x) * w, (lm[454].y - lm[1].y) * h);
      const totalCheekDist = Math.max(1.0, cheekSpan);
      const yawAsymmetry = Math.abs(leftDist - rightDist) / totalCheekDist;

      // Turning head sideways (mirror check > 20 deg): asymmetry > 0.30
      const isTurningHeadSideways = yawAsymmetry > 0.30;

      // 5. ROLL TILT FILTER (Excessive ear-to-shoulder tilt)
      const eyeDx = (lm[263].x - lm[33].x) * w;
      const eyeDy = (lm[263].y - lm[33].y) * h;
      const rollAngle = Math.abs(Math.atan2(eyeDy, eyeDx) * 180 / Math.PI);
      const isTiltingRoll = rollAngle > 25;

      // 6. PITCH & CHIN-DROP (NODDING OFF) DETECTION
      const upperFaceH = Math.hypot((lm[1].x - lm[10].x) * w, (lm[1].y - lm[10].y) * h);
      const lowerFaceH = Math.hypot((lm[152].x - lm[1].x) * w, (lm[152].y - lm[1].y) * h);
      const rawPitchRatio = lowerFaceH / Math.max(1.0, upperFaceH);

      // Dynamic baseline calibration for upright head posture (calibrates to driver's natural face shape & camera angle)
      if (rawPitchRatio > 0.78 && rawPitchRatio < 1.30 && !isTurningHeadSideways && !isTiltingRoll) {
        uprightPitchBaseline = (uprightPitchBaseline * 0.96) + (rawPitchRatio * 0.04);
      }

      // Fast, responsive exponential moving average (50% weight on current frame)
      smoothedPitchRatio = (smoothedPitchRatio * 0.50) + (rawPitchRatio * 0.50);

      // Adaptive threshold: triggers when pitch drops below 74% of driver baseline (or < 0.71)
      const pitchDropThreshold = Math.min(0.71, Math.max(0.60, uprightPitchBaseline * 0.74));

      // Trigger only when driver genuinely bends head down AND is not turning head sideways
      const isGenuineHeadDrop = (smoothedPitchRatio < pitchDropThreshold) && !isTurningHeadSideways && !isTiltingRoll;`;

  if (targetOldCvRegex.test(content)) {
    content = content.replace(targetOldCvRegex, newCvSection);
    console.log(`[OK] Replaced CV section with adaptive pitch calibration in ${filePath}`);
  } else {
    console.warn(`[WARN] targetOldCvRegex failed in ${filePath}`);
  }

  // 4. REVISE cPitch TEXT DISPLAY TO SHOW LIVE NUMERICAL VALUES
  const targetChipPitchRegex = /if \(cPitch\) \{[\s\S]*?cPitch\.textContent = isGenuineHeadDrop \? 'HEAD BENT DOWN!' : \(isTurningHeadSideways \? 'SIDE LOOK \/ MIRROR' : 'POSTURE: OK'\);[\s\S]*?cPitch\.className = isGenuineHeadDrop \? 'metric-chip alert' : \(isTurningHeadSideways \? 'metric-chip warning' : 'metric-chip'\);[\s\S]*?\}/;
  const newChipPitchDisplay = `if (cPitch) {
        if (isGenuineHeadDrop) {
          cPitch.textContent = 'PITCH: ' + smoothedPitchRatio.toFixed(2) + ' (HEAD BENT!)';
          cPitch.className = 'metric-chip alert';
        } else if (isTurningHeadSideways) {
          cPitch.textContent = 'YAW: ' + yawAsymmetry.toFixed(2) + ' (SIDE MIRROR)';
          cPitch.className = 'metric-chip warning';
        } else {
          cPitch.textContent = 'PITCH: ' + smoothedPitchRatio.toFixed(2) + ' (OK)';
          cPitch.className = 'metric-chip';
        }
      }`;

  if (targetChipPitchRegex.test(content)) {
    content = content.replace(targetChipPitchRegex, newChipPitchDisplay);
    console.log(`[OK] Updated cPitch display with real-time numeric pitch in ${filePath}`);
  } else {
    console.warn(`[WARN] targetChipPitchRegex failed in ${filePath}`);
  }

  // 5. UPDATE BUFFER UNLATCH LOGIC
  content = content.replace(/if \(smoothedPitchRatio > 0\.72\)/, 'if (smoothedPitchRatio > (pitchDropThreshold + 0.08))');
  content = content.replace(/Head Drop \/ Nodding confirmed \(>1\.3s\)/g, 'Head Drop / Nodding confirmed (>1.1s)');
  content = content.replace(/Head Drop \(>1\.3s\)/g, 'Head Drop (>1.1s)');
  content = content.replace(/Test Head Drop \(1\.3s\)/g, 'Test Head Drop (1.1s)');
  content = content.replace(/1\.3s Head bend buzzer alarm/g, '1.1s Head bend buzzer alarm');

  if (hasCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile(path.join(__dirname, '../index.html'));
updateFile(path.join(__dirname, '../web/index.html'));
console.log('Update script completed.');
