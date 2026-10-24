const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// ==========================================
// 1. MULTILINGUAL VOICE DICTIONARY (ALL 12 LANGUAGES)
// ==========================================
const voiceTranslations = {
  en: {
    voiceYawnWarning: "Be careful! Driver fatigue warning.",
    voicePostSirenAdvisory: "Be careful with driving! Keep your eyes on the road.",
    voiceCriticalDrowsy: "Warning! Wake up! Critical drowsiness detected."
  },
  hi: {
    voiceYawnWarning: "सावधान रहें! थकान की चेतावनी।",
    voicePostSirenAdvisory: "सावधानी से गाड़ी चलाएं! सड़क पर ध्यान दें।",
    voiceCriticalDrowsy: "चेतावनी! जागिए! गंभीर झपकी का पता चला।"
  },
  kn: {
    voiceYawnWarning: "ಎಚ್ಚರವಾಗಿರಿ! ಚಾಲಕ ದಣಿವು ಎಚ್ಚರಿಕೆ.",
    voicePostSirenAdvisory: "ಚಾಲನೆಯಲ್ಲಿ ಎಚ್ಚರವಾಗಿರಿ! ರಸ್ತೆಯ ಮೇಲೆ ಗಮನವಿರಲಿ.",
    voiceCriticalDrowsy: "ಎಚ್ಚರಿಕೆ! ಎಚ್ಚರಗೊಳ್ಳಿ! ನಿದ್ರಾವಸ್ಥೆ ಪತ್ತೆಯಾಗಿದೆ."
  },
  ta: {
    voiceYawnWarning: "கவனமாக இருங்கள்! ஓட்டுநர் சோர்வு எச்சரிக்கை.",
    voicePostSirenAdvisory: "கவனமாக வாகனம் ஓட்டுங்கள்! சாலையில் கவனம் செலுத்துங்கள்.",
    voiceCriticalDrowsy: "எச்சரிக்கை! விழித்திருங்கள்! தீவிர தூக்கம் கண்டறியப்பட்டது."
  },
  te: {
    voiceYawnWarning: "జాగ్రత్తగా ఉండండి! డ్రైవర్ అలసట హెచ్చరిక.",
    voicePostSirenAdvisory: "జాగ్రత్తగా డ్రైవ్ చేయండి! రోడ్డుపై దృష్టి పెట్టండి.",
    voiceCriticalDrowsy: "హెచ్చరిక! మేల్కొనండి! తీవ్రమైన నిద్రమత్తు గుర్తించబడింది."
  },
  mr: {
    voiceYawnWarning: "काळजी घ्या! चालक थकवा चेतावणी.",
    voicePostSirenAdvisory: "काळजीपूर्वक गाडी चालवा! रस्त्यावर लक्ष ठेवा.",
    voiceCriticalDrowsy: "सावधान! जागे व्हा! गंभीर झोप आढळली."
  },
  bn: {
    voiceYawnWarning: "সতর্ক থাকুন! চালকের ক্লান্তি সতর্কতা।",
    voicePostSirenAdvisory: "সাবধানে গাড়ি চালান! রাস্তায় নজর রাখুন।",
    voiceCriticalDrowsy: "সতর্কতা! জেগে উঠুন! গুরুতর তন্দ্রা সনাক্ত হয়েছে।"
  },
  gu: {
    voiceYawnWarning: "સાવચેત રહો! ડ્રાઇવર થાકની ચેતવણી.",
    voicePostSirenAdvisory: "સાવધાનીથી વાહન ચલાવો! રસ્તા પર ધ્યાન આપો.",
    voiceCriticalDrowsy: "ચેતવણી! જાગો! ગંભીર ઊંઘની સ્થિતિ જણાઈ."
  },
  ml: {
    voiceYawnWarning: "ശ്രദ്ധിക്കുക! ഡ്രൈവർ ക്ഷീണ മുന്നറിയിപ്പ്.",
    voicePostSirenAdvisory: "ശ്രദ്ധയോടെ ഡ്രൈവ് ചെയ്യുക! റോഡിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.",
    voiceCriticalDrowsy: "മുന്നറിയിപ്പ്! ഉണരുക! അത്യധികം ഉറക്കം കണ്ടെത്തി."
  },
  pa: {
    voiceYawnWarning: "ਸਾਵਧਾਨ ਰਹੋ! ਡਰਾਈਵਰ ਥਕਾਵਟ ਚੇਤਾਵਨੀ।",
    voicePostSirenAdvisory: "ਧਿਆਨ ਨਾਲ ਗੱਡੀ ਚਲਾਓ! ਸੜਕ 'ਤੇ ਧਿਆਨ ਰੱਖੋ।",
    voiceCriticalDrowsy: "ਚੇਤਾਵਨੀ! ਜਾਗੋ! ਗੰਭੀਰ ਨੀਂਦ ਦਾ ਪਤਾ ਲੱਗਾ।"
  },
  or: {
    voiceYawnWarning: "ସତର୍କ ରୁହନ୍ତୁ! ଚାଳକ କ୍ଳାନ୍ତ ସତର୍କତା।",
    voicePostSirenAdvisory: "ସାବଧାନରେ ଗାଡି ଚଳାନ୍ତୁ! ରାସ୍ତା ଉପରେ ଧ୍ୟାନ ଦିଅନ୍ତୁ।",
    voiceCriticalDrowsy: "ଚେତାବନୀ! ଜାଗ୍ରତ ହୁଅନ୍ତୁ! ଗମ୍ଭୀର ନିଦ୍ରା ଚିହ୍ନଟ ହୋଇଛି।"
  },
  as: {
    voiceYawnWarning: "সাৱধান হওক! চালকৰ ভাগৰুৱা সতৰ্কবাণী।",
    voicePostSirenAdvisory: "সাৱধানে গাড়ী চলাওক! ৰাস্তাত দৃষ্টি ৰাখক।",
    voiceCriticalDrowsy: "সতৰ্কবাণী! সাৰ পাওক! গভীৰ টোপনি ধৰা পৰিছে।"
  }
};

