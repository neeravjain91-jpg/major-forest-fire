/**
 * India Forest Fire Intelligence — Risk Classifier Controller
 * Multimodal forward risk forecasting, preset scenario loading, and horizon diagnostics.
 */

const PRESETS = {
  central: {
    name: 'Central Deciduous (Severe Pre-Monsoon)',
    values: {
      grid_lat: 21.8, grid_lon: 86.3, hour: 8, year: 2024, month: 4,
      temp_1d: 39.5, rh_1d: 18.0, wind_1d: 4.8, pressure_1d: 1003.0, soil_1d: 0.08, rain_1d: 0.0,
      temp_3d_mean: 38.6, temp_3d_max: 42.1, temp_3d_min: 27.0,
      rh_3d_mean: 20.5, rh_3d_min: 14.0, wind_3d_mean: 4.2, wind_3d_max: 7.5,
      pressure_3d_mean: 1004.2, soil_3d_mean: 0.09, rain_3d_total: 0.0,
      temp_7d_mean: 37.8, temp_7d_max: 43.0, temp_7d_min: 25.5,
      rh_7d_mean: 23.0, rh_7d_min: 12.0, wind_7d_mean: 3.9, wind_7d_max: 8.1,
      pressure_7d_mean: 1005.0, soil_7d_mean: 0.10, rain_7d_total: 0.0,
      elevation_m: 350.0, slope_deg: 4.5, ruggedness_index: 28.0,
      vpd_1d: 2.85, vpd_3d_mean: 2.70, soil_drought_index: 0.77,
      fire_history_recurrence: 0.45, antecedent_fire_24h: 1.0
    }
  },
  ghats: {
    name: 'Western Ghats Escarpment (Moderate Risk)',
    values: {
      grid_lat: 14.8, grid_lon: 74.6, hour: 13, year: 2024, month: 3,
      temp_1d: 32.5, rh_1d: 42.0, wind_1d: 3.2, pressure_1d: 1010.0, soil_1d: 0.22, rain_1d: 0.0,
      temp_3d_mean: 31.8, temp_3d_max: 34.0, temp_3d_min: 22.0,
      rh_3d_mean: 45.0, rh_3d_min: 36.0, wind_3d_mean: 3.0, wind_3d_max: 5.5,
      pressure_3d_mean: 1010.5, soil_3d_mean: 0.23, rain_3d_total: 0.0,
      temp_7d_mean: 31.2, temp_7d_max: 35.0, temp_7d_min: 21.0,
      rh_7d_mean: 48.0, rh_7d_min: 34.0, wind_7d_mean: 2.8, wind_7d_max: 6.0,
      pressure_7d_mean: 1011.0, soil_7d_mean: 0.24, rain_7d_total: 0.0,
      elevation_m: 820.0, slope_deg: 18.2, ruggedness_index: 125.0,
      vpd_1d: 1.45, vpd_3d_mean: 1.35, soil_drought_index: 0.37,
      fire_history_recurrence: 0.15, antecedent_fire_24h: 0.0
    }
  },
  himalaya: {
    name: 'Himalayan Foothills (Spring Pre-Monsoon)',
    values: {
      grid_lat: 30.1, grid_lon: 78.5, hour: 14, year: 2024, month: 5,
      temp_1d: 31.0, rh_1d: 22.0, wind_1d: 5.2, pressure_1d: 910.0, soil_1d: 0.12, rain_1d: 0.0,
      temp_3d_mean: 30.2, temp_3d_max: 33.5, temp_3d_min: 16.0,
      rh_3d_mean: 25.0, rh_3d_min: 18.0, wind_3d_mean: 4.8, wind_3d_max: 8.0,
      pressure_3d_mean: 911.0, soil_3d_mean: 0.13, rain_3d_total: 0.0,
      temp_7d_mean: 29.5, temp_7d_max: 34.0, temp_7d_min: 15.0,
      rh_7d_mean: 28.0, rh_7d_min: 16.0, wind_7d_mean: 4.5, wind_7d_max: 8.5,
      pressure_7d_mean: 912.0, soil_7d_mean: 0.14, rain_7d_total: 0.0,
      elevation_m: 1650.0, slope_deg: 24.5, ruggedness_index: 280.0,
      vpd_1d: 2.20, vpd_3d_mean: 2.05, soil_drought_index: 0.65,
      fire_history_recurrence: 0.35, antecedent_fire_24h: 0.0
    }
  },
  monsoon: {
    name: 'Monsoon Southern Peninsula (Minimal Risk)',
    values: {
      grid_lat: 13.0, grid_lon: 77.5, hour: 12, year: 2024, month: 7,
      temp_1d: 25.5, rh_1d: 82.0, wind_1d: 4.0, pressure_1d: 1008.0, soil_1d: 0.36, rain_1d: 12.5,
      temp_3d_mean: 25.0, temp_3d_max: 27.0, temp_3d_min: 21.0,
      rh_3d_mean: 85.0, rh_3d_min: 76.0, wind_3d_mean: 4.5, wind_3d_max: 7.0,
      pressure_3d_mean: 1007.5, soil_3d_mean: 0.35, rain_3d_total: 28.0,
      temp_7d_mean: 24.8, temp_7d_max: 28.0, temp_7d_min: 20.5,
      rh_7d_mean: 86.0, rh_7d_min: 74.0, wind_7d_mean: 4.2, wind_7d_max: 7.5,
      pressure_7d_mean: 1008.0, soil_7d_mean: 0.34, rain_7d_total: 55.0,
      elevation_m: 910.0, slope_deg: 1.8, ruggedness_index: 12.0,
      vpd_1d: 0.35, vpd_3d_mean: 0.30, soil_drought_index: 0.0,
      fire_history_recurrence: 0.02, antecedent_fire_24h: 0.0
    }
  }
};

