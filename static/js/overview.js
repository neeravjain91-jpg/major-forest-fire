/**
 * India Forest Fire Intelligence — Overview Controller
 * Real-time satellite surveillance, FIRMS telemetry ingestion, and priority ranking.
 */

const OverviewPage = {
  atlas: null,
  cachedFires: [],
  currentFilter: 'all',

  init() {
    this.atlas = new AtlasMap('india-map');
    this.atlas.init();

    this.bindEvents();
    this.fetchSurveillanceData();
  },

  bindEvents() {
    const refreshBtn = document.getElementById('btn-refresh-feed');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('loading');
        this.fetchSurveillanceData(() => refreshBtn.classList.remove('loading'));
      });
    }

    const resetBtn = document.getElementById('map-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.atlas.resetView());
    }

    const zoomInBtn = document.getElementById('map-btn-zoomin');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.atlas.map.zoomIn());
    }

    const zoomOutBtn = document.getElementById('map-btn-zoomout');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.atlas.map.zoomOut());
    }

    const filterSelect = document.getElementById('filter-activity');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.renderMapAndTable();
      });
    }

    const layerSelect = document.getElementById('select-map-layer');
    if (layerSelect) {
      layerSelect.addEventListener('change', (e) => {
        this.atlas.setBaseTile(e.target.value);
      });
    }

    const satSelect = document.getElementById('satellite-source-select');
    if (satSelect) {
      satSelect.addEventListener('change', () => this.fetchSurveillanceData());
    }
  },

  async fetchSurveillanceData(callback) {
    try {
      const sat = document.getElementById('satellite-source-select')?.value || 'ALL';
      const resp = await fetch(`/api/live-fires?days=1&source=${sat}`);
      if (!resp.ok) throw new Error('Network error fetching live telemetry');
      const data = await resp.json();

      this.cachedFires = data.fires || [];
      this.updateKPIs(data.summary || {});
      this.renderMapAndTable();

      if (callback) callback();
      App.showToast(`Updated with ${this.cachedFires.length} sovereign detections.`);
    } catch (e) {
      console.error('Error in surveillance feed:', e);
      if (callback) callback();
      App.showToast('Failed to refresh surveillance feed.', 'error');
    }
  },

  updateKPIs(summary) {
    const totalEl = document.getElementById('kpi-active-hotspots');
    const severeEl = document.getElementById('kpi-severe-detections');
    const peakEl = document.getElementById('kpi-peak-frp');
    const meanEl = document.getElementById('kpi-mean-frp');

    if (totalEl) totalEl.textContent = Number(summary.total_fires || 0).toLocaleString();
    if (severeEl) severeEl.textContent = Number(summary.severe_count || 0).toLocaleString();
    if (peakEl) peakEl.textContent = `${Number(summary.max_frp || 0).toFixed(1)} MW`;
    if (meanEl) meanEl.textContent = `${Number(summary.mean_frp || 0).toFixed(1)} MW`;
  },

  renderMapAndTable() {
    if (!this.atlas || !this.atlas.markersLayer) return;
    this.atlas.markersLayer.clearLayers();

    // Filter detections
    let filtered = [...this.cachedFires];
    if (this.currentFilter === 'severe') {
      filtered = filtered.filter(f => (f.severity || '').toUpperCase() === 'SEVERE');
    } else if (this.currentFilter === 'high') {
      filtered = filtered.filter(f => ['HIGH', 'SEVERE'].includes((f.severity || '').toUpperCase()));
    }

    // Sort by FRP descending
    filtered.sort((a, b) => (b.frp || 0) - (a.frp || 0));

    // Render markers on map
    const markerLookup = new Map();
    filtered.forEach((det, idx) => {
      const lat = det.lat !== undefined ? det.lat : (det.latitude !== undefined ? det.latitude : det.grid_lat);
      const lon = det.lon !== undefined ? det.lon : (det.longitude !== undefined ? det.longitude : det.grid_lon);
      if (lat === undefined || lon === undefined) return;

      const icon = this.atlas.createFireMarkerIcon(det.frp, det.severity);
      const marker = L.marker([lat, lon], { icon })
        .bindPopup(this.atlas.buildPopupHtml(det));

      this.atlas.markersLayer.addLayer(marker);
      markerLookup.set(idx, marker);
    });

    // Render Priority Detections Table
    const tbody = document.getElementById('priority-table-body');
    const countBadge = document.getElementById('priority-count-badge');
    if (countBadge) countBadge.textContent = `${filtered.length} Detections`;

    if (!tbody) return;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:28px;color:var(--text-muted);">
            No thermal anomalies detected matching the current criteria.
          </td>
        </tr>
      `;
      return;
    }

    // Display top 50 in table
    filtered.slice(0, 50).forEach((det, index) => {
      const tr = document.createElement('tr');
      const sev = (det.severity || 'LOW').toUpperCase();
      const frpVal = (det.frp || 0).toFixed(1);
      const latNum = det.lat !== undefined ? det.lat : (det.latitude !== undefined ? det.latitude : det.grid_lat);
      const lonNum = det.lon !== undefined ? det.lon : (det.longitude !== undefined ? det.longitude : det.grid_lon);
      const latVal = typeof latNum === 'number' ? latNum.toFixed(3) : latNum;
      const lonVal = typeof lonNum === 'number' ? lonNum.toFixed(3) : lonNum;
      const timeVal = det.acq_time_ist || det.acq_time || 'N/A';
      const satVal = det.satellite || 'VIIRS';
      const confVal = det.confidence || 'nominal';

      tr.innerHTML = `
        <td class="mono" style="font-weight:600;color:var(--text-muted);">#${index + 1}</td>
        <td class="mono" style="font-weight:700;color:var(--fire-orange-dark);">${frpVal} MW</td>
        <td><span class="badge badge-${sev.toLowerCase()}">${sev}</span></td>
        <td class="mono">${latVal}°N, ${lonVal}°E</td>
        <td><span class="badge badge-tag">${satVal}</span></td>
        <td style="text-transform:capitalize;">${confVal}</td>
        <td class="mono" style="color:var(--text-secondary);">${timeVal}</td>
      `;

      tr.addEventListener('click', () => {
        const marker = markerLookup.get(index);
        if (marker && latNum && lonNum) {
          this.atlas.map.setView([latNum, lonNum], 10, { animate: true });
          marker.openPopup();
        }
      });

      tbody.appendChild(tr);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('india-map')) {
    OverviewPage.init();
  }
});