// Insert translations into each language block of i18n
Object.keys(voiceTranslations).forEach(code => {
  const marker = `${code}: {`;
  const t = voiceTranslations[code];
  const insertText = `voiceYawnWarning: "${t.voiceYawnWarning}",\n        voicePostSirenAdvisory: "${t.voicePostSirenAdvisory}",\n        voiceCriticalDrowsy: "${t.voiceCriticalDrowsy}",\n        `;
  html = html.replace(marker, `${marker}\n        ${insertText}`);
});

// ==========================================
// 2. MULTILINGUAL SPEECH SYNTHESIS ENGINE
// ==========================================
const oldSpeakFunc = `    // --- EMERGENCY ALERTS & >=4s WHATSAPP ESCALATION ---
    function speakVoiceAlert(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const ut = new SpeechSynthesisUtterance(text);
          ut.rate = 1.05;
          window.speechSynthesis.speak(ut);
        } catch(e) {}
      }
    }`;

const newSpeakFunc = `    // --- MULTILINGUAL REGIONAL SPEECH SYNTHESIS ENGINE ---
    const langVoiceMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN'
    };

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        try { window.speechSynthesis.getVoices(); } catch(e) {}
      };
    }

    function speakLocalizedVoiceAlert(key, fallbackText) {
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const dict = i18n[currentLang] || i18n.en;
        const text = dict[key] || fallbackText || dict.voicePostSirenAdvisory || 'Be careful with driving!';
        const targetLocale = langVoiceMap[currentLang] || 'en-IN';

        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = targetLocale;
        ut.rate = 0.98;
        ut.pitch = 1.02;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const langPrefix = targetLocale.split('-')[0].toLowerCase();
          const matchedVoice = voices.find(v => {
            const vLang = (v.lang || '').toLowerCase().replace('_', '-');
            return vLang === targetLocale.toLowerCase() || vLang.startsWith(langPrefix);
          });
          if (matchedVoice) {
            ut.voice = matchedVoice;
          }
        }

        window.speechSynthesis.speak(ut);
      } catch(e) {
        console.warn('Speech synthesis error:', e);
      }
    }

    function speakVoiceAlert(text) {
      speakLocalizedVoiceAlert('voiceCriticalDrowsy', text);
    }`;

html = html.replace(oldSpeakFunc, newSpeakFunc);

// ==========================================
// 3. UPDATE YAWN ESCALATION IN onFaceMeshResults: 2 YAWNS -> VOICE ADVISORY, 4 YAWNS -> SIREN
// ==========================================
const oldYawnDetection = `        if (yawnDur >= 950 && !yawnCounted) {
          yawnCounted = true;
          yawnCount++;
          playWarningChime();
          logEvent('LEVEL 1 ALERT: Yawn detected (' + (yawnDur/1000).toFixed(1) + 's). Total: ' + yawnCount);

          if (yawnCount >= 4 && !isLevel2AlarmActive) {
            triggerEmergencyModal(dict.criticalYawnsTitle);
            logEvent('LEVEL 2 EMERGENCY: Chronic yawns (' + yawnCount + '). Siren triggered!');
            syncFleetEmergency('Chronic Yawns (x' + yawnCount + ')');
          }
        }`;

