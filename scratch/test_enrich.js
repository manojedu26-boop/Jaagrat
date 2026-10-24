const fs = require('fs');
const path = require('path');

// Extract i18n from scratch/build_full_app.js
const fullAppContent = fs.readFileSync(path.join(__dirname, 'build_full_app.js'), 'utf8');
const i18nMatch = fullAppContent.match(/const i18n = \{[\s\S]*?\n    \};\n/);
if (!i18nMatch) {
  console.error('Could not extract i18n');
  process.exit(1);
}
let i18nCode = i18nMatch[0];

// We will enrich the i18n dictionary with speechVoiceAlert, btnCompleteNewShift, and restStopAdvisory for all 12 languages!
const voiceDict = {
  en: { voice: "Warning! Keep your eyes on the road, pull over safely", newShift: "Complete Shift & Start New Ride", rest: "Rest Stop Swagat Dhaba 1.8km ahead" },
  hi: { voice: "सावधान! आंखें बंद न करें, तुरंत गाड़ी रोकें", newShift: "शिफ्ट समाप्त करें और नई यात्रा शुरू करें", rest: "विश्राम स्थल स्वागत ढाबा 1.8 किमी आगे" },
  kn: { voice: "ಎಚ್ಚರ! ಕಣ್ಣು ಮುಚ್ಚಬೇಡಿ, ದಯವಿಟ್ಟು ವಾಹನ ನಿಲ್ಲಿಸಿ", newShift: "ಶಿಫ್ಟ್ ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಹೊಸ ಟ್ರಿಪ್ ಪ್ರಾರಂಭಿಸಿ", rest: "ವಿಶ್ರಾಂತಿ ತಾಣ ಸ್ವಾಗತ್ ಧಾಬಾ 1.8 ಕಿ.ಮೀ ಮುಂದಿದೆ" },
  ta: { voice: "எச்சரிக்கை! கண்களை மூடாதீர்கள், வாகனத்தை நிறுத்துங்கள்", newShift: "ஷிப்டை முடித்து புதிய பயணத்தைத் தொடங்குங்கள்", rest: "ஓய்வு தளம் ஸ்வாகத் தாபா 1.8 கி.மீ தூரத்தில்" },
  te: { voice: "హెచ్చరిక! కళ్ళు మూయవద్దు, వాహనాన్ని నిలపండి", newShift: "షిఫ్ట్ పూర్తి చేసి కొత్త ప్రయాణాన్ని ప్రారంభించండి", rest: "విశ్రాంతి కేంద్రం స్వాగత్ దాబా 1.8 కి.మీ దూరంలో" },
  mr: { voice: "सावधान! डोळे बंद करू नका, गाडी थांबवा", newShift: "शिफ्ट पूर्ण करा आणि नवीन प्रवास सुरू करा", rest: "विश्रामगृह स्वागत ढाबा 1.8 किमी पुढे" },
  bn: { voice: "সাবধান! চোখ বন্ধ করবেন না, গাড়ি থামান", newShift: "শিফট শেষ করুন এবং নতুন ট্রিপ শুরু করুন", rest: "বিশ্রামাগার স্বাগত ধাবা 1.8 কিমি সামনে" },
  gu: { voice: "સાવધાન! આંખો બંધ ન કરો, વાહન રોકો", newShift: "શિફ્ટ પૂર્ણ કરો અને નવી સફર શરૂ કરો", rest: "વિશ્રામ સ્થળ સ્વાગત ઢાબા 1.8 કિમી આગળ" },
  ml: { voice: "ശ്രദ്ധിക്കുക! കണ്ണുകൾ അടയ്ക്കരുത്, വണ്ടി നിർത്തുക", newShift: "ഷിഫ്റ്റ് പൂർത്തിയാക്കി പുതിയ യാത്ര ആരംഭിക്കുക", rest: "വിശ്രമ കേന്ദ്രം സ്വാഗത് ധാബ 1.8 കി.മീ മുന്നിൽ" },
  pa: { voice: "ਸਾਵਧਾਨ! ਅੱਖਾਂ ਬੰਦ ਨਾ ਕਰੋ, ਗੱਡੀ ਰੋਕੋ", newShift: "ਸ਼ਿਫਟ ਪੂਰੀ ਕਰੋ ਅਤੇ ਨਵੀਂ ਸਵਾਰੀ ਸ਼ੁਰੂ ਕਰੋ", rest: "ਆਰਾਮ ਸਥਾਨ ਸਵਾਗਤ ਢਾਬਾ 1.8 ਕਿਲੋਮੀਟਰ ਅੱਗੇ" },
  or: { voice: "ସାବଧାନ! ଆଖି ବନ୍ଦ କରନ୍ତୁ ନାହିଁ, ଗାଡ଼ି ରଖନ୍ତୁ", newShift: "ଶିଫ୍ଟ ସମାପ୍ତ କରନ୍ତୁ ଏବଂ ନୂତନ ଯାତ୍ରା ଆରମ୍ଭ କରନ୍ତୁ", rest: "ବିଶ୍ରାମ ସ୍ଥଳ ସ୍ୱାଗତ ଢାବା 1.8 କିମି ଆଗରେ" },
  as: { voice: "সাৱধান! চকু বন্ধ নকৰিব, গাড়ী ৰখাওক", newShift: "শ্বিফ্ট সম্পূৰ্ণ কৰক আৰু নতুন যাত্ৰা আৰম্ভ কৰক", rest: "বিশ্রাম স্থলী স্বাগতম ধাবা 1.8 কিমি আগত" }
};

console.log('Enriching i18n with voice alerts and new shift translations...');