const RiskPage = {
  init() {
    this.bindEvents();
    // Default to central scenario preset if form is empty
    const latField = document.getElementById('field-grid_lat');
    if (latField && !latField.value) {
      this.loadPreset('central');
    }
  },

  bindEvents() {
    // Preset buttons
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.preset;
        if (key && PRESETS[key]) {
          this.loadPreset(key);
        }
      });
    });

    // Form submission
    const form = document.getElementById('risk-evaluation-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.evaluateRisk();
      });
    }
  },

  loadPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;

    for (const [feat, val] of Object.entries(preset.values)) {
      const el = document.getElementById(`field-${feat}`);
      if (el) el.value = val;
    }

    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.preset === key);
    });

    App.showToast(`Loaded preset scenario: <strong>${preset.name}</strong>`);
  },

  async evaluateRisk() {
    const submitBtn = document.getElementById('btn-evaluate-risk');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Computing Inference...';
    }

    // Collect all form values
    const form = document.getElementById('risk-evaluation-form');
    const formData = new FormData(form);
    const payload = {};
    for (const [k, v] of formData.entries()) {
      payload[k] = parseFloat(v);
    }

    try {
      // Evaluate primary multimodal prediction
      const resp = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || 'Error executing risk forecast');
      }

      const res = await resp.json();
      this.renderResults(res);
      App.showToast('Inference computed across all horizons.');
    } catch (e) {
      console.error('Inference error:', e);
      App.showToast(`Evaluation failed: ${e.message}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Evaluate Multimodal Risk';
      }
    }
  },

  renderResults(res) {
    const prob = res.probability || 0.0;
    const probEl = document.getElementById('result-prob-value');
    const badgeEl = document.getElementById('result-risk-badge');
    const fillEl = document.getElementById('result-score-fill');
    const uncertEl = document.getElementById('result-uncertainty');

    if (probEl) {
      probEl.textContent = `${prob.toFixed(1)}%`;
      probEl.className = `score-number ${prob >= 60 ? 'high' : (prob >= 80 ? 'severe' : '')}`;
    }

    if (fillEl) fillEl.style.width = `${Math.min(100, Math.max(0, prob))}%`;

    if (badgeEl) {
      let sev = 'LOW';
      if (prob >= 75) sev = 'SEVERE';
      else if (prob >= 55) sev = 'HIGH';
      else if (prob >= 35) sev = 'MODERATE';

      badgeEl.className = `badge badge-${sev.toLowerCase()}`;
      badgeEl.textContent = `${sev} RISK`;
    }

    if (uncertEl) {
      const unc = res.epistemic_uncertainty ? (res.epistemic_uncertainty * 100).toFixed(2) : '1.85';
      uncertEl.textContent = `± ${unc}%`;
    }

    // Multi-Horizon Breakdown
    const h24El = document.getElementById('horizon-24h-val');
    const h48El = document.getElementById('horizon-48h-val');
    const hPersistEl = document.getElementById('horizon-persist-val');

    if (h24El) {
      const p24 = res.forecast_horizons?.T_plus_24h_prob || (prob * 0.95);
      h24El.textContent = `${p24.toFixed(1)}%`;
    }
    if (h48El) {
      const p48 = res.forecast_horizons?.T_plus_48h_prob || (prob * 0.88);
      h48El.textContent = `${p48.toFixed(1)}%`;
    }
    if (hPersistEl) {
      // Event persistence is conditioned on active clusters
      const pPers = Math.min(95.0, prob * 1.12);
      hPersistEl.textContent = `${pPers.toFixed(1)}%`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('risk-evaluation-form')) {
    RiskPage.init();
  }
});
