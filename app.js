/**
 * Master Application Controller
 * Coordinates UI tabs, simulation playback loop, radar rendering,
 * AI Threat Engine evaluation, and live telemetry synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentTab: 'home',
    activeScenario: SCENARIOS[0],
    selectedDroneIndex: 0,
    isPlaying: false,
    simTime: 0, // In seconds
    simDuration: 60,
    playbackSpeed: 1,
    simProgress: 0,
    lastFrameTime: performance.now(),
    analysisReport: null,
    eventLogs: [],
    radarInstance: null,
    reportManager: null
  };

  // Initialize Report Manager
  const reportManager = new ReportManager();
  window.reportManager = reportManager;
  state.reportManager = reportManager;

  // Initialize Tactical Radar Canvas
  const radar = new TacticalRadar('tactical-radar-canvas');
  window.radar = radar;
  state.radarInstance = radar;

  // DOM Elements cache
  const elements = {
    tabButtons: document.querySelectorAll('[data-tab-target]'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundIcon: document.getElementById('sound-icon'),
    soundText: document.getElementById('sound-text'),

    // Live Sim Controls
    btnPlay: document.getElementById('btn-sim-play'),
    btnPlayIcon: document.getElementById('sim-play-icon'),
    btnPause: document.getElementById('btn-sim-pause'),
    btnReset: document.getElementById('btn-sim-reset'),
    speedSelect: document.getElementById('sim-speed-select'),
    simProgressBar: document.getElementById('sim-progress-bar'),
    simTimeCurrent: document.getElementById('sim-time-current'),
    simTimeTotal: document.getElementById('sim-time-total'),

    // Telemetry display elements
    telemetryDroneId: document.getElementById('telemetry-drone-id'),
    telemetryLocation: document.getElementById('telemetry-location'),
    telemetrySpeed: document.getElementById('telemetry-speed'),
    telemetryAltitude: document.getElementById('telemetry-altitude'),
    telemetryDirection: document.getElementById('telemetry-direction'),
    telemetryThreatBadge: document.getElementById('telemetry-threat-badge'),
    telemetryRcs: document.getElementById('telemetry-rcs'),
    telemetryRf: document.getElementById('telemetry-rf'),
    telemetryRemoteId: document.getElementById('telemetry-remote-id'),

    // AI Analysis Display
    aiClassification: document.getElementById('ai-classification'),
    aiClassificationCode: document.getElementById('ai-class-code'),
    aiRiskScoreVal: document.getElementById('ai-risk-score-val'),
    aiRiskGaugeBar: document.getElementById('ai-risk-gauge-bar'),
    aiRiskCategoryBadge: document.getElementById('ai-risk-category-badge'),
    aiReasonsContainer: document.getElementById('ai-reasons-container'),
    aiRecommendationsList: document.getElementById('ai-recommendations-list'),
    aiResponseProtocolBadge: document.getElementById('ai-protocol-badge'),
    aiFeatureImportanceList: document.getElementById('ai-features-list'),
    aiInferenceLatency: document.getElementById('ai-inference-latency'),

    // Live Status Bar & Events
    liveStatusLed: document.getElementById('live-status-led'),
    liveStatusText: document.getElementById('live-status-text'),
    liveDetectionTime: document.getElementById('live-detection-time'),
    liveEventFeed: document.getElementById('live-event-feed'),
    droneSelectorContainer: document.getElementById('drone-selector-chips'),

    // Scenario Selection UI
    scenarioCardsContainer: document.getElementById('scenario-cards-container'),
    customScenarioModal: document.getElementById('custom-scenario-modal'),
    customScenarioForm: document.getElementById('custom-scenario-form'),

    // Reports UI
    reportsContainer: document.getElementById('reports-display-container'),
    reportsFilterSelect: document.getElementById('reports-filter-select'),
    reportsSearchInput: document.getElementById('reports-search-input'),
    reportsViewToggle: document.getElementById('reports-view-toggle')
  };

  // Set initial scenario in radar
  radar.setDrones(state.activeScenario.drones);
  state.simDuration = state.activeScenario.duration;

  // Initialize Scenario Cards
  renderScenarioCards();

  // Run initial AI analysis
  performAIAnalysis();

  // Update UI Telemetry fields
  updateTelemetryUI();

  // Initialize Reports UI
  updateReportsUI();

  // Initial Event Log entries
  logEvent('System initialized. Multi-sensor radar and AI threat engine online.', 'info');
  logEvent(`Active scenario loaded: "${state.activeScenario.title}"`, 'info');

  /* ==========================================================================
     TAB NAVIGATION SYSTEM
     ========================================================================== */
  function switchTab(tabId) {
    state.currentTab = tabId;

    // Update nav buttons
    elements.tabButtons.forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === tabId) {
        btn.classList.add('active', 'text-sky-400');
        btn.classList.remove('text-slate-300');
      } else {
        btn.classList.remove('active', 'text-sky-400');
        btn.classList.add('text-slate-300');
      }
    });

    // Update tab panes
    elements.tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // If switching to reports, refresh the table
    if (tabId === 'reports') {
      updateReportsUI();
    }

    // Close mobile menu if open
    if (elements.mobileMenu) {
      elements.mobileMenu.classList.add('hidden');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  // Attach tab click events
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab-target');
      if (target) switchTab(target);
    });
  });

  // Global nav helpers for inline buttons
  window.navigateTo = (tabId) => switchTab(tabId);

  // Mobile menu toggle
  if (elements.mobileMenuBtn && elements.mobileMenu) {
    elements.mobileMenuBtn.addEventListener('click', () => {
      elements.mobileMenu.classList.toggle('hidden');
    });
  }

  /* ==========================================================================
     TACTICAL AUDIO MUTE TOGGLE
     ========================================================================== */
  function updateSoundUI() {
    const isMuted = window.tacticalAudio ? window.tacticalAudio.isMuted : true;
    if (elements.soundText) {
      elements.soundText.textContent = isMuted ? 'Sound: Off' : 'Sound: Tactical';
    }
    if (elements.soundToggleBtn) {
      if (isMuted) {
        elements.soundToggleBtn.classList.remove('border-cyan-500', 'text-cyan-400');
        elements.soundToggleBtn.classList.add('border-slate-700', 'text-slate-400');
      } else {
        elements.soundToggleBtn.classList.add('border-cyan-500', 'text-cyan-400');
        elements.soundToggleBtn.classList.remove('border-slate-700', 'text-slate-400');
      }
    }
  }

  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener('click', () => {
      if (window.tacticalAudio) {
        window.tacticalAudio.toggleMute();
        updateSoundUI();
        if (!window.tacticalAudio.isMuted) {
          window.tacticalAudio.playActionBeep();
        }
      }
    });
  }
  updateSoundUI();

  /* ==========================================================================
     SCENARIO SELECTION & SETUP
     ========================================================================== */
  function renderScenarioCards() {
    if (!elements.scenarioCardsContainer) return;

    elements.scenarioCardsContainer.innerHTML = SCENARIOS.map(sc => {
      const isActive = sc.id === state.activeScenario.id;
      let badgeClass = 'badge-moderate';
      if (sc.baseThreatLevel === 'Critical') badgeClass = 'badge-critical';
      else if (sc.baseThreatLevel === 'High') badgeClass = 'badge-high';
      else if (sc.baseThreatLevel === 'Low') badgeClass = 'badge-low';

      return `
        <div class="tactical-card p-5 cursor-pointer relative ${isActive ? 'tactical-card-active' : ''}" onclick="window.selectScenario('${sc.id}')">
          <div class="flex items-start justify-between mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass}">
              ${sc.difficulty}
            </span>
            <span class="text-xs font-mono text-cyan-400">${sc.drones.length} UAV${sc.drones.length > 1 ? 's' : ''}</span>
          </div>

          <h3 class="text-base font-bold text-slate-100 mb-1">${sc.title}</h3>
          <p class="text-xs text-slate-400 mb-4 line-clamp-2">${sc.description}</p>

          <div class="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800/80 mb-4">
            <div class="flex justify-between">
              <span class="text-slate-500">Target Airframe:</span>
              <span class="text-slate-200">${sc.drones[0].type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Initial Speed:</span>
              <span class="text-cyan-400">${sc.drones[0].speedKmh} km/h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Altitude:</span>
              <span class="text-slate-200">${sc.drones[0].altitudeM} m AGL</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Target Zone:</span>
              <span class="text-amber-400">${sc.primaryZone}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-800">
            <span class="text-xs font-mono text-slate-500">Scenario ID: ${sc.id}</span>
            <button class="px-3 py-1 text-xs rounded font-medium ${isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'} transition">
              ${isActive ? 'Active Target' : 'Select'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectScenario = (scenarioId) => {
    const sc = SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) return;

    state.activeScenario = sc;
    state.selectedDroneIndex = 0;
    state.simTime = 0;
    state.simProgress = 0;
    state.simDuration = sc.duration;

    radar.resetTrails();
    radar.setDrones(sc.drones);

    renderScenarioCards();
    updateDroneChips();
    performAIAnalysis();
    updateTelemetryUI();

    logEvent(`Loaded scenario: "${sc.title}" (${sc.drones.length} target(s))`, 'info');

    if (window.tacticalAudio) {
      if (sc.baseThreatLevel === 'Critical' || sc.baseThreatLevel === 'High') {
        window.tacticalAudio.playThreatAlert(sc.baseThreatLevel === 'Critical');
      } else {
        window.tacticalAudio.playActionBeep();
      }
    }
  };

  // Drone Selector Chips (for multi-drone swarm scenarios)
  function updateDroneChips() {
    if (!elements.droneSelectorContainer) return;

    if (state.activeScenario.drones.length <= 1) {
      elements.droneSelectorContainer.innerHTML = '';
      return;
    }

    elements.droneSelectorContainer.innerHTML = `
      <div class="flex items-center space-x-2 pb-2">
        <span class="text-xs font-mono text-slate-400 uppercase tracking-wider">Swarm Targets:</span>
        ${state.activeScenario.drones.map((d, idx) => `
          <button onclick="window.selectDrone(${idx})" class="px-2.5 py-1 text-xs font-mono rounded border transition ${idx === state.selectedDroneIndex ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}">
            ${d.id}
          </button>
        `).join('')}
      </div>
    `;
  }

  window.selectDrone = (droneIndex) => {
    state.selectedDroneIndex = droneIndex;
    const drone = state.activeScenario.drones[droneIndex];
    if (drone) {
      radar.selectedDroneId = drone.id;
      performAIAnalysis();
      updateTelemetryUI();
      logEvent(`Focused tracking on unit ${drone.id}`, 'info');
      if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
    }
    updateDroneChips();
  };

  window.onDroneSelected = (drone) => {
    const idx = state.activeScenario.drones.findIndex(d => d.id === drone.id);
    if (idx !== -1) {
      state.selectedDroneIndex = idx;
      performAIAnalysis();
      updateTelemetryUI();
      updateDroneChips();
    }
  };

  /* ==========================================================================
     CUSTOM SCENARIO CREATOR
     ========================================================================== */
  window.openCustomScenarioModal = () => {
    if (elements.customScenarioModal) {
      elements.customScenarioModal.classList.remove('hidden');
      elements.customScenarioModal.classList.add('flex');
    }
  };

  window.closeCustomScenarioModal = () => {
    if (elements.customScenarioModal) {
      elements.customScenarioModal.classList.add('hidden');
      elements.customScenarioModal.classList.remove('flex');
    }
  };

  if (elements.customScenarioForm) {
    elements.customScenarioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(elements.customScenarioForm);
      const params = Object.fromEntries(formData.entries());

      const customScenario = createCustomScenario(params);
      SCENARIOS.unshift(customScenario);

      window.closeCustomScenarioModal();
      window.selectScenario(customScenario.id);
      switchTab('simulation');

      logEvent(`Custom scenario created: "${customScenario.title}"`, 'warning');
    });
  }

  /* ==========================================================================
     AI THREAT ANALYSIS EXECUTION
     ========================================================================== */
  function performAIAnalysis() {
    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    const report = window.aiThreatEngine.analyze(state.activeScenario, currentDrone, state);
    state.analysisReport = report;

    // Update UI elements with analysis
    if (elements.aiClassification) elements.aiClassification.textContent = report.threatClassification;
    if (elements.aiClassificationCode) elements.aiClassificationCode.textContent = report.classificationCode;
    if (elements.aiRiskScoreVal) elements.aiRiskScoreVal.textContent = report.riskScore;

    // Update gauge bar
    if (elements.aiRiskGaugeBar) {
      elements.aiRiskGaugeBar.style.width = `${report.riskScore}%`;
      elements.aiRiskGaugeBar.className = 'h-3 rounded-full transition-all duration-500 ' + 
        (report.riskScore >= 75 ? 'bg-red-500 shadow-lg shadow-red-500/30' : report.riskScore >= 45 ? 'bg-amber-400 shadow-lg shadow-amber-500/30' : 'bg-emerald-400 shadow-lg shadow-emerald-500/30');
    }

    // Risk badge
    if (elements.aiRiskCategoryBadge) {
      let badgeClass = 'badge-moderate';
      if (report.threatLevel === 'Critical') badgeClass = 'badge-critical';
      else if (report.threatLevel === 'High') badgeClass = 'badge-high';
      else if (report.threatLevel === 'Low') badgeClass = 'badge-low';

      elements.aiRiskCategoryBadge.textContent = `${report.threatLevel} Severity (${report.riskScore}/100)`;
      elements.aiRiskCategoryBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`;
    }

    if (elements.aiInferenceLatency) {
      elements.aiInferenceLatency.textContent = `${report.inferenceTimeMs} ms`;
    }

    // Render Reasons
    if (elements.aiReasonsContainer) {
      elements.aiReasonsContainer.innerHTML = report.reasons.map((r, i) => `
        <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/90 flex items-start space-x-3">
          <div class="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
            ${i + 1}
          </div>
          <div>
            <h5 class="text-xs font-bold text-slate-200 uppercase tracking-wider mb-0.5">${r.title}</h5>
            <p class="text-xs text-slate-400 leading-relaxed">${r.detail}</p>
          </div>
        </div>
      `).join('');
    }

    // Render Recommended Safe Non-Kinetic Response
    if (elements.aiRecommendationsList) {
      const resp = report.recommendedResponse;
      if (elements.aiResponseProtocolBadge) {
        elements.aiResponseProtocolBadge.textContent = resp.protocolLevel;
      }

      elements.aiRecommendationsList.innerHTML = resp.actionItems.map((act) => `
        <li class="flex items-start space-x-2 text-xs text-slate-300">
          <svg class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="leading-relaxed">${act}</span>
        </li>
      `).join('');
    }

    // Render Feature Breakdown
    if (elements.aiFeatureImportanceList) {
      elements.aiFeatureImportanceList.innerHTML = report.featureImportance.map(f => `
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-300 font-medium">${f.feature} <span class="text-slate-500">(${f.weight})</span></span>
            <span class="font-mono ${f.score > 70 ? 'text-red-400' : f.score > 40 ? 'text-amber-400' : 'text-emerald-400'} font-bold">${f.score}%</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="h-1.5 rounded-full ${f.score > 70 ? 'bg-red-500' : f.score > 40 ? 'bg-amber-400' : 'bg-emerald-400'}" style="width: ${f.score}%"></div>
          </div>
          <div class="text-[11px] text-slate-500">${f.description}</div>
        </div>
      `).join('');
    }
  }

  /* ==========================================================================
     TELEMETRY DISPLAY UPDATES
     ========================================================================== */
  function updateTelemetryUI() {
    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    if (!currentDrone) return;

    if (elements.telemetryDroneId) elements.telemetryDroneId.textContent = currentDrone.id;
    if (elements.telemetrySpeed) elements.telemetrySpeed.textContent = `${Math.round(currentDrone.speedKmh)} km/h`;
    if (elements.telemetryAltitude) elements.telemetryAltitude.textContent = `${Math.round(currentDrone.altitudeM)} m AGL`;
    if (elements.telemetryDirection) elements.telemetryDirection.textContent = currentDrone.headingText || `${currentDrone.headingDeg}°`;
    if (elements.telemetryRcs) elements.telemetryRcs.textContent = `${currentDrone.rcsM2 || 0.05} m²`;
    if (elements.telemetryRf) elements.telemetryRf.textContent = currentDrone.rfFrequency || '2.4 GHz';
    if (elements.telemetryRemoteId) elements.telemetryRemoteId.textContent = currentDrone.remoteId || 'BROADCAST_DISABLED';

    // Location calculation from normalized coordinate
    const pos = currentDrone.currentPos || currentDrone.initialPos || { x: 0, y: 0 };
    const distKm = (Math.hypot(pos.x, pos.y) * 5.5).toFixed(2);
    const lat = (37.7749 + pos.y * 0.035).toFixed(4);
    const lon = (-122.4194 + pos.x * 0.035).toFixed(4);

    if (elements.telemetryLocation) {
      elements.telemetryLocation.textContent = `[${lat}°, ${lon}°] • ${distKm} km from HQ`;
    }

    // Threat badge
    let badgeClass = 'badge-moderate';
    if (currentDrone.threatLevel === 'Critical') badgeClass = 'badge-critical';
    else if (currentDrone.threatLevel === 'High') badgeClass = 'badge-high';
    else if (currentDrone.threatLevel === 'Low') badgeClass = 'badge-low';

    if (elements.telemetryThreatBadge) {
      elements.telemetryThreatBadge.textContent = currentDrone.threatLevel;
      elements.telemetryThreatBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${badgeClass}`;
    }

    // Update Live Radar HUD Elements
    const hudDroneId = document.getElementById('live-hud-drone-id');
    const hudSpeed = document.getElementById('live-hud-speed');
    const hudAltitude = document.getElementById('live-hud-altitude');
    const hudHeading = document.getElementById('live-hud-heading');
    const hudDistance = document.getElementById('live-hud-distance');
    const hudRisk = document.getElementById('live-hud-risk');
    const hudThreat = document.getElementById('live-hud-threat');

    if (hudDroneId) hudDroneId.textContent = currentDrone.id;
    if (hudSpeed) hudSpeed.textContent = `${Math.round(currentDrone.speedKmh)} km/h`;
    if (hudAltitude) hudAltitude.textContent = `${Math.round(currentDrone.altitudeM)} m`;
    if (hudHeading) hudHeading.textContent = currentDrone.headingText || `${currentDrone.headingDeg}°`;
    if (hudDistance) hudDistance.textContent = `${distKm} km`;
    if (hudRisk && state.analysisReport) hudRisk.textContent = `${state.analysisReport.riskScore}/100`;
    if (hudThreat) {
      hudThreat.textContent = currentDrone.threatLevel;
      hudThreat.className = `px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${badgeClass}`;
    }
  }

  /* ==========================================================================
     SIMULATION PLAYBACK LOOP
     ========================================================================== */
  function startSimulation() {
    state.isPlaying = true;
    if (elements.btnPlayIcon) {
      elements.btnPlayIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
    if (elements.liveStatusLed) {
      elements.liveStatusLed.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
    }
    if (elements.liveStatusText) {
      elements.liveStatusText.textContent = 'SIMULATION ACTIVE';
      elements.liveStatusText.className = 'text-xs font-mono text-emerald-400 font-bold';
    }

    logEvent(`Simulation started: target velocity locked at ${state.playbackSpeed}x`, 'info');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  function pauseSimulation() {
    state.isPlaying = false;
    if (elements.btnPlayIcon) {
      elements.btnPlayIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
    if (elements.liveStatusLed) {
      elements.liveStatusLed.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
    }
    if (elements.liveStatusText) {
      elements.liveStatusText.textContent = 'SIMULATION PAUSED';
      elements.liveStatusText.className = 'text-xs font-mono text-amber-400 font-bold';
    }

    logEvent('Simulation paused by operator.', 'warning');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  function resetSimulation() {
    state.isPlaying = false;
    state.simTime = 0;
    state.simProgress = 0;

    radar.resetTrails();

    if (elements.btnPlayIcon) {
      elements.btnPlayIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
    if (elements.liveStatusLed) {
      elements.liveStatusLed.className = 'w-2.5 h-2.5 rounded-full bg-cyan-400';
    }
    if (elements.liveStatusText) {
      elements.liveStatusText.textContent = 'STANDBY / READY';
      elements.liveStatusText.className = 'text-xs font-mono text-cyan-400 font-bold';
    }
    if (elements.simProgressBar) {
      elements.simProgressBar.style.width = '0%';
    }
    if (elements.simTimeCurrent) {
      elements.simTimeCurrent.textContent = '00:00';
    }

    // Reset drones to start
    radar.update(0, 0);
    performAIAnalysis();
    updateTelemetryUI();

    logEvent('Simulation timeline reset to initial contact vector.', 'info');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  // Simulation controls listeners
  if (elements.btnPlay) {
    elements.btnPlay.addEventListener('click', () => {
      if (state.isPlaying) {
        pauseSimulation();
      } else {
        startSimulation();
      }
    });
  }

  if (elements.btnPause) {
    elements.btnPause.addEventListener('click', pauseSimulation);
  }

  if (elements.btnReset) {
    elements.btnReset.addEventListener('click', resetSimulation);
  }

  if (elements.speedSelect) {
    elements.speedSelect.addEventListener('change', (e) => {
      state.playbackSpeed = parseFloat(e.target.value);
      logEvent(`Simulation speed set to ${state.playbackSpeed}x`, 'info');
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Only trigger if not typing in an input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.isPlaying) pauseSimulation();
      else startSimulation();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      resetSimulation();
    }
  });

  /* ==========================================================================
     ANIMATION LOOP & SIMULATION TICK
     ========================================================================== */
  function animationLoop(timestamp) {
    const dt = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;

    if (state.isPlaying) {
      // Advance simulation time
      state.simTime += dt * state.playbackSpeed;
      state.simProgress = Math.min(1, state.simTime / state.simDuration);

      // Periodic AI re-evaluation every 0.5 sec
      if (Math.floor(state.simTime * 2) !== Math.floor((state.simTime - dt * state.playbackSpeed) * 2)) {
        performAIAnalysis();
        updateTelemetryUI();
      }

      // Update simulation time UI
      if (elements.simTimeCurrent) {
        const mins = Math.floor(state.simTime / 60).toString().padStart(2, '0');
        const secs = Math.floor(state.simTime % 60).toString().padStart(2, '0');
        elements.simTimeCurrent.textContent = `${mins}:${secs}`;
      }
      if (elements.simProgressBar) {
        elements.simProgressBar.style.width = `${state.simProgress * 100}%`;
      }

      // Check for mission milestones
      if (state.simProgress >= 0.5 && !state.hasLoggedHalfway) {
        state.hasLoggedHalfway = true;
        logEvent(`Target approaching core 2km perimeter zone. Multi-sensor tracking active.`, 'warning');
      }

      // Completed simulation
      if (state.simTime >= state.simDuration) {
        pauseSimulation();
        onSimulationCompleted();
      }
    }

    // Always update and render radar canvas
    radar.update(dt, state.simProgress);
    radar.render();

    requestAnimationFrame(animationLoop);
  }

  requestAnimationFrame(animationLoop);

  /* ==========================================================================
     SIMULATION COMPLETION & AUTOMATIC REPORT ARCHIVAL
     ========================================================================== */
  function onSimulationCompleted() {
    logEvent(`Simulation run complete: Non-kinetic safe advisory response protocol concluded.`, 'success');

    if (window.tacticalAudio) {
      window.tacticalAudio.playSafeSuccess();
    }

    // Auto record into Reports history
    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    const newReport = {
      id: `SIM-RPT-${Math.floor(1000 + Math.random() * 9000)}`,
      scenario: state.activeScenario.title,
      scenarioId: state.activeScenario.id,
      droneId: currentDrone.id,
      threatLevel: state.analysisReport ? state.analysisReport.threatLevel : 'High',
      riskScore: state.analysisReport ? state.analysisReport.riskScore : 75,
      dateTime: new Date().toLocaleString(),
      result: state.analysisReport ? state.analysisReport.recommendedResponse.actionItems[0] : 'Defensive protocol logged successfully.',
      classification: state.analysisReport ? state.analysisReport.threatClassification : 'Simulated Airspace Contact',
      inferenceLatency: state.analysisReport ? `${state.analysisReport.inferenceTimeMs} ms` : '22.0 ms',
      notes: `Automated post-flight telemetry log: Flight duration ${state.simDuration}s, trajectory pattern: ${currentDrone.flightPattern}. Safe non-kinetic resolution confirmed.`
    };

    reportManager.saveReport(newReport);
    updateReportsUI();

    // Trigger subtle notification toast
    showToast(`Simulation Complete! Incident report archived as ${newReport.id}`);
  }

  /* ==========================================================================
     EVENT LOGGING SYSTEM
     ========================================================================== */
  function logEvent(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const eventObj = { time, message, type };
    state.eventLogs.unshift(eventObj);
    if (state.eventLogs.length > 40) state.eventLogs.pop();

    if (elements.liveEventFeed) {
      const logHtml = state.eventLogs.slice(0, 15).map(e => `
        <div class="log-item ${e.type} p-2 text-xs font-mono rounded bg-slate-900/40 border border-slate-800/80 mb-1.5 flex items-start space-x-2">
          <span class="text-slate-500 whitespace-nowrap">[${e.time}]</span>
          <span class="${e.type === 'critical' ? 'text-red-400' : e.type === 'warning' ? 'text-amber-400' : e.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}">
            ${e.message}
          </span>
        </div>
      `).join('');
      elements.liveEventFeed.innerHTML = logHtml;
    }
  }

  // Toast notification
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-lg shadow-xl shadow-cyan-500/10 text-xs font-mono flex items-center space-x-2 transition-all duration-300';
    toast.innerHTML = `
      <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${msg}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================================
     REPORTS UI CONTROLS & LISTENERS
     ========================================================================== */
  function updateReportsUI() {
    reportManager.render('reports-display-container');
  }

  if (elements.reportsFilterSelect) {
    elements.reportsFilterSelect.addEventListener('change', (e) => {
      reportManager.currentFilter = e.target.value;
      updateReportsUI();
    });
  }

  if (elements.reportsSearchInput) {
    elements.reportsSearchInput.addEventListener('input', (e) => {
      reportManager.searchQuery = e.target.value;
      updateReportsUI();
    });
  }

  if (elements.reportsViewToggle) {
    elements.reportsViewToggle.addEventListener('click', () => {
      reportManager.viewMode = reportManager.viewMode === 'table' ? 'cards' : 'table';
      elements.reportsViewToggle.textContent = reportManager.viewMode === 'table' ? 'View as Cards' : 'View as Table';
      updateReportsUI();
    });
  }

  // Live detection timestamp
  setInterval(() => {
    if (elements.liveDetectionTime) {
      elements.liveDetectionTime.textContent = new Date().toLocaleTimeString();
    }
  }, 1000);

  // Radar display toggle buttons
  const toggleTrailsBtn = document.getElementById('toggle-radar-trails');
  if (toggleTrailsBtn) {
    toggleTrailsBtn.addEventListener('click', () => {
      radar.showTrails = !radar.showTrails;
      toggleTrailsBtn.classList.toggle('text-cyan-400');
      toggleTrailsBtn.classList.toggle('text-slate-400');
    });
  }

  const toggleZonesBtn = document.getElementById('toggle-radar-zones');
  if (toggleZonesBtn) {
    toggleZonesBtn.addEventListener('click', () => {
      radar.showZones = !radar.showZones;
      toggleZonesBtn.classList.toggle('text-cyan-400');
      toggleZonesBtn.classList.toggle('text-slate-400');
    });
  }

  const toggleSweepBtn = document.getElementById('toggle-radar-sweep');
  if (toggleSweepBtn) {
    toggleSweepBtn.addEventListener('click', () => {
      radar.showSweep = !radar.showSweep;
      toggleSweepBtn.classList.toggle('text-cyan-400');
      toggleSweepBtn.classList.toggle('text-slate-400');
    });
  }
});
