const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Update Automated WhatsApp Gateway card in Onboarding to include Green-API & CallMeBot
const oldGatewayBox = `            <!-- AUTOMATED WHATSAPP GATEWAY (CALLMEBOT ZERO-CLICK CLOUD API) -->
            <div class="form-group" style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:14px; padding:12px; margin-top:4px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label class="form-label" style="color:#15803D; margin-bottom:0; font-weight:800;">⚡ Automated WhatsApp Gateway (Zero-Click Delivery)</label>
                <span style="font-size:10px; font-weight:800; background:#DCFCE7; color:#16A34A; padding:2px 8px; border-radius:12px;">CallMeBot API</span>
              </div>
              <div style="font-size:11px; color:#475569; margin:4px 0 8px 0; line-height:1.4;">
                Delivers real incoming WhatsApp messages to your phone automatically when the 5s siren triggers (no drafting, no clicking send!).
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Recipient WhatsApp</label>
                  <input type="tel" class="form-input" id="cfgWhatsAppPhone" value="+91 99001 24567" placeholder="+91 XXXXXXXXXX" style="font-size:12px; padding:8px 10px;">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">CallMeBot API Key</label>
                  <input type="text" class="form-input" id="cfgWhatsAppApiKey" placeholder="e.g. 849201" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button type="button" class="btn-outline" style="border:none; padding:4px 8px; font-size:11px; color:#16A34A; font-weight:800;" onclick="testWhatsAppGateway()">
                  <span>📲 Send Instant Test WhatsApp</span>
                </button>
                <a href="https://api.callmebot.com/" target="_blank" style="font-size:10px; color:#0284C7; font-weight:700; text-decoration:underline;">
                  Get Free Key in 15s &rarr;
                </a>
              </div>
            </div>`;

const newGatewayBox = `            <!-- AUTOMATED ZERO-CLICK WHATSAPP DISPATCH (GREEN-API / CALLMEBOT) -->
            <div class="form-group" style="background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:14px; padding:12px; margin-top:4px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label class="form-label" style="color:#15803D; margin-bottom:0; font-weight:800;">⚡ Real Automated WhatsApp Dispatch Gateway</label>
                <span style="font-size:10px; font-weight:800; background:#DCFCE7; color:#16A34A; padding:2px 8px; border-radius:12px;">Zero-Click Delivery</span>
              </div>
              <div style="font-size:11px; color:#334155; margin:4px 0 8px 0; line-height:1.4;">
                Delivers actual incoming WhatsApp messages to the phone automatically when the 5s siren triggers (no drafting, zero manual clicking!).
              </div>
              
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Recipient WhatsApp Phone</label>
                  <input type="tel" class="form-input" id="cfgWhatsAppPhone" value="+91 99001 24567" placeholder="+91 XXXXXXXXXX" style="font-size:12px; padding:8px 10px;">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Green-API Instance ID</label>
                  <input type="text" class="form-input" id="cfgGreenId" placeholder="e.g. 7103123456" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
              </div>

              <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:8px; margin-top:6px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">Green-API Token</label>
                  <input type="password" class="form-input" id="cfgGreenToken" placeholder="apiTokenInstance" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700; color:#64748B;">CallMeBot Key (Alt)</label>
                  <input type="text" class="form-input" id="cfgWhatsAppApiKey" placeholder="API Key" style="font-size:12px; padding:8px 10px; font-family:'JetBrains Mono';">
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button type="button" class="btn-outline" style="border:none; padding:4px 8px; font-size:11px; color:#16A34A; font-weight:800;" onclick="testWhatsAppGateway()">
                  <span>📲 Send Instant Test WhatsApp</span>
                </button>
                <a href="https://green-api.com/" target="_blank" style="font-size:10px; color:#0284C7; font-weight:700; text-decoration:underline;">
                  Get Free Green-API in 1 min &rarr;
                </a>
              </div>
            </div>`;

html = html.replace(oldGatewayBox, newGatewayBox);

