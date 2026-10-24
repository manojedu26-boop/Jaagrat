const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// ==========================================
// 1. CSS FOR DRIVER PROFILE & AI HIGHWAY RADIO
// ==========================================
const profileAndRadioCss = `
    /* HEADER DRIVER PROFILE AVATAR BUTTON */
    .btn-profile-avatar {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #2563EB;
      background: #FFFFFF;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      flex-shrink: 0;
    }
    .btn-profile-avatar:hover {
      transform: scale(1.06);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .header-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    .avatar-online-dot {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 10px;
      height: 10px;
      background: #22C55E;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
    }

    /* AI HIGHWAY RADIO COMPANION BUTTON */
    .btn-radio-companion {
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
      border: 1.5px solid #BFDBFE;
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);
      margin-top: 4px;
    }
    .btn-radio-companion:hover {
      background: #DBEAFE;
      border-color: #3B82F6;
      transform: translateY(-1px);
    }
    .btn-radio-companion.playing {
      background: #EFF6FF;
      border-color: #2563EB;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    .radio-pulse-icon {
      font-size: 20px;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #DBEAFE;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .btn-radio-companion.playing .radio-pulse-icon {
      animation: pulseAlert 0.8s infinite alternate;
      background: #2563EB;
      color: white;
    }
    .radio-live-badge {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 12px;
      background: #E2E8F0;
      color: #64748B;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .radio-live-badge.live {
      background: #DCFCE7;
      color: #16A34A;
      animation: pulseAlert 0.5s infinite alternate;
    }

    /* DRIVER PROFILE VIEW / SCREEN */
    .profile-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      padding-bottom: 24px;
    }
    .profile-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 12px;
    }
    .profile-hero-card {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      border-radius: 18px;
      padding: 20px 16px;
      color: white;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
      position: relative;
    }
    .profile-avatar-wrapper {
      position: relative;
      width: 86px;
      height: 86px;
      margin: 0 auto 10px auto;
      cursor: pointer;
    }
    .profile-large-avatar {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #38BDF8;
      box-shadow: 0 4px 16px rgba(56, 189, 248, 0.35);
    }
    .avatar-edit-overlay {
      position: absolute;
      bottom: 0px;
      right: -2px;
      background: #2563EB;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 6px;
      border-radius: 10px;
      border: 1.5px solid white;
    }
    .profile-hero-name {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.3px;
    }
    .profile-hero-sub {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 2px;
    }
    .profile-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      width: 100%;
      margin-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 12px;
    }
    .profile-stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .profile-stat-val {
      font-size: 15px;
      font-weight: 900;
      color: #38BDF8;
      font-family: 'JetBrains Mono', monospace;
    }
    .profile-stat-lbl {
      font-size: 9px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .profile-form-section {
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section-header-badge {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 2px;
    }
`;

html = html.replace('/* REAL LEAFLET MAP WRAPPER */', `${profileAndRadioCss}\n    /* REAL LEAFLET MAP WRAPPER */`);

// ==========================================
// 2. ADD PROFILE AVATAR BUTTON IN DRIVER HEADER
// ==========================================
const oldDriverHeader = `            <div class="driver-header">
              <div class="driver-id-group">
                <span class="vehicle-tag" id="dispVehicleTag">KA-01-AB-1234</span>
                <span class="driver-name-tag" id="dispDriverTag">Ramesh K.</span>
              </div>
              
              <!-- REAL-TIME SPEEDOMETER PILL -->
              <div class="speed-status-pill armed" id="screenSpeedPill" onclick="toggleGpsModal()" title="Click to toggle GPS / Speed simulator">
                <span id="gpsDotIcon">🛰️</span>
                <span id="speedKmhText">42 km/h</span>
                <span style="opacity:0.6;">•</span>
                <span id="speedModeText">ARMED</span>
              </div>
            </div>`;

