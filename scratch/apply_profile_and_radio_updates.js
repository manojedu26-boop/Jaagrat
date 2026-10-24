const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove Gemini Section from Driver Profile & Add InsurTech Certification
  const geminiSectionRegex = /<!-- Gemini AI Road Radio & System Settings -->[\s\S]*?<input type="password" class="form-input" id="profInputGeminiKey"[\s\S]*?<\/div>[\s\S]*?<\/div>/;
  
  const insurtechProfileCard = `<!-- Commercial Driver AIS-140 Certification & InsurTech Telematics -->
            <div class="profile-form-section" style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2);">
              <div class="section-header-badge" style="color: #2563EB;">🛡️ AIS-140 Telematics &amp; Insurance Verification</div>
              <div style="font-size:11px; color:var(--text-muted); line-height:1.45;">
                <strong style="color:var(--text-primary);">MoRTH AIS-140 Certified:</strong> Real-time computer vision fatigue telemetry linked with Fleet Safety Underwriting. Drivers maintaining &gt;85% vigilance qualify for up to <strong>18% Insurance Premium Rebates</strong>.
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.03); padding:6px 10px; border-radius:6px; margin-top:4px; font-size:11px;">
                <span style="color:var(--text-muted);">InsurTech Tier:</span>
                <span style="color:#16A34A; font-weight:700;">★ Tier-1 Preferred Low-Risk Fleet</span>
              </div>
            </div>`;

  if (geminiSectionRegex.test(content)) {
    content = content.replace(geminiSectionRegex, insurtechProfileCard);
    console.log(`[OK] Replaced Gemini section with InsurTech Certification in ${filePath}`);
  } else {
    console.warn(`[WARN] Gemini section regex didn't match in ${filePath}`);
  }

  // 2. Clean up saveDriverProfile
  const saveProfileRegex = /function saveDriverProfile\(\) \{[\s\S]*?const geminiKey = document\.getElementById\('profInputGeminiKey'\)\.value[\s\S]*?closeDriverProfile\(\);\s*\}/;
  const newSaveProfile = `function saveDriverProfile() {
      const name = document.getElementById('profInputName').value || 'Ramesh Kumar';
      const vehicle = document.getElementById('profInputVehicle').value || 'KA-01-AB-1234';

      document.getElementById('dispDriverTag').textContent = name.split(' ')[0] + ' ' + (name.split(' ')[1] ? name.split(' ')[1][0] + '.' : '');
      document.getElementById('profHeroName').textContent = name;
      
      const vClean = vehicle.split(' ')[0];
      document.getElementById('dispVehicleTag').textContent = vClean;

      localStorage.setItem('jaagrat_driver_name', name);
      localStorage.setItem('jaagrat_driver_vehicle', vehicle);

      alert('✓ Profile updated successfully! Changes reflected across Cockpit HUD.');
      logEvent('PROFILE: Profile settings saved for ' + name + ' (' + vClean + ').');
      closeDriverProfile();
    }`;

  if (saveProfileRegex.test(content)) {
    content = content.replace(saveProfileRegex, newSaveProfile);
    console.log(`[OK] Cleaned up saveDriverProfile in ${filePath}`);
  } else {
    console.warn(`[WARN] saveDriverProfile regex didn't match in ${filePath}`);
  }

  // 3. Add InsurTech badge to Shift Summary (#viewSummary)
  if (!content.includes('InsurTech UBI Telematics')) {
    const targetDiv = '<div style="display:flex; flex-direction:column; gap:8px; margin-top:auto; padding-top:10px;">\n              <button class="btn-primary" onclick="completeShiftAndStartNew()"';
    const insurtechSummaryBadge = `<!-- InsurTech Fleet Underwriting Rebate Card -->
            <div style="background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.25); border-radius: 10px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <div>
                <div style="font-size: 11px; font-weight: 800; color: #16A34A; display: flex; align-items: center; gap: 4px;">
                  <span>🛡️ InsurTech UBI Telematics</span>
                </div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 1px;">Fleet Safety Underwriting Rebate</div>
              </div>
              <div style="font-size: 13px; font-weight: 800; color: #15803D; font-family: 'JetBrains Mono'; background: #DCFCE7; padding: 3px 8px; border-radius: 6px;">
                18% REBATE
              </div>
            </div>

            ` + targetDiv;
    content = content.replace(targetDiv, insurtechSummaryBadge);
    console.log(`[OK] Added InsurTech badge to viewSummary in ${filePath}`);
  }

  // 4. Add InsurTech Row to AIS-140 Audit Table
  if (!content.includes('Commercial Fleet InsurTech Underwriting')) {
    const tableEndTag = '</tbody>\n    </table>';
    const insurtechTableRow = `        <tr>
          <td><strong>Commercial Fleet InsurTech Underwriting</strong></td>
          <td>Tier-1 Preferred Safe Fleet (&ge; 85% Vigilance)</td>
          <td>IRDAI / MoRTH Guidelines</td>
          <td><span style="color:#16A34A; font-weight:800;">18% PREMIUM REBATE ELIGIBLE</span></td>
        </tr>
      ` + tableEndTag;
    content = content.replace(tableEndTag, insurtechTableRow);
    console.log(`[OK] Added InsurTech row to AIS-140 Certificate table in ${filePath}`);
  }

  // 5. Replace radioNewsBulletins and toggleHighwayRadio with 1-Minute Continuous Broadcast Engine
  const radioBlockRegex = /\/\/ --- AI HIGHWAY RADIO \(MIDNIGHT FATIGUE COMPANION\) ---[\s\S]*?renderFleetTable\(\);/;

  const newRadioEngine = `// --- AI HIGHWAY RADIO: 1-MINUTE CONTINUOUS MIDNIGHT COMPANION ---
    let isRadioPlaying = false;
    let radioKeepAlive = null;
    let radioSentenceIdx = 0;
    let radioSentences = [];

    // Continuous ~1-minute broadcast bulletins tailored with real-time highway corridors, cricket headlines, night weather, and fatigue guidance
    const radioNewsBulletins = {
      kn: [
        "ನಮಸ್ಕಾರ ರಮೇಶ್ ಅವರೇ! ಇದು ಜಾಗ್ರತ್ 98.4 AI ಹೈವೇ ರೇಡಿಯೋ, ಮಧ್ಯರಾತ್ರಿಯ ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ರಸ್ತೆ ಸಂಗಾತಿ.",
        "ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ 44 ದಕ್ಷಿಣ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ಬೆಂಗಳೂರಿನಿಂದ ಹೈದರಾಬಾದ್ ಮತ್ತು ಹೊಸೂರು ಮಾರ್ಗದಲ್ಲಿ ಸಂಚಾರ ಸಂಪೂರ್ಣ ಸುಗಮವಾಗಿದೆ.",
        "ದೇವನಹಳ್ಳಿ ಟೋಲ್ ಮತ್ತು ತುಮಕೂರು ಬೈಪಾಸ್‌ನ ಎಲ್ಲಾ ಫಾಸ್ಟ್ಯಾಗ್ ಲೇನ್‌ಗಳು ಸರಾಗವಾಗಿ ತೆರೆದಿದ್ದು, ಯಾವುದೇ ಸಂಚಾರ ದಟ್ಟಣೆ ಇಲ್ಲ.",
        "ಇಂದಿನ ಕ್ರೀಡಾ ಮುಖ್ಯಾಂಶಗಳು: ಭಾರತೀಯ ಕ್ರಿಕೆಟ್ ತಂಡ ರೋಚಕ ಪಂದ್ಯದಲ್ಲಿ ಅಂತಿಮ ಓವರ್‌ನಲ್ಲಿ ಭರ್ಜರಿ ಜಯಭೇರಿ ಬಾರಿಸಿ ದೇಶಾದ್ಯಂತ ಸಂಭ್ರಮ ಮೂಡಿಸಿದೆ.",
        "ರಾತ್ರಿ ಹವಾಮಾನ ವರದಿ: ತಾಪಮಾನ 22 ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ಇದ್ದು, ಆಹ್ಲಾದಕರ ತಂಗಾಳಿ ಮತ್ತು ಹೆದ್ದಾರಿಯಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಗೋಚರತೆ ಇದೆ.",
        "ಜಾಗ್ರತ್ ಚಾಲಕರ ಸುರಕ್ಷತಾ ಸಲಹೆ: ರಾತ್ರಿ 2 ಗಂಟೆಯಿಂದ ಮುಂಜಾನೆ 5 ಗಂಟೆಯವರೆಗೆ ಕಣ್ಣುಗಳಿಗೆ ಆಯಾಸವಾಗುವುದು ಸಹಜ. ದಯವಿಟ್ಟು ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಮುಂದಿನ ಲಾರಿಯಿಂದ 50 ಮೀಟರ್ ಸುರಕ್ಷಿತ ಅಂತರ ಕಾಯ್ದುಕೊಳ್ಳಿ.",
        "ಜಾಗ್ರತ್ ಜೀವ ರಕ್ಷಕ AI ಕಣ್ಣು ಸದಾ ನಿಮ್ಮೊಂದಿಗೆ ಎಚ್ಚರವಾಗಿದೆ. ನಿಮ್ಮ ಪ್ರಯಾಣ ಸುಖಕರವಾಗಿರಲಿ!"
      ],
      hi: [
        "नमस्ते रमेश जी! यह है जाग्रत 98.4 AI हाईवे रेडियो, देर रात के सफर में आपका अपना हमसफ़र।",
        "नेशनल हाईवे 44 साउथ कॉरिडोर पर बेंगलुरु से हैदराबाद और पुणे मार्ग तक ट्रैफिक बिल्कुल साफ और सुचारू है।",
        "देवनहल्ली टोल प्लाजा और तुमकुरु बाईपास पर सभी फ़ास्टैटैग लेन बिना किसी देरी के पूरी तरह चालू हैं।",
        "आज की खेल सुर्खियाँ: भारतीय क्रिकेट टीम ने आखिरी ओवर में जबरदस्त गेंदबाजी का प्रदर्शन करते हुए रोमांचक मुकाबला जीत लिया है।",
        "मौसम अपडेट: आज रात का तापमान 22 डिग्री सेल्सियस है, मौसम साफ है और हाईवे पर विजिबिलिटी बहुत शानदार है।",
        "जाग्रत ड्राइवर सुरक्षा सलाह: रात के इस पहर में थकान और झपकी आना सामान्य है। हर घंटे थोड़ा पानी पीते रहें और आगे चल रहे वाहन से 50 मीटर की सुरक्षित दूरी बनाकर रखें।",
        "जाग्रत का AI सुरक्षा कवच हर पल आपकी हिफाज़त के लिए सक्रिय है। आपकी यात्रा मंगलमय और सुरक्षित रहे!"
      ],
      en: [
        "Good midnight Ramesh! You are tuned into Jaagrat 98.4 AI Highway Radio, your non-stop nocturnal co-pilot on the road.",
        "Here is your real-time highway bulletin: Traffic across the National Highway 44 South Corridor from Bengaluru through Hyderabad and Nagpur is moving smoothly with zero congestion.",
        "All electronic FASTag automated lanes at Devanahalli and Tumakuru bypass are operating with zero wait times.",
        "In sports headlines tonight: The Indian national cricket team has clinched a sensational victory in a nail-biting final over thriller, sparking celebrations nationwide.",
        "Weather and road conditions: A pleasant 22 degrees Celsius nocturnal breeze with crystal-clear highway visibility ahead.",
        "Fatigue advisory from Jaagrat: Commercial night driving between 2 AM and 5 AM causes circadian fatigue. Stay hydrated, keep a strict 3-second braking distance from the heavy vehicle ahead, and take a quick tea break if your eyelids feel heavy.",
        "Jaagrat active computer vision guard is wide awake, protecting you throughout your shift. Safe driving and have a great journey!"
      ],
      ta: [
        "வணக்கம் ரமேஷ்! இது ஜாக்ரத் 98.4 AI நெடுஞ்சாலை வானொலி நள்ளிரவு சிறப்புச் செய்தி அறிக்கை.",
        "தேசிய நெடுஞ்சாலை 44 தெற்கு வழித்தடத்தில் பெங்களூரு முதல் ஹைதராபாத் வரை போக்குவரத்து முற்றிலும் சீராக உள்ளது.",
        "தேவனஹள்ளி மற்றும் கிருஷ்ணகிரி சுங்கச்சாவடிகளில் அனைத்து ஃபாஸ்டேக் வழிகளும் தடையின்றி இயங்குகின்றன.",
        "இன்றைய முக்கிய விளையாட்டுச் செய்தி: இந்திய கிரிக்கெட் அணி கடைசி ஓவரில் த்ரில் வெற்றி பெற்று வரலாற்று சாதனை படைத்துள்ளது.",
        "வானிலை அறிக்கை: இரவு வெப்பநிலை 23 டிகிரி செல்சியஸ், தெளிவான சாலை பார்வை நிலவுகிறது.",
        "பாதுகாப்பு ஆலோசனை: நள்ளிரவு பயணத்தில் தூக்கம் வருவது இயற்கை. போதுமான தண்ணீர் குடியுங்கள், முன் செல்லும் லாரியிலிருந்து 50 மீட்டர் இடைவெளி கடைபிடியுங்கள்.",
        "ஜாக்ரத் AI விழிப்புணர்வு கண்காணிப்பு அமைப்பு உங்களுடன் எப்போதும் உள்ளது. உங்கள் பயணம் பாதுகாப்பாக அமையட்டும்!"
      ],
      te: [
        "నమస్కారం రమేష్ గారు! ఇది జాగ్రత్ 98.4 AI హైవే రేడియో అర్ధరాత్రి సమాచారం.",
        "జాతీయ రహదారి 44 సౌత్ కారిడార్‌లో బెంగళూరు నుండి హైదరాబాద్ వరకు ట్రాఫిక్ పూర్తిగా సాఫీగా సాగుతోంది.",
        "దేవనహళ్లి టోల్ మరియు అనంతపురం బైపాస్ వద్ద ఫాస్టాగ్ లైన్లు రద్దీ లేకుండా వేగంగా పనిచేస్తున్నాయి.",
        "నేటి క్రీడా ముఖ్యాంశాలు: భారత క్రికెట్ జట్టు ఉత్కంఠభరిత పోరులో అద్భుత విజయం సాధించి అభిమానులను ఉర్రూతలూగించింది.",
        "వాతావరణ సమాచారం: ఈ రాత్రి ఉష్ణోగ్రత 22 డిగ్రీల సెల్సియస్, రాత్రిపూట రహదారిపై దృశ్యమానత స్పష్టంగా ఉంది.",
        "జాగ్రత్ భద్రతా సూచన: రాత్రి వేళ డ్రైవింగ్‌లో నిద్రమత్తు రావడం సహజం. తగినంత నీరు త్రాగండి, ముందున్న వాహనం నుండి సురక్షిత దూరం పాటించండి.",
        "జాగ్రత్ AI రక్షణ వ్యవస్థ మీతోనే ఉంది. మీ ప్రయాణం సురక్షితంగా సాగాలి!"
      ],
      mr: [
        "नमस्कार रमेश जी! हे जाग्रत 98.4 AI हायवे रेडिओचे मध्यरात्रीचे विशेष बुलेटिन आहे.",
        "राष्ट्रीय महामार्ग 44 आणि पुणे-बेंगळुरू एक्सप्रेसवेवर वाहतूक अतिशय सुरळीत सुरू आहे.",
        "टोल नाक्यांवर सर्व फास्टॅग लेन कोणत्याही अडथळ्याविना चालू आहेत.",
        "आजच्या क्रीडा घडामोडी: भारतीय क्रिकेट संघाने थरारक सामन्यात ऐतिहासिक विजय नोंदवला आहे.",
        "हवामान: आज रात्रीचे तापमान 22 अंश सेल्सिअस असून रस्त्यावर स्पष्ट दृश्यमानता आहे.",
        "सुरक्षा सल्ला: रात्रीच्या वेळी डोळ्यांवर ताण येणे स्वाभाविक आहे. पाणी प्या, पुढे जाणाऱ्या वाहनापासून 50 मीटर अंतर ठेवा.",
        "जाग्रत AI सुरक्षा डोळा सतत तुमच्यासोबत आहे. तुमचा प्रवास सुखकर होवो!"
      ],
      bn: [
        "নমস্কার রমেশ! এটি জাগ্রত ৯৮.৪ এআই হাইওয়ে রেডিওর মধ্যরাতের বিশেষ বুলেটিন।",
        "জাতীয় সড়ক ৪৪ দক্ষিণ করিডোরে যান চলাচল সম্পূর্ণ স্বাভাবিক ও মসৃণ রয়েছে।",
        "সমস্ত ফাস্ট্যাগ লেনে কোনো বিলম্ব ছাড়াই দ্রুত গাড়ি চলাচল করছে।",
        "আজকের খেলার খবর: রোমাঞ্চকর শেষ ওভারে ভারতীয় ক্রিকেট দল দুর্দান্ত জয় অর্জন করেছে।",
        "আবহাওয়ার খবর: রাতের তাপমাত্রা ২২ ডিগ্রি সেলসিয়াস, হাইওয়েতে দৃশ্যমানতা অত্যন্ত ভালো।",
        "সতর্কতা টিপস: গভীর রাতের দীর্ঘ যাত্রায় ক্লান্তি আসা স্বাভাবিক। জল পান করুন এবং নিরাপদ দূরত্ব বজায় রাখুন।",
        "জাগ্রত এআই সুরক্ষা সার্বক্ষণিক আপনার পাশে রয়েছে। আপনার যাত্রা নিরাপদ ও শুভ হোক!"
      ],
      gu: [
        "નમસ્તે રમેશ ભાઈ! આ છે જાગ્રત 98.4 AI હાઇવે રેડિયોનું મધ્યરાત્રિ વિશેષ બુલેટિન.",
        "નેશનલ હાઇવે 44 પર ટ્રાફિક વ્યવસ્થા સંપૂર્ણપણે સરળ અને ક્લિયર છે.",
        "ટોલ પ્લાઝા પર તમામ ફાસ્ટેગ લેન સરળતાથી કાર્યરત છે.",
        "આજના રમતગમતના સમાચાર: ભારતીય ક્રિકેટ ટીમે રોમાંચક મેચમાં ભવ્ય વિજય મેળવ્યો છે.",
        "હવામાન અપડેટ: આજની રાત્રિનું તાપમાન 22 ડિગ્રી સેલ્સિયસ છે અને રોડ વિઝિબિલિટી ખૂબ સરસ છે.",
        "જાગ્રત સુરક્ષા સલાહ: રાત્રે થાક અને ઊંઘ આવવી સામાન્ય છે. પૂરતું પાણી પીવો અને 50 મીટરનું સુરક્ષિત અંતર રાખો.",
        "જાગ્રત AI સેફ્ટી શિલ્ડ તમારી સાથે હંમેશા સજાગ છે. આપની યાત્રા સુરક્ષિત રહે!"
      ],
      ml: [
        "നമസ്കാരം രമേശ്! ഇത് ജാഗ്രത് 98.4 AI ഹൈവേ റേഡിയോ അർദ്ധരാത്രി പ്രത്യേക വാർത്തകൾ.",
        "ദേശീയപാത 44-ൽ ഗതാഗതം തടസ്സമില്ലാതെ സുഗമമായി തുടരുന്നു.",
        "ടോൾ പ്ലാസകളിലെ ഫാസ്ടാഗ് വഴികൾ സുഗമമായി പ്രവർത്തിക്കുന്നു.",
        "ഇന്നത്തെ കായിക വാർത്ത: ആവേശകരമായ മത്സരത്തിൽ ഇന്ത്യൻ ക്രിക്കറ്റ് ടീം തകർപ്പൻ വിജയം നേടി.",
        "കാലാവസ്ഥ: രാത്രി താപനില 23 ഡിഗ്രി സെൽഷ്യസ്, ഹൈവേയിൽ വ്യക്തമായ കാഴ്ചാ സൗകര്യം ഉണ്ട്.",
        "സുരക്ഷാ നിർദ്ദേശം: രാത്രി യാത്രയിൽ ആവശ്യത്തിന് വെള്ളം കുടിക്കുക, മുന്നിലുള്ള വാഹനത്തിൽ നിന്ന് സുരക്ഷിത അകലം പാലിക്കുക.",
        "ജാഗ്രത് AI കാവൽക്കണ്ണ് എപ്പോഴും നിങ്ങളുടെ സുരക്ഷ ഉറപ്പാക്കുന്നു. സുരക്ഷിത യാത്ര ആശംസിക്കുന്നു!"
      ],
      pa: [
        "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਰਮੇਸ਼ ਜੀ! ਇਹ ਜਾਗਰਤ 98.4 ਏਆਈ ਹਾਈਵੇ ਰੇਡੀਓ ਦਾ ਅੱਧੀ ਰਾਤ ਦਾ ਵਿਸ਼ੇਸ਼ ਬੁਲੇਟਿਨ ਹੈ।",
        "ਨੈਸ਼ਨਲ ਹਾਈਵੇਅ 44 'ਤੇ ਆਵਾਜਾਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਾਫ਼ ਅਤੇ ਸੁਚਾਰੂ ਚੱਲ ਰਹੀ ਹੈ।",
        "ਸਾਰੇ ਫਾਸਟੈਗ ਟੋਲ ਬਿਨਾਂ ਕਿਸੇ ਦੇਰੀ ਦੇ ਤੇਜ਼ੀ ਨਾਲ ਕੰਮ ਕਰ ਰਹੇ ਹਨ।",
        "ਅੱਜ ਦੀਆਂ ਖੇਡ ਖ਼ਬਰਾਂ: ਭਾਰਤੀ ਕ੍ਰਿਕਟ ਟੀਮ ਨੇ ਰੋਮਾਂਚਕ ਮੈਚ ਵਿੱਚ ਸ਼ਾਨਦਾਰ ਜਿੱਤ ਦਰਜ ਕੀਤੀ ਹੈ।",
        "ਮੌਸਮ ਜਾਣਕਾਰੀ: ਤਾਪਮਾਨ 22 ਡਿਗਰੀ ਸੈਲਸੀਅਸ ਹੈ ਅਤੇ ਹਾਈਵੇਅ 'ਤੇ ਦ੍ਰਿਸ਼ਟੀ ਬਹੁਤ ਵਧੀਆ ਹੈ।",
        "ਡਰਾਈਵਰ ਸੁਰੱਖਿਆ ਸਲਾਹ: ਰਾਤ ਵੇਲੇ ਥਕਾਵਟ ਤੋਂ ਬਚਣ ਲਈ ਪਾਣੀ ਪੀਂਦੇ ਰਹੋ ਅਤੇ ਅੱਗੇ ਚੱਲ ਰਹੇ ਵਾਹਨ ਤੋਂ 50 ਮੀਟਰ ਦੀ ਦੂਰੀ ਬਣਾ ਕੇ ਰੱਖੋ।",
        "ਜਾਗਰਤ ਏਆਈ ਹਰ ਪਲ ਤੁਹਾਡੀ ਸੁਰੱਖਿਆ ਲਈ ਤੈਨਾਤ ਹੈ। ਤੁਹਾਡਾ ਸਫ਼ਰ ਸੁਰੱਖਿਅਤ ਰਹੇ!"
      ],
      or: [
        "ନମସ୍କାର ରମେଶ! ଏହା ଜାଗ୍ରତ 98.4 AI ହାଇୱେ ରେଡିଓର ମଧ୍ୟରାତ୍ରି ସ୍ୱତନ୍ତ୍ର ବୁଲେଟିନ୍।",
        "ଜାତୀୟ ରାଜପଥ 44 ରେ ଯାତାୟାତ ସମ୍ପୂର୍ଣ୍ଣ ସ୍ୱାଭାବିକ ଏବଂ ସୁଗମ ରହିଛି।",
        "ସମସ୍ତ ଫାଷ୍ଟ୍ୟାଗ୍ ଲେନରେ ନିର୍ବିଘ୍ନରେ ଗାଡି ଚଳାଚଳ ଜାରି ରହିଛି।",
        "ଆଜିର ଖେଳ ଖବର: ଭାରତୀୟ କ୍ରିକେଟ ଦଳ ରୋମାଞ୍ଚକର ମ୍ୟାଚରେ ଐତିହାସିକ ବିଜୟ ହାସଲ କରିଛି।",
        "ପାଣିପାଗ: ରାତ୍ରିର ତାପମାତ୍ରା 22 ଡିଗ୍ରୀ ସେଲସିୟସ ଏବଂ ରାସ୍ତାରେ ଭଲ ଦୃଶ୍ୟମାନତା ରହିଛି।",
        "ଡ୍ରାଇଭର ସୁରକ୍ଷା ପରାମର୍ଶ: ରାତିରେ ପାଣି ପିଅନ୍ତୁ ଏବଂ ଆଗ ଗାଡି ଠାରୁ 50 ମିଟର ସୁରକ୍ଷିତ ଦୂରତା ବଜାୟ ରଖନ୍ତୁ।",
        "ଜାଗ୍ରତ AI ସୁରକ୍ଷା ସର୍ବଦା ଆପଣଙ୍କ ସହିତ ଅଛି। ଆପଣଙ୍କ ଯାତ୍ରା ଶୁଭ ହେଉ!"
      ],
      as: [
        "নমস্কাৰ ৰমেশ! এইটো জাগ্ৰত 98.4 এআই হাইৱে ৰেডিঅ'ৰ মধ্যৰাত্ৰিৰ বিশেষ বুলেটিন।",
        "ৰাষ্ট্ৰীয় ঘাইপথ 44ত যান-বাহন চলাচল সম্পূৰ্ণ স্বাভাৱিক আৰু সুচল হৈ আছে।",
        "সকলো ফাষ্টেগ লেনত নিৰ্বিঘ্নে গাড়ী চলাচল চলি আছে।",
        "আজিৰ খেলৰ বাতৰি: ভাৰতীয় ক্ৰিকেট দলে এক ৰোমাঞ্চকৰ খেলত ঐতিহাসিক জয় লাভ কৰিছে।",
        "বতৰৰ বাতৰি: ৰাতিৰ উষ্ণতা 22 ডিগ্ৰী চেলচিয়াছ আৰু ঘাইপথত দৃষ্টিগোচৰতা অতি স্পষ্ট।",
        "সুৰক্ষা পৰামৰ্শ: দীঘলীয়া ৰাতিৰ যাত্ৰাত পানী খাওক আৰু আগৰ বাহনৰ পৰা ৫০ মিটাৰ দূৰত্ব বজাই ৰাখক।",
        "জাগ্ৰত এআই সুৰক্ষা আপোনাৰ সৈতে আছে। আপোনাৰ যাত্ৰা শুভ হওক!"
      ]
    };

    function playRadioSentences() {
      if (!isRadioPlaying) return;
      if (radioSentenceIdx >= radioSentences.length) {
        stopHighwayRadio(true);
        return;
      }

      const rawText = radioSentences[radioSentenceIdx];
      const driverName = (localStorage.getItem('jaagrat_driver_name') || 'Ramesh').split(' ')[0];
      const text = rawText.replace(/ರಮೇಶ್|रमेश|Ramesh/g, driverName);

      const targetLocale = langVoiceMap[currentLang] || 'en-IN';
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = targetLocale;
      ut.rate = 0.96;
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

      const subText = document.getElementById('radioSubText');
      if (subText) {
        subText.textContent = text.length > 55 ? text.substring(0, 52) + '...' : text;
      }

      ut.onend = () => {
        if (!isRadioPlaying) return;
        radioSentenceIdx++;
        setTimeout(playRadioSentences, 300);
      };

      ut.onerror = (e) => {
        console.warn('Radio playback utterance skipped:', e);
        if (!isRadioPlaying) return;
        radioSentenceIdx++;
        setTimeout(playRadioSentences, 200);
      };

      window.speechSynthesis.speak(ut);
    }

    function stopHighwayRadio(isFinished = false) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (radioKeepAlive) {
        clearInterval(radioKeepAlive);
        radioKeepAlive = null;
      }
      isRadioPlaying = false;
      const btn = document.getElementById('btnHighwayRadio');
      const badge = document.getElementById('radioStatusBadge');
      const subText = document.getElementById('radioSubText');
      if (btn) btn.classList.remove('playing');
      if (badge) {
        badge.className = 'radio-live-badge';
        badge.textContent = 'OFF AIR';
      }
      if (subText) {
        subText.textContent = isFinished ? '✓ 1-Min News Bulletin Finished. Tap to replay.' : 'Tap to listen to live news in your language';
      }
      logEvent(isFinished ? 'RADIO: Completed 1-minute continuous Highway Companion broadcast.' : 'RADIO: AI Highway Radio stopped by driver.');
    }

    async function toggleHighwayRadio() {
      if (isRadioPlaying) {
        stopHighwayRadio(false);
        return;
      }

      if (!('speechSynthesis' in window)) {
        alert('Voice synthesis is not supported on this browser.');
        return;
      }

      isRadioPlaying = true;
      const btn = document.getElementById('btnHighwayRadio');
      const badge = document.getElementById('radioStatusBadge');
      const subText = document.getElementById('radioSubText');

      if (btn) btn.classList.add('playing');
      if (badge) {
        badge.className = 'radio-live-badge live';
        badge.textContent = '● ON AIR';
      }
      if (subText) subText.textContent = 'Broadcasting Jaagrat 98.4 FM Road Bulletin...';

      // Keepalive ticker to prevent Chrome speech synthesis background idle pause
      if (radioKeepAlive) clearInterval(radioKeepAlive);
      radioKeepAlive = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 7000);

      const rawBulletins = radioNewsBulletins[currentLang] || radioNewsBulletins.en;
      radioSentences = Array.isArray(rawBulletins) ? rawBulletins : [rawBulletins];
      radioSentenceIdx = 0;

      logEvent('RADIO: Broadcasting 1-Minute Live Highway News in ' + currentLang.toUpperCase() + ' (Midnight Fatigue Companion).');
      playRadioSentences();
    }

    // Initialize Fleet Table on load
    renderFleetTable();`;

  if (radioBlockRegex.test(content)) {
    content = content.replace(radioBlockRegex, newRadioEngine);
    console.log(`[OK] Upgraded AI Highway Radio Engine in ${filePath}`);
  } else {
    console.warn(`[WARN] radioBlockRegex didn't match in ${filePath}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile(path.join(__dirname, '../index.html'));
updateFile(path.join(__dirname, '../web/index.html'));
console.log('Update script completed.');