const newYawnDetection = `        if (yawnDur >= 950 && !yawnCounted) {
          yawnCounted = true;
          yawnCount++;
          logEvent('LEVEL 1 ALERT: Yawn detected (' + (yawnDur/1000).toFixed(1) + 's). Total: ' + yawnCount);

          if (yawnCount === 2) {
            playWarningChime();
            speakLocalizedVoiceAlert('voiceYawnWarning', 'Be careful! Driver fatigue warning.');
            logEvent('VOICE ADVISORY: 2 Yawns reached. Spoke fatigue advisory in ' + (currentLang).toUpperCase() + '.');
          } else if (yawnCount >= 4 && !isLevel2AlarmActive) {
            triggerEmergencyModal(dict.criticalYawnsTitle);
            logEvent('LEVEL 2 EMERGENCY: Chronic yawns (' + yawnCount + '). Siren triggered!');
            syncFleetEmergency('Chronic Yawns (x' + yawnCount + ')');
          } else {
            playWarningChime();
          }
        }`;

html = html.replace(oldYawnDetection, newYawnDetection);

// Update simulateYawn in pitch simulator as well
const oldSimulateYawn = `    function simulateYawn() {
      yawnCount++;
      playWarningChime();
      logEvent('SIMULATION: Yawn alert. Count: ' + yawnCount);
      if (yawnCount >= 4) {
        const dict = i18n[currentLang] || i18n.en;
        triggerEmergencyModal(dict.criticalYawnsTitle);
        syncFleetEmergency('Simulated Chronic Yawns (x' + yawnCount + ')');
      }
    }`;

const newSimulateYawn = `    function simulateYawn() {
      yawnCount++;
      logEvent('SIMULATION: Yawn alert. Count: ' + yawnCount);
      if (yawnCount === 2) {
        playWarningChime();
        speakLocalizedVoiceAlert('voiceYawnWarning', 'Be careful! Driver fatigue warning.');
        logEvent('VOICE ADVISORY: 2 Yawns reached. Spoke fatigue advisory in ' + (currentLang).toUpperCase() + '.');
      } else if (yawnCount >= 4) {
        const dict = i18n[currentLang] || i18n.en;
        triggerEmergencyModal(dict.criticalYawnsTitle);
        syncFleetEmergency('Simulated Chronic Yawns (x' + yawnCount + ')');
      } else {
        playWarningChime();
      }
    }`;

html = html.replace(oldSimulateYawn, newSimulateYawn);

// ==========================================
// 4. TRIGGER NATIVE VOICE ADVISORY IMMEDIATELY AFTER SIREN IS STOPPED
// ==========================================
const oldDismissFunc = `    function dismissEmergencyAlert() {
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
    }`;

const newDismissFunc = `    function dismissEmergencyAlert() {
      const wasSirenActive = isLevel2AlarmActive;
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

      // RIGHT AFTER SIREN IS STOPPED: Speak native post-siren driving advisory!
      if (wasSirenActive) {
        setTimeout(() => {
          speakLocalizedVoiceAlert('voicePostSirenAdvisory', 'Be careful with driving! Keep your eyes on the road.');
          logEvent('VOICE ADVISORY: Spoke post-siren driving advisory in ' + (currentLang).toUpperCase() + '.');
        }, 350);
      }
    }`;

html = html.replace(oldDismissFunc, newDismissFunc);

// Update triggerEmergencyModal to speak native critical alert when siren starts
const oldTriggerEmergencyModal = `    function triggerEmergencyModal(titleText) {
      speakVoiceAlert(titleText || 'Warning! Critical driver drowsiness detected.');
      isLevel2AlarmActive = true;
      startLevel2CockpitSiren();
      const modal = document.getElementById('alertModalOverlay');
      const title = document.getElementById('alertModalTitle');
      if (title) title.textContent = titleText || 'CRITICAL: WAKE UP!';
      if (modal) modal.style.display = 'flex';
      
      startEmergencyEscalation();
    }`;

const newTriggerEmergencyModal = `    function triggerEmergencyModal(titleText) {
      speakLocalizedVoiceAlert('voiceCriticalDrowsy', titleText || 'Warning! Wake up! Critical drowsiness detected.');
      isLevel2AlarmActive = true;
      startLevel2CockpitSiren();
      const modal = document.getElementById('alertModalOverlay');
      const title = document.getElementById('alertModalTitle');
      if (title) title.textContent = titleText || 'CRITICAL: WAKE UP!';
      if (modal) modal.style.display = 'flex';
      
      startEmergencyEscalation();
    }`;

html = html.replace(oldTriggerEmergencyModal, newTriggerEmergencyModal);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully implemented multilingual siren & post-siren voice advisories across all 12 languages!');
