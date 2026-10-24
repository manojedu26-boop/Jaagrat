const fs = require('fs');
const path = require('path');

// Read translations
const { scoreboardTranslations } = require('./scoreboard_translations.js');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// 1. Inject scoreboard translations into i18n dictionary in html
Object.keys(scoreboardTranslations).forEach(lang => {
  const trans = scoreboardTranslations[lang];
  const langKeyRegex = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?)(excellentScore:\\s*"[^"]*",?)`);
  
  // Format properties to insert
  const propsToInsert = `
        shiftSummaryTitle: "${trans.shiftSummaryTitle}",
        dispSummaryShiftTime: "${trans.dispSummaryShiftTime}",
        overallScoreLabel: "${trans.overallScoreLabel}",
        excellentScore: "${trans.excellentScore}",
        moderateScore: "${trans.moderateScore}",
        highRiskScore: "${trans.highRiskScore}",
        summaryMicrosleeps: "${trans.summaryMicrosleeps}",
        summaryHeadDrops: "${trans.summaryHeadDrops}",
        summaryYawns: "${trans.summaryYawns}",
        summaryDistance: "${trans.summaryDistance}",
        btnCompleteNewShift: "${trans.btnCompleteNewShift}",
        btnResumeShift: "${trans.btnResumeShift}",
        btnExportAudit: "${trans.btnExportAudit}",
        frontCamReady: "${trans.frontCamReady}",
        tapStartCam: "${trans.tapStartCam}",
        btnStartCam: "${trans.btnStartCam}",
        btnStopCam: "${trans.btnStopCam}",
        alertModalTitle: "${trans.alertModalTitle}",
        alertModalSubtitle: "${trans.alertModalSubtitle}",`;

  if (langKeyRegex.test(html)) {
    html = html.replace(langKeyRegex, `$1${propsToInsert}`);
  } else {
    // If excellentScore wasn't matched, insert before end of language block
    const endBlockRegex = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?)(disarmText:[^\\n]*,)`);
    if (endBlockRegex.test(html)) {
      html = html.replace(endBlockRegex, `$1${propsToInsert}\n        $2`);
    }
  }
});

// 2. Update applyLanguage to translate all Scorecard elements
const oldApplyLanguage = `function applyLanguage(code) {
      const dict = i18n[code] || i18n.en;

      // Update Language Screen
      const tChooseTitle = document.getElementById('t_chooseLangTitle');
      const tChooseSub = document.getElementById('t_chooseLangSub');
      const tBtnContinueLang = document.getElementById('t_btnContinueLang');
      if (tChooseTitle) tChooseTitle.textContent = dict.chooseLangTitle;
      if (tChooseSub) tChooseSub.textContent = dict.chooseLangSub;
      
      // CRITICAL FIX: Ensure Continue Button ALWAYS updates cleanly in chosen native script with visible arrow!
      if (tBtnContinueLang) {
        const label = (dict.btnContinueLang || dict.btnContinue || 'Continue &rarr;').replace('&rarr;', '→');
        tBtnContinueLang.textContent = label;
      }

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
    }`;

const newApplyLanguage = `function applyLanguage(code) {
      const dict = i18n[code] || i18n.en;

      // 1. Language Selection Screen
      const tChooseTitle = document.getElementById('t_chooseLangTitle');
      const tChooseSub = document.getElementById('t_chooseLangSub');
      const tBtnContinueLang = document.getElementById('t_btnContinueLang');
      if (tChooseTitle) tChooseTitle.textContent = dict.chooseLangTitle;
      if (tChooseSub) tChooseSub.textContent = dict.chooseLangSub;
      if (tBtnContinueLang) {
        const label = (dict.btnContinueLang || dict.btnContinue || 'Continue &rarr;').replace('&rarr;', '→');
        tBtnContinueLang.textContent = label;
      }

      // 2. Onboarding Screen
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

      // 3. Drive View HUD
      const tRoadBump = document.getElementById('t_roadBump');
      const tEndShift = document.getElementById('t_endShift');
      const tBtnIAmAwake = document.getElementById('t_btnIAmAwake');
      const tFrontCamReady = document.getElementById('t_frontCamReady');
      const tTapStartCam = document.getElementById('t_tapStartCam');
      const btnToggleCamText = document.getElementById('btnToggleCamText');
      const alertModalTitle = document.getElementById('alertModalTitle');
      const alertModalSubtitle = document.getElementById('alertModalSubtitle');

      if (tRoadBump) tRoadBump.textContent = dict.roadBump;
      if (tEndShift) tEndShift.textContent = '🏁 ' + dict.endShift;
      if (tBtnIAmAwake) tBtnIAmAwake.textContent = dict.iAmAwake;
      if (tFrontCamReady) tFrontCamReady.textContent = dict.frontCamReady || 'Front Camera Ready';
      if (tTapStartCam) tTapStartCam.textContent = dict.tapStartCam || 'Tap "Start AI Front Camera" below to initiate real-time facial landmark detection';
      if (btnToggleCamText && !cameraActive) btnToggleCamText.textContent = dict.btnStartCam || 'Start AI Front Camera';
      if (alertModalTitle) alertModalTitle.textContent = dict.alertModalTitle || 'CRITICAL: WAKE UP!';
      if (alertModalSubtitle) alertModalSubtitle.textContent = dict.alertModalSubtitle || 'Sustained driver drowsiness detected. Loud cockpit alarm active. Pull over safely immediately.';

      // 4. Shift Safety Scorecard (Complete Native Translation for all 12 Languages)
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
      if (tBtnResumeShift) tBtnResumeShift.textContent = dict.btnResumeShift || 'Resume Current Shift';

      // 5. Update Status Card
      updateDriverStatus(currentDriverState);
    }`;

html = html.replace(oldApplyLanguage, newApplyLanguage);

// 3. Update showSummaryView to use localized badge text
const oldShowSummary = `      const badge = document.getElementById('summaryScoreBadge');
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
      }`;

const newShowSummary = `      const dict = i18n[currentLang] || i18n.en;
      applyLanguage(currentLang);

      const badge = document.getElementById('summaryScoreBadge');
      if (score >= 90) {
        badge.textContent = dict.excellentScore || 'EXCELLENT SAFETY';
        badge.style.color = 'var(--status-green)';
        badge.style.background = 'var(--status-green-light)';
      } else if (score >= 75) {
        badge.textContent = dict.moderateScore || 'MODERATE FATIGUE (ADVISORY)';
        badge.style.color = 'var(--status-amber)';
        badge.style.background = 'var(--status-amber-light)';
      } else {
        badge.textContent = dict.highRiskScore || 'HIGH RISK — MANDATORY REST';
        badge.style.color = 'var(--alert-red)';
        badge.style.background = 'var(--alert-red-light)';
      }`;

html = html.replace(oldShowSummary, newShowSummary);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully updated index.html and web/index.html with full Scoreboard localization!');
