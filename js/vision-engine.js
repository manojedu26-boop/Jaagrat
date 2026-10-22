/**
 * Jaagrat Vision & Sensor Engine
 * Handles webcam stream, facial landmark analysis / simulation,
 * rolling PERCLOS calculation, road shock pothole suppression,
 * and Web Audio multi-tier regional alert synthesis.
 */

class VisionEngine {
  constructor() {
    this.videoElement = document.getElementById('webcam-feed');
    this.canvasElement = document.getElementById('vision-canvas');
    this.ctx = this.canvasElement ? this.canvasElement.getContext('2d') : null;
    
    // Detection State
    this.isCameraActive = false;
    this.currentLanguage = 'hi';
    this.currentSpeedKmH = 64.0;
    this.isPotholeShockActive = false;
    this.potholeSuppressEndTime = 0;
    
    // Sliding Windows
    this.earScore = 0.32; // Normal open eye baseline
    this.rollingClosedBuffer = []; // 60-second buffer
    this.kBufferSize = 900; // 60s * 15 FPS
    this.consecutiveClosedFrames = 0;
    this.pitchAngle = 2.4; // Degrees
    this.consecutivePitchDropFrames = 0;

    // Alert State
    this.isL2AlarmActive = false;
    this.audioCtx = null;
    this.sirenOscillator = null;
    this.sirenGainNode = null;
    this.lastAlertTime = 0;

    // Regional Voice Phrases
    this.regionalPhrases = {
      hi: {
        l1: "कृपया सड़क पर ध्यान दें, थोड़ा पानी पिएं।",
        l3: "गंभीर थकान! कृपया गाड़ी तुरंत सुरक्षित जगह रोकें।"
      },
      kn: {
        l1: "ದಯವಿಟ್ಟು ರಸ್ತೆಯ ಮೇಲೆ ಗಮನವಿರಲಿ, ನೀರು ಕುಡಿಯಿರಿ.",
        l3: "ಅತಿಯಾದ ದಣಿವು! ದಯವಿಟ್ಟು ವಾಹನವನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ."
      },
      ta: {
        l1: "சாலையில் கவனம் செலுத்துங்கள், தண்ணீர் குடியுங்கள்.",
        l3: "அதிக சோர்வு! தயவுசெய்து வாகனத்தை உடனே நிறுத்துங்கள்."
      },
      te: {
        l1: "దయచేసి రోడ్డుపై దృష్టి పెట్టండి, నీరు త్రాగండి.",
        l3: "తీవ్రమైన అలసట! దయచేసి వాహనాన్ని వెంటనే ఆపండి."
      },
      mr: {
        l1: "कृपया रस्त्यावर लक्ष द्या, थोडे पाणी प्या.",
        l3: "अति थकवा! कृपया गाडी त्वरित बाजूला थांबवा."
      },
      en: {
        l1: "Please stay alert and keep your eyes on the road.",
        l3: "Critical fatigue detected! Please pull over safely now."
      }
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startInferenceLoop();
  }

  setupEventListeners() {
    // Camera toggle
    const btnCam = document.getElementById('btn-toggle-camera');
    if (btnCam) {
      btnCam.addEventListener('click', () => this.toggleWebcam());
    }

    // Speed slider
    const speedSlider = document.getElementById('slider-speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.currentSpeedKmH = parseFloat(e.target.value);
        this.updateSpeedUI();
      });
    }

    // Pothole shock simulation button
    const btnShock = document.getElementById('btn-trigger-shock');
    if (btnShock) {
      btnShock.addEventListener('click', () => this.triggerPotholeShock());
    }

    // Scenario test buttons
    const btnMicrosleep = document.getElementById('btn-test-microsleep');
    if (btnMicrosleep) {
      btnMicrosleep.addEventListener('click', () => this.simulateMicrosleep());
    }

    const btnPerclos = document.getElementById('btn-test-perclos');
    if (btnPerclos) {
      btnPerclos.addEventListener('click', () => this.simulateHighPerclos());
    }

    const btnHeadNod = document.getElementById('btn-test-headnod');
    if (btnHeadNod) {
      btnHeadNod.addEventListener('click', () => this.simulateHeadNod());
    }

