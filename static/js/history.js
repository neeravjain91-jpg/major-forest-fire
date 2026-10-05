/**
 * India Forest Fire Intelligence — History & Replay Controller
 * Spatiotemporal fire complexes and dual-domain prospective historical replay station.
 */

const HistoryPage = {
  historyAtlas: null,

  init() {
    this.historyAtlas = new AtlasMap('history-map');
    this.historyAtlas.init();

    this.bindEvents();
    this.loadActiveEvents();
  },

  bindEvents() {
    const replayBtn = document.getElementById('btn-run-replay');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => this.runReplay());
    }

    const threshSlider = document.getElementById('replay-threshold');
    const threshLabel = document.getElementById('replay-threshold-val');
    if (threshSlider && threshLabel) {
      threshSlider.addEventListener('input', (e) => {
        threshLabel.textContent = `${parseFloat(e.target.value).toFixed(2)}`;
      });
    }
  },

  async loadActiveEvents() {
    try {
      const resp = await fetch('/api/active-events');
      if (!resp.ok) return;
      const data = await resp.json();

      const countBadge = document.getElementById('events-count-badge');
      if (countBadge) countBadge.textContent = `${data.count || 0} Tracked Complexes`;

      if (data.events && this.historyAtlas) {
        data.events.forEach(evt => {
          if (evt.centroid_lat && evt.centroid_lon) {
            const circle = L.circleMarker([evt.centroid_lat, evt.centroid_lon], {
              radius: Math.max(5, Math.min(14, Math.sqrt(evt.detection_count || 1) * 2)),
              fillColor: '#ea580c',
              fillOpacity: 0.65,
              color: '#9a3412',
              weight: 1.5
            }).bindPopup(`
              <div class="atlas-popup">
                <div class="atlas-popup-header">
                  <span class="badge badge-tag mono">${evt.event_id || 'EVT'}</span>
                  <span class="atlas-popup-frp">${(evt.peak_frp || 0).toFixed(1)} MW</span>
                </div>
                <div class="atlas-popup-grid">
                  <span class="atlas-popup-key">Duration:</span>
                  <span class="atlas-popup-val">${evt.duration_days || 1} Days</span>
                  <span class="atlas-popup-key">Detections:</span>
                  <span class="atlas-popup-val mono">${evt.detection_count || 0}</span>
                  <span class="atlas-popup-key">Period:</span>
                  <span class="atlas-popup-val">${evt.start_date} &rarr; ${evt.end_date}</span>
                </div>
              </div>
            `);
            this.historyAtlas.markersLayer.addLayer(circle);
          }
        });
      }
    } catch (e) {
      console.warn('Error loading active events:', e);
    }
  },

  async runReplay() {
    const dateInput = document.getElementById('replay-date');
    const threshInput = document.getElementById('replay-threshold');
    const btn = document.getElementById('btn-run-replay');

    const dateStr = dateInput?.value || '2024-03-25';
    const threshold = threshInput?.value || '0.40';

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Simulating Prospective Forecast...';
    }

    try {
      const resp = await fetch(`/api/historical-replay?date=${dateStr}&threshold=${threshold}`);
      if (!resp.ok) throw new Error('Replay simulation error');
      const data = await resp.json();

      if (data.status === 'success' && data.data) {
        this.renderReplayResults(data.data);
        App.showToast(`Historical replay verified for ${data.data.forecast_origin_date} &rarr; ${data.data.verification_target_date}`);
      } else {
        throw new Error(data.message || 'Simulation returned no data');
      }
    } catch (e) {
      console.error('Replay error:', e);
      App.showToast(`Simulation failed: ${e.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Run Retrospective Replay';
      }
    }
  },

  renderReplayResults(d) {
    const originEl = document.getElementById('replay-origin-date');
    const targetEl = document.getElementById('replay-target-date');
    const candRecEl = document.getElementById('replay-cand-recall');
    const fullRecEl = document.getElementById('replay-full-recall');
    const precEl = document.getElementById('replay-precision');
    const fprEl = document.getElementById('replay-fpr');

    const hitsEl = document.getElementById('cm-hits');
    const faEl = document.getElementById('cm-false-alarms');
    const missCandEl = document.getElementById('cm-misses-candidate');
    const missOutEl = document.getElementById('cm-misses-outside');
    const totalActualEl = document.getElementById('cm-total-actual');

    if (originEl) originEl.textContent = d.forecast_origin_date;
    if (targetEl) targetEl.textContent = d.verification_target_date;

    const candRecPct = ((d.candidate_domain_recall || 0) * 100).toFixed(2);
    const fullRecPct = ((d.full_spatial_recall || 0) * 100).toFixed(2);
    const precPct = ((d.precision || 0) * 100).toFixed(2);
    const fprPct = ((d.false_positive_rate || 0) * 100).toFixed(2);

    if (candRecEl) candRecEl.textContent = `${candRecPct}%`;
    if (fullRecEl) fullRecEl.textContent = `${fullRecPct}%`;
    if (precEl) precEl.textContent = `${precPct}%`;
    if (fprEl) fprEl.textContent = `${fprPct}%`;

    if (hitsEl) hitsEl.textContent = Number(d.forecast_hits || 0).toLocaleString();
    if (faEl) faEl.textContent = Number(d.forecast_false_alarms || 0).toLocaleString();
    if (missCandEl) missCandEl.textContent = Number(d.misses_in_candidate || 0).toLocaleString();
    if (missOutEl) missOutEl.textContent = Number(d.misses_outside_candidate || 0).toLocaleString();
    if (totalActualEl) totalActualEl.textContent = Number(d.actual_fire_cells_total || 0).toLocaleString();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('history-map')) {
    HistoryPage.init();
  }
});
