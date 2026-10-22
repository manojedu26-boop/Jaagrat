/**
 * Jaagrat Interactive Fleet Telematics Canvas Radar
 * Renders real-time vehicle positions across Karnataka & highway corridors.
 */

class FleetMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.vehicles = [
      {
        id: "KA-01-AB-1234",
        driver: "Rajesh Gowda",
        type: "Tata Ace Gold",
        x: 0.35, y: 0.28, // Tumkur Road NH48
        speed: 64,
        status: "critical", // red
        heading: 310,
        route: "Bangalore to Tumkur Corridor",
        phone: "+91 98860 11204",
        lastEvent: "3x Microsleep (L3)"
      },
      {
        id: "KA-04-E-1120",
        driver: "Suresh Kumar",
        type: "Ashok Leyland Dost",
        x: 0.65, y: 0.18, // NH44 Airport Expressway
        speed: 68,
        status: "safe", // green
        heading: 45,
        route: "Devanahalli Airport Hub",
        phone: "+91 94480 33412",
        lastEvent: "Normal Alertness"
      },
      {
        id: "KA-05-F-9081",
        driver: "Manjunath N.",
        type: "Mahindra Bolero Maxi",
        x: 0.72, y: 0.75, // Hosur Highway NH44
        speed: 52,
        status: "warning", // amber
        heading: 140,
        route: "Electronic City to Attibele",
        phone: "+91 99001 55678",
        lastEvent: "PERCLOS High (24%)"
      },
      {
        id: "KA-03-M-3344",
        driver: "Anand R.",
        type: "Toyota Innova Crysta",
        x: 0.22, y: 0.68, // Mysore Expressway
        speed: 78,
        status: "safe", // green
        heading: 220,
        route: "Bidadi / Ramanagara Run",
        phone: "+91 97412 88901",
        lastEvent: "Normal Alertness"
      },
      {
        id: "KA-51-D-5520",
        driver: "Venkatesh B.",
        type: "Maruti Super Carry",
        x: 0.50, y: 0.48, // Central Bangalore / Ring Road
        speed: 36,
        status: "safe",
        heading: 90,
        route: "Outer Ring Road Cargo",
        phone: "+91 98450 77123",
        lastEvent: "Normal Alertness"
      }
    ];

    this.selectedVehicle = this.vehicles[0];
    this.radarAngle = 0;
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Close drawer button
    const btnClose = document.getElementById('btn-close-drawer');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        const drawer = document.getElementById('vehicle-drawer');
        if (drawer) drawer.style.display = 'none';
      });
    }

    this.animate();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const v of this.vehicles) {
      const vx = v.x * this.width;
      const vy = v.y * this.height;
      const dist = Math.hypot(clickX - vx, clickY - vy);
      if (dist < 22) {
        this.selectVehicle(v);
        break;
      }
    }
  }

  selectVehicle(v) {
    this.selectedVehicle = v;
    const drawer = document.getElementById('vehicle-drawer');
    const id = document.getElementById('drawer-vehicle-id');
    const type = document.getElementById('drawer-vehicle-type');
    const speed = document.getElementById('drawer-speed');
    const status = document.getElementById('drawer-status');
    const location = document.getElementById('drawer-location');

    if (id) id.textContent = v.id;
    if (type) type.textContent = `${v.type} • ${v.driver}`;
    if (speed) speed.textContent = `${v.speed} km/h`;
    
    if (status) {
      status.textContent = v.status === 'critical' ? 'L3 CRITICAL' : (v.status === 'warning' ? 'L2 WARNING' : 'SAFE / ARMED');
      status.className = `stat-val ${v.status === 'critical' ? 'status-critical' : (v.status === 'warning' ? 'text-accent' : 'text-positive')}`;
    }

    if (location) location.textContent = v.route;
    if (drawer) drawer.style.display = 'block';
  }

  animate() {
    this.render();
    this.radarAngle += 0.015;

    // Subtle drift simulation of vehicle coordinates
    this.vehicles.forEach(v => {
      const rad = (v.heading * Math.PI) / 180;
      v.x += Math.cos(rad) * 0.00015;
      v.y += Math.sin(rad) * 0.00015;

      // Bounce inside bounds
      if (v.x < 0.1 || v.x > 0.9) v.heading = 180 - v.heading;
      if (v.y < 0.1 || v.y > 0.9) v.heading = 360 - v.heading;
    });

    requestAnimationFrame(() => this.animate());
  }

  render() {
    const { ctx, width, height } = this;
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Radar Background Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Bangalore Highway Network (Stylized Vectors)
    this.drawHighways();

    // 3. Radar Sweep Arc from Center
    const cx = width * 0.5;
    const cy = height * 0.5;
    const sweepRadius = Math.max(width, height) * 0.7;

    const sweepGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, sweepRadius);
    sweepGrad.addColorStop(0, "rgba(245, 158, 11, 0.08)");
    sweepGrad.addColorStop(1, "rgba(245, 158, 11, 0.0)");

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, sweepRadius, this.radarAngle, this.radarAngle + 0.45);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    ctx.restore();

    // 4. Render Vehicles with Dynamic Status Pins
    this.vehicles.forEach((v) => {
      const px = v.x * width;
      const py = v.y * height;
      const isSelected = this.selectedVehicle && this.selectedVehicle.id === v.id;

      let color = "#10b981"; // safe
      if (v.status === "warning") color = "#f59e0b";
      if (v.status === "critical") color = "#ef4444";

      // Pulsing outer ring for alerts
      const pulseSize = 10 + Math.sin(Date.now() * 0.006) * 4;
      ctx.beginPath();
      ctx.arc(px, py, pulseSize + (v.status === 'critical' ? 6 : 2), 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = v.status === 'critical' ? 2 : 1;
      ctx.stroke();

      // Inner Core Pin
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Selected Reticle Ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Plate Label
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(v.id, px, py - 14);

      // Speed Subtitle
      ctx.font = "500 10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(`${v.speed} km/h`, px, py + 18);
    });
  }

  drawHighways() {
    const { ctx, width, height } = this;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";

    // Outer Ring Road Loop (Center)
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.5, width * 0.22, height * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();

    // NH44 North: Bangalore -> Kempegowda Intl Airport
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.72, height * 0.08);
    ctx.stroke();

    // NH48 North-West: Bangalore -> Tumkur / Mumbai
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.25, height * 0.18);
    ctx.stroke();

    // NH44 South: Bangalore -> Electronic City -> Hosur
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.78, height * 0.88);
    ctx.stroke();

    // Mysore Expressway South-West
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.15, height * 0.75);
    ctx.stroke();

    // City Labels
    ctx.font = "600 11px 'Outfit', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.textAlign = "center";
    ctx.fillText("BENGALURU CENTRAL", width * 0.5, height * 0.5 + 4);
    ctx.fillText("NH48 TUMKUR BYPASS", width * 0.25, height * 0.14);
    ctx.fillText("NH44 AIRPORT CORRIDOR", width * 0.72, height * 0.06);
    ctx.fillText("HOSUR / E-CITY", width * 0.78, height * 0.94);
    ctx.fillText("MYSORE EXPRESSWAY", width * 0.15, height * 0.79);
  }
}

// Instantiate globally
window.addEventListener('DOMContentLoaded', () => {
  window.FleetMapInstance = new FleetMap('fleet-canvas');
});
