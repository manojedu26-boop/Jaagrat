/**
 * Jaagrat App Controller
 * Orchestrates navigation tabs, real-time incident feeds, driver scorecard calculations,
 * Fast2SMS escalation preview, and ROI calculator logic.
 */

class JaagratApp {
  constructor() {
    this.events = [
      {
        id: "evt_104",
        vehicleId: "KA-01-AB-1234",
        driverName: "Rajesh Gowda",
        level: 3,
        reason: "3x Repeated Microsleep (Unresponsive to L2)",
        speed: 64,
        location: "Tumkur Bypass, NH48",
        time: "Just now"
      },
      {
        id: "evt_103",
        vehicleId: "KA-01-AB-1234",
        driverName: "Rajesh Gowda",
        level: 2,
        reason: "Microsleep (1.2s Eye Closure)",
        speed: 66,
        location: "Tumkur Bypass, NH48",
        time: "4 mins ago"
      },
      {
        id: "evt_102",
        vehicleId: "KA-05-F-9081",
        driverName: "Manjunath N.",
        level: 1,
        reason: "Yawn Cluster (2 deep yawns in 2 min)",
        speed: 52,
        location: "Hosur Highway NH44",
        time: "18 mins ago"
      },
      {
        id: "evt_101",
        vehicleId: "KA-05-F-9081",
        driverName: "Manjunath N.",
        level: 1,
        reason: "PERCLOS Trend Reached 22%",
        speed: 48,
        location: "Attibele Toll Gate",
        time: "32 mins ago"
      },
      {
        id: "evt_100",
        vehicleId: "KA-04-E-1120",
        driverName: "Suresh Kumar",
        level: 1,
        reason: "Looking Away / Gaze Distraction (>3.0s)",
        speed: 65,
        location: "Kempegowda Airport Trumpet",
        time: "55 mins ago"
      }
    ];

    this.drivers = [
      {
        name: "Suresh Kumar",
        vehicle: "KA-04-E-1120",
        hours: 42.5,
        l1: 1,
        l2: 0,
        l3: 0,
        score: 98,
        bonus: 500
      },
      {
        name: "Anand R.",
        vehicle: "KA-03-M-3344",
        hours: 38.0,
        l1: 0,
        l2: 0,
        l3: 0,
        score: 100,
        bonus: 500
      },
      {
        name: "Manjunath N.",
        vehicle: "KA-05-F-9081",
        hours: 36.5,
        l1: 2,
        l2: 0,
        l3: 0,
        score: 92,
        bonus: 350
      },
      {
        name: "Venkatesh B.",
        vehicle: "KA-51-D-5520",
        hours: 31.0,
        l1: 0,
        l2: 0,
        l3: 0,
        score: 100,
        bonus: 500
      },
      {
        name: "Rajesh Gowda",
        vehicle: "KA-01-AB-1234",
        hours: 28.5,
        l1: 1,
        l2: 2,
        l3: 1,
        score: 62,
        bonus: 0 // Ineligible due to L3 escalation
      }
    ];

    this.init();
  }

