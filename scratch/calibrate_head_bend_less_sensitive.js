const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const hasCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  // 1. UPDATE HEADDROP TIMING THRESHOLD TO 1300ms (1.3s)
  content = content.replace(/const HEADDROP_MS = \d+;[^\n]*/, 'const HEADDROP_MS = 1300;  // 1.30s sustained head bend required before siren');

  // 2. REVISE YAW & PITCH CV LOGIC IN onFaceMeshResults
  const oldCvSectionRegex = /\/\/ 4\. HEAD SHAKE & YAW FILTER[\s\S]*?const isGenuineHeadDrop =[\s\S]*?;/;
  const newCvSection = `// 4. HEAD YAW & SIDE TURN FILTER (Detects looking sideways / checking mirrors)
      const cheekSpan = Math.hypot((lm[454].x - lm[234].x) * w, (lm[454].y - lm[234].y) * h);
      const leftDist = Math.hypot((lm[1].x - lm[234].x) * w, (lm[1].y - lm[234].y) * h);
      const rightDist = Math.hypot((lm[454].x - lm[1].x) * w, (lm[454].y - lm[1].y) * h);
      const totalCheekDist = Math.max(1.0, leftDist + rightDist);
      const yawAsymmetry = Math.abs(leftDist - rightDist) / totalCheekDist;

      // Horizontal offset of nose tip relative to eyes center
      const eyeMidX = (lm[33].x + lm[263].x) / 2.0;
      const eyeSpan = Math.hypot((lm[263].x - lm[33].x) * w, (lm[263].y - lm[33].y) * h);
      const noseHorizontalOffset = Math.abs(lm[1].x - eyeMidX) * w / Math.max(1.0, eyeSpan);

      // Sensitive side turn detection: yaw asymmetry > 0.16 OR nose horizontal shift > 0.13
      const isTurningHeadSideways = (yawAsymmetry > 0.16) || (noseHorizontalOffset > 0.13);

      // 5. ROLL TILT FILTER (Excessive ear-to-shoulder tilt)
      const eyeDx = (lm[263].x - lm[33].x) * w;
      const eyeDy = (lm[263].y - lm[33].y) * h;
      const rollAngle = Math.abs(Math.atan2(eyeDy, eyeDx) * 180 / Math.PI);
      const isTiltingRoll = rollAngle > 22;

      // 6. PITCH & CHIN-DROP (NODDING OFF) DETECTION
      const upperFaceH = Math.hypot((lm[1].x - lm[10].x) * w, (lm[1].y - lm[10].y) * h);
      const lowerFaceH = Math.hypot((lm[152].x - lm[1].x) * w, (lm[152].y - lm[1].y) * h);
      const rawPitchRatio = lowerFaceH / Math.max(1.0, upperFaceH);

      // Smooth moving average (70% previous, 30% current frame) to ignore transient twitches
      smoothedPitchRatio = (smoothedPitchRatio * 0.70) + (rawPitchRatio * 0.30);

      // Only trigger when the driver genuinely bends their head down (< 0.63) AND is NOT looking sideways
      const isGenuineHeadDrop = (smoothedPitchRatio < 0.63) && !isTurningHeadSideways && !isTiltingRoll;`;

  if (oldCvSectionRegex.test(content)) {
    content = content.replace(oldCvSectionRegex, newCvSection);
    console.log(`[OK] Updated Yaw & Pitch CV section in ${filePath}`);
  } else {
    console.warn(`[WARN] oldCvSectionRegex failed in ${filePath}`);
  }

  // 3. UPDATE CHIP TEXT FOR PITCH
  const oldChipPitchRegex = /if \(cPitch\) \{[\s\S]*?cPitch\.textContent = isGenuineHeadDrop \? 'HEAD DROP!' : \(isShakingHead \? 'MIRROR CHECK' : 'POSTURE: OK'\);[\s\S]*?cPitch\.className = isGenuineHeadDrop \? 'metric-chip alert' : 'metric-chip';[\s\S]*?\}/;
  const newChipPitch = `if (cPitch) {
        cPitch.textContent = isGenuineHeadDrop ? 'HEAD BENT DOWN!' : (isTurningHeadSideways ? 'SIDE LOOK / MIRROR' : 'POSTURE: OK');
        cPitch.className = isGenuineHeadDrop ? 'metric-chip alert' : (isTurningHeadSideways ? 'metric-chip warning' : 'metric-chip');
      }`;

  if (oldChipPitchRegex.test(content)) {
    content = content.replace(oldChipPitchRegex, newChipPitch);
    console.log(`[OK] Updated cPitch display logic in ${filePath}`);
  } else {
    console.warn(`[WARN] oldChipPitchRegex failed in ${filePath}`);
  }

  // 4. UPDATE HEAD DROP LOGS & RESET THRESHOLD
  content = content.replace(/Head Drop \/ Nodding confirmed \(>0\.85s\)/g, 'Head Drop / Nodding confirmed (>1.3s)');
  content = content.replace(/Head Drop \(>0\.85s\)/g, 'Head Drop (>1.3s)');
  content = content.replace(/if \(smoothedPitchRatio > 0\.85\)/g, 'if (smoothedPitchRatio > 0.72)');

  // 5. UPDATE SIMULATOR BUTTON TEXT
  content = content.replace(/Test Head Drop \(0\.85s\)/g, 'Test Head Drop (1.3s)');
  content = content.replace(/0\.85s Nodding-off buzzer alarm/g, '1.3s Head bend buzzer alarm');

  if (hasCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile(path.join(__dirname, '../index.html'));
updateFile(path.join(__dirname, '../web/index.html'));
console.log('Update script completed.');