const newDriverHeader = `            <div class="driver-header">
              <div class="driver-id-group">
                <span class="vehicle-tag" id="dispVehicleTag">KA-01-AB-1234</span>
                <span class="driver-name-tag" id="dispDriverTag">Ramesh K.</span>
              </div>
              
              <div style="display:flex; align-items:center; gap:8px;">
                <!-- REAL-TIME SPEEDOMETER PILL -->
                <div class="speed-status-pill armed" id="screenSpeedPill" onclick="toggleGpsModal()" title="Click to toggle GPS / Speed simulator">
                  <span id="gpsDotIcon">🛰️</span>
                  <span id="speedKmhText">42 km/h</span>
                  <span style="opacity:0.6;">•</span>
                  <span id="speedModeText">ARMED</span>
                </div>

                <!-- DRIVER PROFILE & SETTINGS AVATAR BUTTON -->
                <button class="btn-profile-avatar" onclick="openDriverProfile()" title="Driver Profile & Settings" id="btnProfileHeader">
                  <img id="headerAvatarImg" src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80" alt="Driver" class="header-avatar-img">
                  <span class="avatar-online-dot"></span>
                </button>
              </div>
            </div>`;

html = html.replace(oldDriverHeader, newDriverHeader);

// ==========================================
// 3. ADD AI HIGHWAY RADIO COMPANION IN DRIVER ACTIONS
// ==========================================
const oldDriverActions = `            <!-- Bottom Driver Action Controls -->
            <div class="driver-actions">
              <button class="btn-primary" id="btnToggleCam" onclick="toggleFrontCamera()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span id="btnToggleCamText">Start AI Front Camera</span>
              </button>
              
              <!-- HIGH-IMPACT END SHIFT BUTTON -->
              <button class="btn-end-shift" onclick="showSummaryView()">
                <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path d="M4 4v16"/>
                </svg>
                <span id="t_endShift">🏁 End Shift & View Safety Scorecard</span>
              </button>
            </div>`;

const newDriverActions = `            <!-- Bottom Driver Action Controls -->
            <div class="driver-actions">
              <button class="btn-primary" id="btnToggleCam" onclick="toggleFrontCamera()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span id="btnToggleCamText">Start AI Front Camera</span>
              </button>

              <!-- AI HIGHWAY RADIO (MIDNIGHT COMPANION FOR FATIGUE PREVENTION) -->
              <button class="btn-radio-companion" id="btnHighwayRadio" onclick="toggleHighwayRadio()">
                <div class="radio-pulse-icon" id="radioPulseIcon">📻</div>
                <div style="display:flex; flex-direction:column; text-align:left; flex:1;">
                  <span style="font-size:12px; font-weight:800; color:var(--text-main);" id="radioTitleText">AI Highway Radio: Midnight Companion</span>
                  <span style="font-size:10px; color:var(--text-muted);" id="radioSubText">Tap to listen to live news in your language</span>
                </div>
                <span class="radio-live-badge" id="radioStatusBadge">OFF AIR</span>
              </button>
              
              <!-- HIGH-IMPACT END SHIFT BUTTON -->
              <button class="btn-end-shift" onclick="showSummaryView()">
                <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path d="M4 4v16"/>
                </svg>
                <span id="t_endShift">🏁 End Shift & View Safety Scorecard</span>
              </button>
            </div>`;

html = html.replace(oldDriverActions, newDriverActions);