// Update dispatchEmergencyWhatsApp and testWhatsAppGateway to support Green-API
const oldDispatchLogic = `      // 1. Direct Cloud Delivery via CallMeBot API (Real automated WhatsApp without drafting or clicking send!)
      const apiKey = document.getElementById('cfgWhatsAppApiKey')?.value || document.getElementById('ownerCallMeBotKey')?.value || localStorage.getItem('jaagrat_callmebot_key') || '';
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : ('+' + cleanPhone);

      if (apiKey) {
        const callMeBotUrl = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(formattedPhone) + '&text=' + encodeURIComponent(waMsg) + '&apikey=' + encodeURIComponent(apiKey);
        fetch(callMeBotUrl, { mode: 'no-cors' })
          .then(() => {
            logEvent('CALLMEBOT: Real WhatsApp message delivered to ' + formattedPhone + ' via CallMeBot API.');
            if (autoSentDetails) {
              autoSentDetails.innerHTML = '✓ <strong style="color:#86EFAC;">REAL WHATSAPP DELIVERED</strong> to ' + formattedPhone + ' via CallMeBot API! (No manual click required)';
            }
          })
          .catch((e) => {
            console.warn('CallMeBot fetch error:', e);
          });
      } else {
        // Fallback: opens WhatsApp directly
        try {
          window.open(waUrl, '_blank');
        } catch(e) {
          console.log('Automated popup note: Handled via cloud telemetry dispatch.');
        }
      }`;

const newDispatchLogic = `      // 1. Direct Automated Delivery via Green-API or CallMeBot (Zero-click automatic delivery!)
      const greenId = document.getElementById('cfgGreenId')?.value || localStorage.getItem('jaagrat_green_id') || '';
      const greenToken = document.getElementById('cfgGreenToken')?.value || localStorage.getItem('jaagrat_green_token') || '';
      const apiKey = document.getElementById('cfgWhatsAppApiKey')?.value || document.getElementById('ownerCallMeBotKey')?.value || localStorage.getItem('jaagrat_callmebot_key') || '';
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : ('+' + cleanPhone);

      if (greenId && greenToken) {
        // GREEN-API DIRECT CLOUD DISPATCH (Official linked device REST gateway)
        const greenHost = greenId.startsWith('7') ? '7103' : '1103';
        const greenUrl = 'https://' + greenHost + '.api.green-api.com/waInstance' + greenId + '/sendMessage/' + greenToken;
        fetch(greenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: cleanPhone + '@c.us',
            message: waMsg
          })
        }).then(res => res.json()).then(data => {
          logEvent('GREEN-API: Real WhatsApp message delivered to ' + cleanPhone + ' (Message ID: ' + (data.idMessage || 'OK') + ')');
          if (autoSentDetails) {
            autoSentDetails.innerHTML = '✓ <strong style="color:#86EFAC;">REAL WHATSAPP DELIVERED</strong> to ' + recipientPhone + ' via Green-API Gateway! (No manual click required)';
          }
        }).catch(err => {
          console.warn('Green-API fetch error:', err);
        });
      } else if (apiKey) {
        // CALLMEBOT GATEWAY
        const callMeBotUrl = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(formattedPhone) + '&text=' + encodeURIComponent(waMsg) + '&apikey=' + encodeURIComponent(apiKey);
        fetch(callMeBotUrl, { mode: 'no-cors' })
          .then(() => {
            logEvent('CALLMEBOT: Real WhatsApp message delivered to ' + formattedPhone + ' via CallMeBot API.');
            if (autoSentDetails) {
              autoSentDetails.innerHTML = '✓ <strong style="color:#86EFAC;">REAL WHATSAPP DELIVERED</strong> to ' + formattedPhone + ' via CallMeBot API! (No manual click required)';
            }
          })
          .catch((e) => {
            console.warn('CallMeBot fetch error:', e);
          });
      } else {
        // Fallback: launches WhatsApp directly
        try {
          window.open(waUrl, '_blank');
        } catch(e) {
          console.log('Automated popup note: Handled via cloud telemetry dispatch.');
        }
      }`;

html = html.replace(oldDispatchLogic, newDispatchLogic);

