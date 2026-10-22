# Jaagrat: Business Model, Unit Economics & Regulatory Guide

## 1. Value Proposition
* **The Problem:** 1.7 lakh road deaths in India in 2022 (MoRTH). Night driving between 2 AM and 5 AM causes severe commercial vehicle crashes due to undetected driver microsleep.
* **The Market Gap:** Current fatigue systems (Netradyne, Mobileye, Seeing Machines) are expensive dedicated hardware (₹15,000–₹35,000 + ₹1,000/mo subscription) aimed exclusively at large enterprises. Small fleet owners with 5 to 20 vehicles (Tata Ace, Bolero pickups, outstation cabs, private buses) have zero affordable options.
* **The Solution:** Jaagrat turns any ordinary ₹8,000 Android smartphone mounted on the dashboard into an edge AI fatigue monitor with zero additional hardware.

---

## 2. Unit Economics & Pricing Model

| Metric | Projection | Notes |
| :--- | :--- | :--- |
| **Subscription Price** | ₹199 / vehicle / month | ~₹6.50 / vehicle / day |
| **Cloud Cost per Vehicle** | ~₹15 / month | Firestore writes only on fatigue events (~1 KB doc) |
| **SMS Alert Cost** | ~₹5 / month | Fast2SMS transactional route (~₹0.20 per critical alert) |
| **Net Gross Margin** | **~85% - 90%** | Software-only delivery, high gross margin |
| **100 Fleets Scale (10 veh/fleet)** | 1,000 vehicles = ₹1,99,000/mo (~₹24 Lakh ARR) | Achievable in Bangalore + Chennai corridors |

---

## 3. Go-To-Market (GTM) Playbook

### Step 1: Wedge Segment Selection
Focus on **Airport and Outstation Tourist Cabs in Bangalore** and **Night Goods Carriers on the Bangalore-Mysuru / Tumkur corridors**:
* Vehicles travel at night.
* Fleets have 5–15 vehicles managed by a single owner.
* The owner suffers devastating financial losses if even one vehicle crashes.

### Step 2: The "Free 30-Day In-Person Pilot"
* Install Jaagrat on 2 to 3 vehicles across 5 target fleets personally.
* Supply a sturdy ₹299 dashboard phone mount and high-speed car charger for the pilot.
* Track real near-misses and microsleep events over 30 days.

### Step 3: Driver Alignment (The Safety Bonus System)
* Drivers reject "surveillance cameras" and will cover camera lenses if they feel spied on.
* Solution: Position Jaagrat as a **Driver Safety & Bonus Tool**.
* Owners allocate ₹50–₹100 per shift as a safe-driving bonus if no unacknowledged Level-2/3 alerts are triggered. Drivers now actively keep the app running.

---

## 4. Privacy & Regulatory Compliance (India DPDP Act 2023)

1. **Edge-Only Video Processing:** Video frames are held in memory for ML inference and immediately overwritten. Video never touches the flash disk or the cloud.
2. **Explicit Informed Consent:** Plain-language audio/visual consent in Hindi, Kannada, Tamil, Telugu, Marathi, and English before the first trip.
3. **Legal Disclaimer:** Clearly disclaim that Jaagrat is a *Driver Alertness Aid* and *not an autonomous accident prevention system*.