// ==========================================
// 4. ADD DEDICATED DRIVER PROFILE & SETTINGS SCREEN (HTML)
// ==========================================
const driverProfileHtml = `          <!-- SCREEN 6: DEDICATED DRIVER PROFILE & CREDENTIALS -->
          <div class="profile-view" id="viewDriverProfile" style="display:none;">
            <div class="profile-top-bar">
              <button class="btn-outline" style="border:none; padding:4px 8px; font-size:12px; font-weight:700;" onclick="closeDriverProfile()">
                &larr; Back to Drive
              </button>
              <div style="font-size:13px; font-weight:800; color:var(--text-main);">Driver Profile &amp; Settings</div>
              <span style="font-size:10px; font-weight:800; background:#DCFCE7; color:#16A34A; padding:2px 8px; border-radius:12px;">AIS-140 VERIFIED</span>
            </div>

            <!-- Profile Hero Card with Photo Upload -->
            <div class="profile-hero-card">
              <div class="profile-avatar-wrapper" onclick="document.getElementById('driverPhotoInput').click()" title="Click to upload profile photo">
                <img id="profileCardAvatarImg" src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80" alt="Driver" class="profile-large-avatar">
                <div class="avatar-edit-overlay">📷 Upload</div>
                <input type="file" id="driverPhotoInput" accept="image/*" style="display:none;" onchange="handleDriverPhotoUpload(event)">
              </div>
              <div class="profile-hero-name" id="profHeroName">Ramesh Kumar</div>
              <div class="profile-hero-sub">HGMV Heavy Transport Hauler • VRL National Logistics Ltd.</div>
              <div style="font-size:11px; color:#FBBF24; font-weight:800; margin-top:4px;">⭐ 4.95 / 5.0 (Top 5% Fleet Safety Tier)</div>

              <div class="profile-stats-grid">
                <div class="profile-stat-box">
                  <span class="profile-stat-val">1,420 h</span>
                  <span class="profile-stat-lbl">Safe Driven</span>
                </div>
                <div class="profile-stat-box">
                  <span class="profile-stat-val">96.8%</span>
                  <span class="profile-stat-lbl">Safety Score</span>
                </div>
                <div class="profile-stat-box">
                  <span class="profile-stat-val">318</span>
                  <span class="profile-stat-lbl">Clean Shifts</span>
                </div>
              </div>
            </div>

            <!-- Personal & Commercial Credentials Section -->
            <div class="profile-form-section">
              <div class="section-header-badge">📋 Commercial Driver Credentials</div>

              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="profInputName" value="Ramesh Kumar">
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label class="form-label">Commercial License (DL)</label>
                  <input type="text" class="form-input" id="profInputDL" value="KA-01-2019-0082491" style="font-family:'JetBrains Mono'; font-size:11px;">
                </div>
                <div class="form-group">
                  <label class="form-label">Driver ID Badge</label>
                  <input type="text" class="form-input" id="profInputId" value="DRV-BLR-8429" style="font-family:'JetBrains Mono'; font-size:11px;">
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label class="form-label">Driver Phone</label>
                  <input type="tel" class="form-input" id="profInputPhone" value="+91 98765 43210" style="font-size:11px;">
                </div>
                <div class="form-group">
                  <label class="form-label">Emergency SOS (Family)</label>
                  <input type="tel" class="form-input" id="profInputEmergency" value="+91 98450 11223 (Sunita - Wife)" style="font-size:11px;">
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label class="form-label">Assigned Vehicle</label>
                  <input type="text" class="form-input" id="profInputVehicle" value="KA-01-AB-1234 (BharatBenz 2823R)" style="font-size:11px;">
                </div>
                <div class="form-group">
                  <label class="form-label">Operating Depot</label>
                  <input type="text" class="form-input" id="profInputDepot" value="Bengaluru Central Depot" style="font-size:11px;">
                </div>
              </div>
            </div>

            <!-- Gemini AI Road Radio & System Settings -->
            <div class="profile-form-section">
              <div class="section-header-badge">🎙️ Gemini AI Highway Radio Settings</div>
              <div style="font-size:11px; color:var(--text-muted); line-height:1.4;">
                Connect Google Gemini API for live midnight highway news bulletins, cricket updates, and weather advisories in your mother tongue:
              </div>
              <div class="form-group">
                <label class="form-label">Google Gemini API Key (Optional)</label>
                <input type="password" class="form-input" id="profInputGeminiKey" placeholder="Paste Gemini API Key (Optional)" style="font-family:'JetBrains Mono'; font-size:11px;">
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <button class="btn-primary" onclick="saveDriverProfile()">
                <span>💾 Save Profile &amp; Update HUD</span>
              </button>
              <button class="btn-outline" onclick="closeDriverProfile()">
                <span>✕ Close Profile</span>
              </button>
            </div>
          </div>
`;