  init() {
    this.setupTabs();
    this.renderEvents();
    this.renderScorecards();
    this.setupFilters();
    this.setupRoiCalculator();
    this.setupModals();
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.view-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        const targetId = tab.dataset.target;
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        // Trigger resize on map canvas when switching to console
        if (targetId === 'view-console' && window.FleetMapInstance) {
          setTimeout(() => window.FleetMapInstance.resizeCanvas(), 50);
        }
      });
    });
  }

  renderEvents(filter = 'all') {
    const list = document.getElementById('event-feed-list');
    if (!list) return;

    list.innerHTML = '';
    const filtered = filter === 'l3' ? this.events.filter(e => e.level === 3) : this.events;

    filtered.forEach(evt => {
      const item = document.createElement('div');
      item.className = `event-item l${evt.level}`;
      item.innerHTML = `
        <div>
          <div class="event-vehicle">${evt.vehicleId} • <span style="font-weight: 500; font-size: 0.8rem; color: #94a3b8;">${evt.driverName}</span></div>
          <div class="event-reason">${evt.reason} (${evt.speed} km/h)</div>
          <div style="font-size: 0.7rem; color: #64748b;">📍 ${evt.location}</div>
        </div>
        <div class="event-time">${evt.time}</div>
      `;
      list.appendChild(item);
    });

    const badge = document.getElementById('event-count-badge');
    if (badge) badge.textContent = `${this.events.length} Events`;
  }

  addEventToFeed(evt) {
    this.events.unshift({
      id: `evt_${Date.now()}`,
      vehicleId: evt.vehicleId,
      driverName: evt.driverName,
      level: evt.level,
      reason: evt.reason,
      speed: Math.round(evt.speed),
      location: evt.location,
      time: "Just now"
    });

    this.renderEvents();

    // If Level 3, update SMS preview box
    if (evt.level === 3) {
      const smsText = document.getElementById('sms-text-preview');
      const smsTime = document.getElementById('sms-time');
      if (smsText) {
        smsText.textContent = `[JAAGRAT ALERT] CRITICAL: Driver in vehicle ${evt.vehicleId} showed repeated microsleep events near ${evt.location}. Speed: ${Math.round(evt.speed)} km/h. Call driver immediately!`;
      }
      if (smsTime) smsTime.textContent = "Just now";
    }
  }

  setupFilters() {
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.renderEvents(pill.dataset.filter);
      });
    });
  }

  renderScorecards() {
    const tbody = document.getElementById('driver-scorecard-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.drivers.forEach(d => {
      const tr = document.createElement('tr');
      const isEligible = d.bonus > 0;
      tr.innerHTML = `
        <td><strong>${d.name}</strong></td>
        <td><code>${d.vehicle}</code></td>
        <td>${d.hours} hrs</td>
        <td><span style="color: #06b6d4;">${d.l1}</span></td>
        <td><span style="color: #f59e0b;">${d.l2}</span></td>
        <td><span style="color: #ef4444; font-weight: 700;">${d.l3}</span></td>
        <td>
          <span style="font-family: var(--font-mono); font-weight: 700; color: ${d.score >= 90 ? '#10b981' : (d.score >= 75 ? '#f59e0b' : '#ef4444')};">
            ${d.score} / 100
          </span>
        </td>
        <td>
          <span class="badge-bonus ${isEligible ? 'active' : 'zero'}">
            ${isEligible ? `₹${d.bonus} (Eligible)` : '₹0 (Forfeited)'}
          </span>
        </td>
        <td>
          <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.725rem;" onclick="alert('Driver Profile: ${d.name}\\nVehicle: ${d.vehicle}\\nBonus Status: ${isEligible ? '₹' + d.bonus : '₹0'}\\nTrip Logs: Clean history on night highway runs.')">
            Details
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  setupRoiCalculator() {
    const slVehicles = document.getElementById('calc-vehicles');
    const slHwCost = document.getElementById('calc-hw-cost');
    const slCrashCost = document.getElementById('calc-crash-cost');

    const dispVehicles = document.getElementById('disp-calc-vehicles');
    const dispHwCost = document.getElementById('disp-calc-hw-cost');
    const dispCrashCost = document.getElementById('disp-calc-crash-cost');

    const resCapex = document.getElementById('res-capex-saved');
    const resJaagrat = document.getElementById('res-jaagrat-annual');
    const resNetSavings = document.getElementById('res-net-savings');

    const compute = () => {
      const v = parseInt(slVehicles?.value || 12);
      const hw = parseInt(slHwCost?.value || 20000);
      const crash = parseInt(slCrashCost?.value || 150000);

      if (dispVehicles) dispVehicles.textContent = `${v} Vehicles`;
      if (dispHwCost) dispHwCost.textContent = `₹${hw.toLocaleString('en-IN')}`;
      if (dispCrashCost) dispCrashCost.textContent = `₹${crash.toLocaleString('en-IN')}`;

      // Upfront Capex saved vs hardware (e.g. Netradyne @ ₹20k/cab)
      const capexSaved = v * hw;
      // Jaagrat subscription: ₹199 / vehicle / month = ₹2,388 / vehicle / year
      const jaagratAnnual = v * 199 * 12;
      // Net 1st year savings (Capex saved + 1 avoided crash loss - Jaagrat cost)
      const net = (capexSaved + crash) - jaagratAnnual;

      if (resCapex) resCapex.textContent = `₹${capexSaved.toLocaleString('en-IN')}`;
      if (resJaagrat) resJaagrat.textContent = `₹${jaagratAnnual.toLocaleString('en-IN')}`;
      if (resNetSavings) resNetSavings.textContent = `₹${net.toLocaleString('en-IN')}`;
    };

    [slVehicles, slHwCost, slCrashCost].forEach(sl => {
      if (sl) sl.addEventListener('input', compute);
    });

    compute();
  }

  setupModals() {
    const modal = document.getElementById('pilot-modal');
    const btnClaim = document.getElementById('btn-claim-pilot');
    const btnClose = document.getElementById('btn-close-pilot-modal');
    const form = document.getElementById('pilot-form');

    if (btnClaim && modal) {
      btnClaim.addEventListener('click', () => modal.style.display = 'flex');
    }
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.style.display = 'none');
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Pilot Request Received! Our Bangalore deployment engineer will contact you within 2 business hours.");
        if (modal) modal.style.display = 'none';
      });
    }

    // Call driver button in console drawer
    const btnCall = document.getElementById('btn-call-driver');
    if (btnCall) {
      btnCall.addEventListener('click', () => {
        alert("Initiating Direct GSM Call to Driver Rajesh Gowda (+91 98860 11204)...");
      });
    }

    const btnSms = document.getElementById('btn-resend-sms');
    if (btnSms) {
      btnSms.addEventListener('click', () => {
        alert("Dispatched manual Fast2SMS alert to Driver and Fleet Supervisor!");
      });
    }
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.JaagratApp = new JaagratApp();
});