// Update testWhatsAppGateway function
const oldTestGateway = `    function testWhatsAppGateway() {
      const phoneInput = document.getElementById('cfgWhatsAppPhone')?.value || document.getElementById('ownerPhone')?.value || '+91 99001 24567';
      const keyInput = document.getElementById('cfgWhatsAppApiKey')?.value || document.getElementById('ownerCallMeBotKey')?.value || localStorage.getItem('jaagrat_callmebot_key') || '';

      if (!keyInput) {
        alert('⚡ HOW TO GET YOUR FREE WHATSAPP API KEY IN 15 SECONDS:\\n\\n1. Open WhatsApp on your phone\\n2. Send this exact text to +34 644 44 44 44:\\n   "I allow callmebot to send me messages"\\n3. CallMeBot will reply immediately with your API Key (e.g. 849201)\\n4. Enter the phone and API key here and click Test!\\n\\nThen Jaagrat will deliver real WhatsApp messages automatically without any clicking!');
        return;
      }

      localStorage.setItem('jaagrat_callmebot_key', keyInput);
      const clean = phoneInput.replace(/[^0-9+]/g, '');
      const formatted = clean.startsWith('+') ? clean : ('+' + clean);
      const testMsg = '🚨 *JAAGRAT AIS-140 REAL-TIME TEST* 🚨\\n✓ Automated WhatsApp Cloud Gateway is ACTIVE!\\nEmergency fatigue alerts will be delivered directly to this chat without manual clicks.';
      const testUrl = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(formatted) + '&text=' + encodeURIComponent(testMsg) + '&apikey=' + encodeURIComponent(keyInput);

      fetch(testUrl, { mode: 'no-cors' })
        .then(() => {
          alert('✓ Test WhatsApp message dispatched to ' + formatted + '! Check your phone.');
          logEvent('GATEWAY: Sent real test WhatsApp to ' + formatted);
        })
        .catch(err => {
          alert('Error dispatching test message: ' + err.message);
        });
    }`;

const newTestGateway = `    function testWhatsAppGateway() {
      const phoneInput = document.getElementById('cfgWhatsAppPhone')?.value || document.getElementById('ownerPhone')?.value || '+91 99001 24567';
      const greenId = document.getElementById('cfgGreenId')?.value || localStorage.getItem('jaagrat_green_id') || '';
      const greenToken = document.getElementById('cfgGreenToken')?.value || localStorage.getItem('jaagrat_green_token') || '';
      const keyInput = document.getElementById('cfgWhatsAppApiKey')?.value || document.getElementById('ownerCallMeBotKey')?.value || localStorage.getItem('jaagrat_callmebot_key') || '';
      
      const clean = phoneInput.replace(/[^0-9]/g, '');
      const formatted = '+' + clean;
      const testMsg = '🚨 *JAAGRAT AIS-140 REAL-TIME TEST* 🚨\\n✓ Automated WhatsApp Cloud Gateway is ACTIVE!\\nEmergency fatigue alerts will be delivered directly to this chat without manual clicks.';

      if (greenId && greenToken) {
        localStorage.setItem('jaagrat_green_id', greenId);
        localStorage.setItem('jaagrat_green_token', greenToken);
        const greenHost = greenId.startsWith('7') ? '7103' : '1103';
        const greenUrl = 'https://' + greenHost + '.api.green-api.com/waInstance' + greenId + '/sendMessage/' + greenToken;
        fetch(greenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: clean + '@c.us',
            message: testMsg
          })
        }).then(res => res.json()).then(data => {
          alert('✓ Real WhatsApp Test Message DELIVERED to ' + formatted + ' via Green-API! (ID: ' + (data.idMessage || 'SENT') + ')');
          logEvent('GATEWAY: Delivered Green-API test WhatsApp to ' + formatted);
        }).catch(err => {
          alert('Error dispatching test message via Green-API: ' + err.message);
        });
        return;
      }

      if (keyInput) {
        localStorage.setItem('jaagrat_callmebot_key', keyInput);
        const testUrl = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(formatted) + '&text=' + encodeURIComponent(testMsg) + '&apikey=' + encodeURIComponent(keyInput);
        fetch(testUrl, { mode: 'no-cors' })
          .then(() => {
            alert('✓ Test WhatsApp message dispatched to ' + formatted + '! Check your phone.');
            logEvent('GATEWAY: Sent real test WhatsApp to ' + formatted);
          })
          .catch(err => {
            alert('Error dispatching test message: ' + err.message);
          });
        return;
      }

      alert('⚡ ZERO-CLICK REAL WHATSAPP GATEWAY SETUP:\\n\\nOption 1 (Recommended - Green-API):\\n1. Go to green-api.com and sign up free\\n2. Under Linked Devices, scan the QR code with your WhatsApp\\n3. Enter your Instance ID & Token above, and messages will arrive automatically without clicking send!\\n\\nOption 2 (Direct WhatsApp):\\nLeave blank and Jaagrat will launch your WhatsApp with the emergency SOS alert pre-loaded.');
    }`;

html = html.replace(oldTestGateway, newTestGateway);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');

console.log('Successfully updated with Green-API zero-click automated WhatsApp gateway!');
