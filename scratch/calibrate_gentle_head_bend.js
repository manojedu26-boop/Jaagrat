const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const hasCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  // 1. UPDATE HEADDROP TIMING THRESHOLD TO 650ms (Snappy 0.65s)
  content = content.replace(/const HEADDROP_MS = \d+;[^\n]*/, 'const HEADDROP_MS = 650;   // 0.65s natural head bend required before siren');

  // 2. REVISE PITCH THRESHOLD TO NATURAL GENTLE BEND (< 0.80 / 85% of baseline)
  const oldPitchSectionRegex = /\/\/ Dynamic baseline calibration for upright head posture[\s\S]*?const isGenuineHeadDrop =[\s\S]*?;/;
  const newPitchSection = `// Dynamic baseline calibration for upright head posture
      if (rawPitchRatio > 0.82 && rawPitchRatio < 1.30 && !isTurningHeadSideways && !isTiltingRoll) {
        uprightPitchBaseline = (uprightPitchBaseline * 0.95) + (rawPitchRatio * 0.05);
      }

      // Fast, responsive exponential moving average (65% current frame weight for instant detection)
      smoothedPitchRatio = (smoothedPitchRatio * 0.35) + (rawPitchRatio * 0.65);

      // Sensitive natural threshold: triggers at < 0.80 (or 85% of upright baseline - no deep bend required!)
      const pitchDropThreshold = Math.min(0.81, Math.max(0.72, uprightPitchBaseline * 0.85));

      // Trigger immediately when driver bends head forward/down, while suppressing sideways mirror turns
      const isGenuineHeadDrop = (smoothedPitchRatio < pitchDropThreshold) && !isTurningHeadSideways && !isTiltingRoll;`;

  if (oldPitchSectionRegex.test(content)) {
    content = content.replace(oldPitchSectionRegex, newPitchSection);
    console.log(`[OK] Updated pitch section to natural gentle bend in ${filePath}`);
  } else {
    console.warn(`[WARN] oldPitchSectionRegex failed in ${filePath}`);
  }

  // 3. UPDATE UNLATCH & LOGS
  content = content.replace(/if \(smoothedPitchRatio > \(pitchDropThreshold \+ 0\.08\)\)/, 'if (smoothedPitchRatio > 0.85)');
  content = content.replace(/Head Drop \/ Nodding confirmed \(>1\.1s\)/g, 'Head Drop / Nodding confirmed (>0.65s)');
  content = content.replace(/Head Drop \(>1\.1s\)/g, 'Head Drop (>0.65s)');
  content = content.replace(/Test Head Drop \(1\.1s\)/g, 'Test Head Drop (0.65s)');
  content = content.replace(/1\.1s Head bend buzzer alarm/g, '0.65s Head bend buzzer alarm');

  if (hasCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile(path.join(__dirname, '../index.html'));
updateFile(path.join(__dirname, '../web/index.html'));
console.log('Update script completed.');
