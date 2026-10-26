# AI-Enabled Drone & Counter-Drone Threat Simulation Trainer

[![Platform](https://img.shields.io/badge/Platform-Web%20Application-cyan.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Safety-Non--Kinetic%20Educational%20Only-emerald.svg)](https://github.com)
[![Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Ready-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

An educational aerospace security web application built for college project demonstrations, academic defense simulations, and cybersecurity training. 

> **Important Safety & Compliance Notice:**
> This simulation platform uses 100% simulated, synthetic data models for academic and conceptual learning. It **does not connect to, track, or control real-world drones**, nor does it provide instructions or mechanisms for intercepting, disabling, jamming, or damaging aircraft. All counter-drone responses strictly follow **lawful, non-kinetic, and regulatory reporting procedures**.

---

## 🎯 Key Application Sections

### 1. Home Dashboard
* **Project Overview**: High-tech cyber-tactical interface presenting core system telemetry and detection accuracy (97.4% mAP simulated benchmark).
* **Navigation & Quick Actions**: 1-click jumps to Live Tactical Radar, Scenario Presets, and Historical Incident Reports.
* **Architecture Pipeline**: 4-stage pipeline visualization (Telemetry Ingestion &rarr; Multi-Sensor Fusion &rarr; Explainable AI Scoring &rarr; Safe Advisory Escalation).
* **Tactical Audio Synthesizer**: Procedural Web Audio radar sweeps and acoustic alerts with instant mute/unmute control.

### 2. Threat Simulation
Select and test aerial intrusion scenarios:
* **Drone Entering Restricted Area**: Fixed-Wing UAV breaching 3km perimeter heading toward restricted infrastructure at 85 km/h (High Risk).
* **Unknown Drone Detected**: Unregistered commercial quadcopter hovering erratically along advisory boundaries (Moderate Risk).
* **Multiple Drones Detected (Coordinated Swarm)**: 3 synchronized micro-UAVs in tactical V-formation communicating over a 915 MHz mesh network (Critical Risk).
* **Suspicious Flight Pattern**: Agile quadcopter conducting zigzag perimeter reconnaissance and sudden altitude fluctuations (High Risk).
* **Authorized Commercial Delivery (Control Test)**: Certified civil delivery drone operating inside safe transit corridors with valid Remote ID (Safe/Low Risk).
* **Custom Scenario Creator**: Modal to configure Drone ID, airframe type, altitude, speed, bearing, and RF signatures.
* **Simulated Telemetry Display**:
  * Drone ID (e.g. `UAV-INTRUDER-91`)
  * Dynamic GPS Coordinates & Distance from Base
  * Kinematic Speed (km/h) & Altitude (m AGL)
  * Heading Bearing (° and Cardinal Direction)
  * Radar Cross Section (RCS in $m^2$)
  * Broadcast Remote ID transponder compliance status

### 3. AI Threat Analysis (Explainable AI / XAI)
* **Threat Classification**: Classifies incursions (e.g., *Unauthorized Critical Airspace Incursion*, *Synchronized Multi-UAV Swarm*, *Civilian Verified Transit*).
* **Risk Score Index (0–100)**: Real-time dynamic gauge combining spatial proximity, velocity derivatives, transponder validity, and RF spectrum signals.
* **Explainability Breakdown**: Explains the exact mathematical reasons why a target is flagged.
* **Multi-Sensor Feature Weights**:
  * Geofence Proximity & Vector (35% weight)
  * Kinematic & Trajectory Anomaly (25% weight)
  * Transponder / Remote ID Compliance (20% weight)
  * RF Spectrum & Downlink Signature (12% weight)
  * Multi-Sensor Fusion Confidence (8% weight)
* **Recommended Safe Response**: Standardized non-kinetic response checklist (PTZ optical lock, civil ATC NOTAM advisory, facility security dispatch, RF forensic recording).

### 4. Live Simulation Dashboard (Radar & Tactical Grid)
* **Interactive Canvas-based Tactical Radar**:
  * Continuous polar radar sweep beam with phosphor fade
  * Concentric range rings (1.0 km, 2.0 km, 3.0 km, 4.5 km, 5.5 km)
  * Color-coded security zones:
    * **Red Zone**: Restricted Core (1 km radius)
    * **Amber Zone**: Advisory Security Buffer (3 km radius)
    * **Green Zone**: Monitored Airspace Sector
  * Drone target blips with directional heading vectors and motion history trails
  * Click any drone on the radar to inspect its live telemetry
* **Playback Controls**: Play, Pause, Timeline Reset, and Speed Multipliers (0.5x, 1x, 2x, 4x).
* **Keyboard Shortcuts**: `[Space]` to Play/Pause, `[R]` to Reset timeline.
* **Live Event Stream**: Real-time chronological timestamped tactical alert log.

### 5. Reports & Incident Forensics
* **Interactive Table & Card Views**: Switch between tabular data view and tactical incident card view.
* **Filter & Search**: Real-time filtering by threat severity (*Critical*, *High*, *Moderate*, *Low*) or keyword search.
* **Automatic Session Archival**: Every simulation automatically archives its final incident report into browser `localStorage`.
* **Export Capabilities**:
  * **Export to CSV**: Spreadsheet-ready table.
  * **Export to JSON**: Structured data format.
  * **Print / Save as PDF**: Clean, formatted print layout for project viva and academic evaluation.

### 6. About Project & Technical Methodology
* Educational explanation of Counter-UAS (C-UAS) fundamentals.
* Discussion on passive detection methods (Radar, RF scanning, Electro-Optical/Infrared, Acoustic).
* College project metadata and academic evaluation summary.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Markup & Structure** | Semantic HTML5, HTML5 Canvas API |
| **Styling & Theme** | Tailwind CSS (CDN), Custom Cyber-Tactical CSS (`css/styles.css`) |
| **Client-Side Logic** | Vanilla JavaScript ES6+ (Modular Object-Oriented Architecture) |
| **Audio Synthesizer** | HTML5 Web Audio API (Zero external MP3/audio files required) |
| **Storage & State** | Browser `localStorage` API for incident reports |
| **Hosting Compatibility** | 100% Static Web — Instant 1-click **GitHub Pages** deployment |

---

## 🚀 How to Run the Project Locally

No build tools, Node dependencies, or backends are strictly required. You can run it immediately using any of these methods:

### Method 1: Direct Browser Launch
Simply double-click [`index.html`](index.html) or right-click and choose **Open with Browser** (Google Chrome, Microsoft Edge, Firefox, or Safari).

### Method 2: Python HTTP Server (Recommended)
Open a terminal in the project directory and run:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### Method 3: Node.js (npx serve)
```bash
npx serve .
```

---

## 🌐 How to Deploy to GitHub Pages

Because this project is built entirely with client-side HTML, CSS, and JavaScript, deploying it on GitHub Pages takes less than 2 minutes:

1. Create a new repository on GitHub (e.g. `drone-threat-simulator`).
2. Push this folder to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Drone Threat Simulation Trainer"
   git branch -M main
   git remote add origin https://github.com/<your-username>/drone-threat-simulator.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings** &rarr; **Pages**.
4. Under **Branch**, select `main` and root `/ (root)`.
5. Click **Save**. Your site will be live at `https://<your-username>.github.io/drone-threat-simulator/`!

---

## 🎓 College Viva / Project Demonstration Q&A Guide

When presenting this project for an academic evaluation, here are answers to common questions examiners ask:

### Q1: What is the core problem this project addresses?
> **Answer:** The increasing availability of commercial and hobbyist drones poses security risks to airports, government facilities, and critical infrastructure. This project demonstrates how an AI-driven automated system can ingest multi-sensor telemetry, score threats objectively using Explainable AI, and suggest standardized non-kinetic responses without human panic.

### Q2: Why is Explainable AI (XAI) crucial in counter-drone systems?
> **Answer:** In high-stakes airspace defense, operators cannot rely on "black-box" models. If a system classifies a drone as a Critical Threat, human operators need to know **why** (e.g., 90% due to geofence breach, 85% due to transponder absence). Our platform breaks down the exact feature contributions so operators can make lawful, accountable decisions.

### Q3: Why does this system focus on non-kinetic responses?
> **Answer:** Kinetic counter-measures (such as shooting down or jamming drones) are heavily restricted under civil aviation laws (such as FAA and ICAO regulations) because stray projectiles or uncontrolled crashes can cause severe collateral damage. Our platform emphasizes passive tracking, early warning, digital transponder interrogation, and coordination with Air Traffic Control (ATC).

### Q4: How is the synthetic data generated?
> **Answer:** The simulator calculates real-time polar and Cartesian coordinates, heading vectors, radar cross-sections ($m^2$), and RF spectrum frequencies modeled on real commercial airframes (quadcopters, fixed-wing UAVs, and swarm formations).

---

## 📄 License
This project is open-source under the MIT License for educational and academic demonstration purposes.