    const btnYawn = document.getElementById('btn-test-yawn');
    if (btnYawn) {
      btnYawn.addEventListener('click', () => this.simulateYawn());
    }

    // "I'M AWAKE" button
    const btnAwake = document.getElementById('btn-im-awake');
    if (btnAwake) {
      btnAwake.addEventListener('click', () => this.dismissL2Alarm());
    }

    // Language chips
    const chips = document.querySelectorAll('.lang-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentLanguage = chip.dataset.lang;
        this.playLevel1Audio("Language updated");
      });
    });
  }

  async toggleWebcam() {
    const btnText = document.getElementById('camera-btn-text');
    if (this.isCameraActive) {
      // Stop webcam
      if (this.videoElement && this.videoElement.srcObject) {
        this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        this.videoElement.srcObject = null;
      }
      this.isCameraActive = false;
      if (btnText) btnText.textContent = "Start Webcam Feed";
    } else {
      // Start webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        if (this.videoElement) {
          this.videoElement.srcObject = stream;
          this.videoElement.play();
        }
        this.isCameraActive = true;
        if (btnText) btnText.textContent = "Stop Webcam Feed";
      } catch (err) {
        console.warn("Webcam access rejected or unavailable, falling back to simulated inference mode:", err);
        alert("Camera permission not granted or no webcam found. Vision Engine will run in intelligent simulation mode!");
      }
    }
  }

  updateSpeedUI() {
    const label = document.getElementById('label-speed-slider');
    const hudLabel = document.getElementById('hud-status-label');
    const hudDot = document.getElementById('hud-status-dot');

    const isArmed = this.currentSpeedKmH >= 10.0;
    const text = `${Math.round(this.currentSpeedKmH)} km/h (${isArmed ? 'ARMED' : 'STANDBY'})`;

    if (label) label.textContent = text;
    if (hudLabel) hudLabel.textContent = isArmed ? `ARMED (${Math.round(this.currentSpeedKmH)} km/h)` : `STANDBY (<10 km/h)`;
    
    if (hudDot) {
      if (isArmed) {
        hudDot.className = "hud-status-dot armed";
      } else {
        hudDot.className = "hud-status-dot standby";
      }
    }
  }

  triggerPotholeShock() {
    this.isPotholeShockActive = true;
    this.potholeSuppressEndTime = Date.now() + 600; // 600ms suppression
    
    // UI indicator
    const shockVal = document.getElementById('val-shock');
    const shockBar = document.getElementById('bar-shock');
    const indicator = document.getElementById('shock-indicator');

    if (shockVal) shockVal.textContent = "2.35 G (SHOCK!)";
    if (shockBar) {
      shockBar.style.width = "95%";
      shockBar.className = "meter-bar-fill danger";
    }
    if (indicator) {
      indicator.textContent = "ROAD BUMP! Frame Data Suppressed (600ms)";
      indicator.style.color = "#ef4444";
    }

    setTimeout(() => {
      this.isPotholeShockActive = false;
      if (shockVal) shockVal.textContent = "0.98 G";
      if (shockBar) {
        shockBar.style.width = "30%";
        shockBar.className = "meter-bar-fill safe";
      }
      if (indicator) {
        indicator.textContent = "Shock Status: Normal";
        indicator.style.color = "var(--text-muted)";
      }
    }, 600);
  }

  startInferenceLoop() {
    // 15 FPS simulation loop (approx 66ms per tick)
    setInterval(() => {
      this.evaluateFrame();
    }, 66);
  }

  evaluateFrame() {
    const now = Date.now();

    // Guard 1: Pothole / Road Shock suppression
    if (now < this.potholeSuppressEndTime) {
      return; // Discard frame during vibration
    }

    // Guard 2: Speed Arming Guard (< 10 km/h is stationary/parked)
    if (this.currentSpeedKmH < 10.0) {
      return; // Do not alert when parked
    }

    // Natural slight jitter simulation when open
    if (!this.simulatingClosure) {
      this.earScore = 0.30 + (Math.random() * 0.04 - 0.02);
      this.pitchAngle = 2.0 + (Math.random() * 1.5 - 0.75);
    }

    const isEyeClosed = this.earScore < 0.20;
    const isHeadDropped = this.pitchAngle < -25.0;

    // Update 60s PERCLOS rolling buffer
    if (this.rollingClosedBuffer.length >= this.kBufferSize) {
      this.rollingClosedBuffer.shift();
    }
    this.rollingClosedBuffer.push(isEyeClosed);

    // Consecutive closed frames
    if (isEyeClosed) {
      this.consecutiveClosedFrames++;
    } else {
      this.consecutiveClosedFrames = 0;
    }

    // Consecutive head drop
    if (isHeadDropped) {
      this.consecutivePitchDropFrames++;
    } else {
      this.consecutivePitchDropFrames = 0;
    }

    // Check Trigger: Microsleep (1.2s continuous = 18 frames @ 15fps)
    if (this.consecutiveClosedFrames >= 18) {
      this.triggerEscalation(2, "Microsleep (1.2s+ Eye Closure)");
      this.consecutiveClosedFrames = 0;
    }

    // Check Trigger: Sudden Head Drop (>25 deg forward for 1.0s = 15 frames)
    if (this.consecutivePitchDropFrames >= 15) {
      this.triggerEscalation(2, "Head Nod / Sudden Drop");
      this.consecutivePitchDropFrames = 0;
    }

    // Check Trigger: Rolling PERCLOS > 20%
    if (this.rollingClosedBuffer.length > 200) {
      const closedCount = this.rollingClosedBuffer.filter(c => c).length;
      const perclosRatio = closedCount / this.rollingClosedBuffer.length;
      if (perclosRatio > 0.20 && (now - this.lastAlertTime > 25000)) {
        this.triggerEscalation(1, `PERCLOS Trend: ${(perclosRatio * 100).toFixed(0)}%`);
        this.rollingClosedBuffer = []; // reset window
      }
    }

    this.updateGaugesUI();
  }

  updateGaugesUI() {
    // EAR
    const valEar = document.getElementById('val-ear');
    const barEar = document.getElementById('bar-ear');
    if (valEar) valEar.textContent = this.earScore.toFixed(2);
    if (barEar) {
      const pct = Math.min(100, Math.max(5, (this.earScore / 0.40) * 100));
      barEar.style.width = `${pct}%`;
      barEar.className = this.earScore < 0.20 ? 'meter-bar-fill danger' : 'meter-bar-fill safe';
    }

    // PERCLOS
    const valPerclos = document.getElementById('val-perclos');
    const barPerclos = document.getElementById('bar-perclos');
    const closedCount = this.rollingClosedBuffer.filter(c => c).length;
    const perclosRatio = this.rollingClosedBuffer.length > 0 ? (closedCount / this.rollingClosedBuffer.length) : 0.04;
    const perclosPct = (perclosRatio * 100).toFixed(1);

    if (valPerclos) valPerclos.textContent = `${perclosPct}%`;
    if (barPerclos) {
      barPerclos.style.width = `${Math.min(100, perclosRatio * 300)}%`;
      barPerclos.className = perclosRatio > 0.20 ? 'meter-bar-fill danger' : (perclosRatio > 0.12 ? 'meter-bar-fill warning' : 'meter-bar-fill safe');
    }

    // Pitch
    const valPitch = document.getElementById('val-pitch');
    const barPitch = document.getElementById('bar-pitch');
    if (valPitch) valPitch.textContent = `${this.pitchAngle > 0 ? '+' : ''}${this.pitchAngle.toFixed(1)}°`;
    if (barPitch) {
      const pitchPct = Math.min(100, Math.max(10, 50 - this.pitchAngle));
      barPitch.style.width = `${pitchPct}%`;
      barPitch.className = this.pitchAngle < -25 ? 'meter-bar-fill danger' : 'meter-bar-fill safe';
    }

    // Update phone tracking box visual
    const leftEye = document.getElementById('box-left-eye');
    const rightEye = document.getElementById('box-right-eye');
    if (leftEye && rightEye) {
      if (this.earScore < 0.20) {
        leftEye.classList.add('closed');
        rightEye.classList.add('closed');
      } else {
        leftEye.classList.remove('closed');
        rightEye.classList.remove('closed');
      }
    }
  }

  triggerEscalation(level, reason) {
    this.lastAlertTime = Date.now();

    if (level === 1) {
      // Level 1: Gentle regional voice alert
      this.playLevel1Audio(reason);
      if (window.JaagratApp) {
        window.JaagratApp.addEventToFeed({
          vehicleId: "KA-01-AB-1234",
          driverName: "Rajesh Gowda",
          level: 1,
          reason: reason,
          speed: this.currentSpeedKmH,
          location: "Tumkur Bypass, NH48"
        });
      }
    } else if (level === 2) {
      // Level 2: Piercing Siren + Red Emergency Dismissal Overlay
      this.isL2AlarmActive = true;
      const overlay = document.getElementById('phone-l2-overlay');
      const reasonText = document.getElementById('l2-reason-text');
      if (overlay) overlay.style.display = 'flex';
      if (reasonText) reasonText.textContent = reason;

      this.startSirenLoop();

      if (window.JaagratApp) {
        window.JaagratApp.addEventToFeed({
          vehicleId: "KA-01-AB-1234",
          driverName: "Rajesh Gowda",
          level: 2,
          reason: reason,
          speed: this.currentSpeedKmH,
          location: "Tumkur Bypass, NH48"
        });
      }
    }
  }

  playLevel1Audio(reason) {
    const lang = this.currentLanguage || 'hi';
    const text = this.regionalPhrases[lang]?.l1 || this.regionalPhrases['hi'].l1;

    // 1. Play gentle soft chime via Web Audio
    this.playSoftChime();

    // 2. Speak the regional phrase via SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  playSoftChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }
  }

  startSirenLoop() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();
      
      this.sirenOscillator = this.audioCtx.createOscillator();
      this.sirenGainNode = this.audioCtx.createGain();

      this.sirenOscillator.type = 'sawtooth';
      this.sirenOscillator.frequency.setValueAtTime(800, this.audioCtx.currentTime);

      // Oscillate frequency like an ambulance siren
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 20; i++) {
        this.sirenOscillator.frequency.linearRampToValueAtTime(1400, now + (i * 0.8) + 0.4);
        this.sirenOscillator.frequency.linearRampToValueAtTime(800, now + (i * 0.8) + 0.8);
      }

      this.sirenGainNode.gain.setValueAtTime(0.4, this.audioCtx.currentTime);

      this.sirenOscillator.connect(this.sirenGainNode);
      this.sirenGainNode.connect(this.audioCtx.destination);

      this.sirenOscillator.start();
    } catch (e) {
      console.warn("Siren synthesis error:", e);
    }
  }

  dismissL2Alarm() {
    this.isL2AlarmActive = false;
    const overlay = document.getElementById('phone-l2-overlay');
    if (overlay) overlay.style.display = 'none';

    // Stop Siren
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
      } catch (_) {}
      this.sirenOscillator = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }

    // Reset temporary simulated variables
    this.simulatingClosure = false;
    this.earScore = 0.32;
    this.pitchAngle = 2.4;
  }

  // --- Scenario Simulation Helpers ---
  simulateMicrosleep() {
    this.simulatingClosure = true;
    this.earScore = 0.08; // Eyes closed
    setTimeout(() => {
      this.simulatingClosure = false;
      this.earScore = 0.32;
    }, 1600);
  }

  simulateHighPerclos() {
    // Fill 60s buffer with 40% closures
    this.rollingClosedBuffer = [];
    for (let i = 0; i < 400; i++) {
      this.rollingClosedBuffer.push(i % 2 === 0);
    }
    this.evaluateFrame();
  }

  simulateHeadNod() {
    this.simulatingClosure = true;
    this.pitchAngle = -32.0; // Deep chin drop
    setTimeout(() => {
      this.simulatingClosure = false;
      this.pitchAngle = 2.4;
    }, 1500);
  }

  simulateYawn() {
    this.triggerEscalation(1, "Yawn Cluster (2 deep yawns detected)");
  }
}

// Instantiate globally
window.addEventListener('DOMContentLoaded', () => {
  window.VisionEngine = new VisionEngine();
});