// Insert profile view right after viewActiveDrive
html = html.replace('<!-- SCREEN 5: SHIFT SAFETY SCORECARD -->', `${driverProfileHtml}\n          <!-- SCREEN 5: SHIFT SAFETY SCORECARD -->`);

// ==========================================
// 5. JAVASCRIPT FUNCTIONS: PROFILE MGMT & AI HIGHWAY RADIO
// ==========================================
const profileAndRadioJs = `
    // --- DRIVER PROFILE NAVIGATION & PHOTO UPLOAD ---
    function openDriverProfile() {
      document.getElementById('viewActiveDrive').style.display = 'none';
      document.getElementById('viewDriverProfile').style.display = 'flex';
      logEvent('PROFILE: Driver opened Profile & Shift Settings screen.');
    }

    function closeDriverProfile() {
      document.getElementById('viewDriverProfile').style.display = 'none';
      document.getElementById('viewActiveDrive').style.display = 'flex';
    }

    function handleDriverPhotoUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        document.getElementById('headerAvatarImg').src = dataUrl;
        document.getElementById('profileCardAvatarImg').src = dataUrl;
        localStorage.setItem('jaagrat_driver_avatar', dataUrl);
        logEvent('PROFILE: Custom driver photo uploaded and updated in HUD.');
      };
      reader.readAsDataURL(file);
    }

    function saveDriverProfile() {
      const name = document.getElementById('profInputName').value || 'Ramesh Kumar';
      const vehicle = document.getElementById('profInputVehicle').value || 'KA-01-AB-1234';
      const geminiKey = document.getElementById('profInputGeminiKey').value || '';

      document.getElementById('dispDriverTag').textContent = name.split(' ')[0] + ' ' + (name.split(' ')[1] ? name.split(' ')[1][0] + '.' : '');
      document.getElementById('profHeroName').textContent = name;
      
      const vClean = vehicle.split(' ')[0];
      document.getElementById('dispVehicleTag').textContent = vClean;

      localStorage.setItem('jaagrat_driver_name', name);
      localStorage.setItem('jaagrat_driver_vehicle', vehicle);
      if (geminiKey) {
        localStorage.setItem('jaagrat_gemini_key', geminiKey);
      }

      alert('✓ Profile updated successfully! Changes reflected across Cockpit HUD.');
      logEvent('PROFILE: Profile settings saved for ' + name + ' (' + vClean + ').');
      closeDriverProfile();
    }

    // Load saved avatar on initial startup if exists
    window.addEventListener('DOMContentLoaded', () => {
      const savedAvatar = localStorage.getItem('jaagrat_driver_avatar');
      if (savedAvatar) {
        const hImg = document.getElementById('headerAvatarImg');
        const pImg = document.getElementById('profileCardAvatarImg');
        if (hImg) hImg.src = savedAvatar;
        if (pImg) pImg.src = savedAvatar;
      }
    });

    // --- AI HIGHWAY RADIO (MIDNIGHT FATIGUE COMPANION) ---
    let isRadioPlaying = false;

    const radioNewsBulletins = {
      kn: "ನಮಸ್ಕಾರ ರಮೇಶ್ ಅವರೇ! ಇದು ಜಾಗ್ರತ್ AI ಹೈವೇ ರೇಡಿಯೋ ಮಧ್ಯರಾತ್ರಿ ಬುಲೆಟಿನ್. ಇಂದಿನ ಮುಖ್ಯಾಂಶಗಳು: ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ 44 ದಕ್ಷಿಣ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ಬೆಂಗಳೂರಿನಿಂದ ಹೈದರಾಬಾದ್ ವರೆಗೆ ಸಂಚಾರ ಸುಗಮವಾಗಿದೆ. ಭಾರತ ತಂಡ ಕ್ರಿಕೆಟ್‌ನಲ್ಲಿ ಭರ್ಜರಿ ಜಯ ಸಾಧಿಸಿದೆ. ತುಮಕೂರು ಬೈಪಾಸ್ ಬಳಿ ರಸ್ತೆ ನಿರ್ಮಾಣ ಕಾಮಗಾರಿ ನಡೆಯುತ್ತಿರುವುದರಿಂದ ಎಚ್ಚರದಿಂದ ಚಾಲನೆ ಮಾಡಿ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ, ನಿಮ್ಮ ಕಣ್ಣುಗಳು ರಸ್ತೆಯ ಮೇಲಿರಲಿ, ಜಾಗ್ರತ್ ನಿಮ್ಮ ರಕ್ಷಣೆಯಲ್ಲಿದೆ!",
      hi: "नमस्ते रमेश जी! यह जाग्रत AI हाईवे रेडियो का मिडनाइट बुलेटिन है। आज की ताज़ा सुर्खियाँ: राष्ट्रीय राजमार्ग 44 साउथ कॉरिडोर पर बेंगलुरु से हैदराबाद तक यातायात बिल्कुल सामान्य है। भारतीय क्रिकेट टीम ने रोमांचक मैच जीता है। पुणे बाईपास पर हल्की बारिश हो रही है, सुरक्षित दूरी बनाए रखें। रात की यात्रा में सतर्क रहें, जाग्रत हमेशा आपके साथ है!",
      en: "Hello Ramesh! This is Jaagrat AI Highway Radio Midnight Companion. Top headlines: Traffic on NH-44 South Corridor from Bengaluru to Hyderabad is clear and moving smoothly. India clinches an exciting cricket victory. Monsoon road maintenance underway near Pune depot—maintain safe following distance. Stay hydrated, keep your eyes on the road, and have a safe shift with Jaagrat!",
      ta: "வணக்கம் ரமேஷ்! இது ஜாக்ரத் AI நெடுஞ்சாலை வானொலி நள்ளிரவு செய்திகள். தேசிய நெடுஞ்சாலை 44-ல் போக்குவரத்து சீராக உள்ளது. பாதுகாப்பாக வாகனம் ஓட்டுங்கள்!",
      te: "నమస్కారం రమేష్ గారు! ఇది జాగ్రత్ AI హైవే రేడియో అర్ధరాత్రి సమాచారం. జాతీయ రహదారి 44 పై ట్రాఫిక్ సాఫీగా సాగుతోంది. అప్రమత్తంగా డ్రైవ్ చేయండి!",
      mr: "नमस्कार रमेश जी! हे जाग्रत AI हायवे रेडिओचे मध्यरात्रीचे बुलेटिन आहे. राष्ट्रीय महामार्ग 44 वर वाहतूक सुरळीत आहे. काळजीपूर्वक गाडी चालवा!",
      bn: "নমস্কার রমেশ! এটি জাগ্রত এআই হাইওয়ে রেডিও মধ্যরাতের খবর। জাতীয় সড়ক ৪৪-এ যান চলাচল স্বাভাবিক রয়েছে। সাবধানে গাড়ি চালান!",
      gu: "નમસ્તે રમેશ ભાઈ! આ જાગ્રત AI હાઇવે રેડિયો મધ્યરાત્રિ બુલેટિન છે. નેશનલ હાઇવે 44 પર ટ્રાફિક વ્યવસ્થિત છે. સાવધાનીથી વાહન ચલાવો!",
      ml: "നമസ്കാരം രമേശ്! ഇത് ജാഗ്രത് AI ഹൈവേ റേഡിയോ മിഡ്‌നൈറ്റ് വാർത്തകൾ. ദേശീയപാത 44-ൽ ഗതാഗതം സുഗമമാണ്. ശ്രദ്ധയോടെ ഡ്രൈവ് ചെയ്യുക!",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਰਮੇਸ਼ ਜੀ! ਇਹ ਜਾਗਰਤ ਏਆਈ ਹਾਈਵੇ ਰੇਡੀਓ ਹੈ। ਨੈਸ਼ਨਲ ਹਾਈਵੇਅ 44 'ਤੇ ਆਵਾਜਾਈ ਸੁਚਾਰੂ ਹੈ। ਧਿਆਨ ਨਾਲ ਗੱਡੀ ਚਲਾਓ!",
      or: "ନମସ୍କାର ରମେଶ! ଏହା ଜାଗ୍ରତ AI ହାଇୱେ ରେଡିଓ ବୁଲେଟିନ୍। ଜାତୀୟ ରାଜପଥ ୪୪ ରେ ଯାତାୟାତ ସ୍ୱାଭାବିକ ଅଛି। ସାବଧାନରେ ଗାଡି ଚଳାନ୍ତୁ!",
      as: "নমস্কাৰ ৰমেশ! এইটো জাগ্ৰত এআই হাইৱে ৰেডিঅ'ৰ বাতৰি। ৰাষ্ট্ৰীয় ঘাইপথ ৪৪ত যান-বাহন চলাচল স্বাভাৱিক। সাৱধানে গাড়ী চলাওক!"
    };

    async function toggleHighwayRadio() {
      const btn = document.getElementById('btnHighwayRadio');
      const badge = document.getElementById('radioStatusBadge');
      const subText = document.getElementById('radioSubText');

      if (isRadioPlaying) {
        // Stop Radio
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        isRadioPlaying = false;
        btn.classList.remove('playing');
        badge.className = 'radio-live-badge';
        badge.textContent = 'OFF AIR';
        subText.textContent = 'Tap to listen to live news in your language';
        logEvent('RADIO: AI Highway Radio paused.');
        return;
      }

      // Start Radio Broadcast
      isRadioPlaying = true;
      btn.classList.add('playing');
      badge.className = 'radio-live-badge live';
      badge.textContent = '● ON AIR';
      subText.textContent = 'Broadcasting live road bulletin...';

      let newsText = radioNewsBulletins[currentLang] || radioNewsBulletins.en;
      const geminiKey = localStorage.getItem('jaagrat_gemini_key') || document.getElementById('profInputGeminiKey')?.value;

      // If user has provided a Gemini API Key, attempt live AI synthesis
      if (geminiKey) {
        try {
          subText.textContent = 'Generating live AI road news with Gemini...';
          const prompt = "Generate an energetic, friendly 30-second midnight highway radio bulletin for a commercial truck driver named Ramesh driving on Indian National Highway NH-44 South Corridor. Include traffic, national/cricket news, and a fatigue safety tip. Output the text directly in " + currentLang + " language.";
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            newsText = data.candidates[0].content.parts[0].text;
            logEvent('GEMINI: Live AI road news bulletin generated via Gemini API.');
          }
        } catch(e) {
          console.log('Gemini live fetch fallback to local bulletin:', e);
        }
      }

      logEvent('RADIO: Broadcasting AI Highway News in ' + (currentLang).toUpperCase() + ' (Midnight Fatigue Companion).');
      
      // Speak through multilingual speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const targetLocale = langVoiceMap[currentLang] || 'en-IN';
        const ut = new SpeechSynthesisUtterance(newsText);
        ut.lang = targetLocale;
        ut.rate = 1.0;
        ut.pitch = 1.02;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const langPrefix = targetLocale.split('-')[0].toLowerCase();
          const matchedVoice = voices.find(v => {
            const vLang = (v.lang || '').toLowerCase().replace('_', '-');
            return vLang === targetLocale.toLowerCase() || vLang.startsWith(langPrefix);
          });
          if (matchedVoice) ut.voice = matchedVoice;
        }

        ut.onend = () => {
          isRadioPlaying = false;
          btn.classList.remove('playing');
          badge.className = 'radio-live-badge';
          badge.textContent = 'OFF AIR';
          subText.textContent = 'Tap to listen to live news in your language';
          logEvent('RADIO: Broadcast finished.');
        };

        window.speechSynthesis.speak(ut);
      }
    }
`;

// Insert profile and radio JS right before renderFleetTable
html = html.replace('// Initialize Fleet Table on load', `${profileAndRadioJs}\n    // Initialize Fleet Table on load`);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully added Driver Profile section and AI Highway Radio Companion!');
