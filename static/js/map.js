/**
 * India Forest Fire Intelligence — Cartographic Atlas Map Controller
 * Initializes Leaflet map with muted terrain tiles and India sovereign boundary.
 */

class AtlasMap {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.center = options.center || [22.5, 82.5];
    this.zoom = options.zoom || 5;
    this.map = null;
    this.tileLayers = {};
    this.currentTileLayer = null;
    this.boundaryLayer = null;
    this.markersLayer = null;
  }

  init() {
    const el = document.getElementById(this.containerId);
    if (!el) return null;

    this.map = L.map(this.containerId, {
      center: this.center,
      zoom: this.zoom,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    // Basemaps: Esri World Topo (Authoritative National Atlas style)
    this.tileLayers['topo'] = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, USGS'
      }
    );

    this.tileLayers['osm'] = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    );

    this.tileLayers['topo'].addTo(this.map);
    this.currentTileLayer = 'topo';

    // Layer groups for markers
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Load sovereign boundary
    this.loadIndiaBoundary();

    return this.map;
  }

  async loadIndiaBoundary() {
    try {
      const resp = await fetch('/api/india-boundary');
      if (!resp.ok) return;
      const geojson = await resp.json();

      this.boundaryLayer = L.geoJSON(geojson, {
        style: {
          color: '#57534e',
          weight: 1.4,
          opacity: 0.75,
          fillColor: '#ea580c',
          fillOpacity: 0.02,
          dashArray: '3, 4'
        }
      }).addTo(this.map);
    } catch (e) {
      console.warn('Boundary GeoJSON loading note:', e);
    }
  }

  setBaseTile(name) {
    if (this.tileLayers[name] && name !== this.currentTileLayer) {
      this.map.removeLayer(this.tileLayers[this.currentTileLayer]);
      this.tileLayers[name].addTo(this.map);
      this.currentTileLayer = name;
    }
  }

  resetView() {
    if (this.map) {
      this.map.setView(this.center, this.zoom, { animate: true });
    }
  }

  createFireMarkerIcon(frp, severity) {
    const sev = (severity || 'LOW').toUpperCase();
    const sevClass = sev.toLowerCase();
    
    // Size marker proportional to sqrt(frp)
    const baseRadius = Math.max(6, Math.min(18, Math.round(5 + Math.sqrt(frp || 1) * 1.4)));
    
    return L.divIcon({
      className: 'fire-marker',
      iconSize: [baseRadius * 2, baseRadius * 2],
      iconAnchor: [baseRadius, baseRadius],
      html: `<div class="fire-pin ${sevClass}" style="width:${baseRadius * 2}px;height:${baseRadius * 2}px;"></div>`
    });
  }

  buildPopupHtml(det) {
    const frp = typeof det.frp === 'number' ? det.frp.toFixed(1) : (det.max_frp || 0.0);
    const sev = det.severity || 'LOW';
    const latNum = det.lat !== undefined ? det.lat : (det.latitude !== undefined ? det.latitude : det.grid_lat);
    const lonNum = det.lon !== undefined ? det.lon : (det.longitude !== undefined ? det.longitude : det.grid_lon);
    const lat = typeof latNum === 'number' ? latNum.toFixed(3) : latNum;
    const lon = typeof lonNum === 'number' ? lonNum.toFixed(3) : lonNum;
    const time = det.acq_time_ist || det.acq_time || 'N/A';
    const sat = det.satellite || 'VIIRS';
    const conf = det.confidence || 'nominal';

    return `
      <div class="atlas-popup">
        <div class="atlas-popup-header">
          <span class="badge badge-${sev.toLowerCase()}">${sev}</span>
          <span class="atlas-popup-frp">${frp} MW</span>
        </div>
        <div class="atlas-popup-grid">
          <span class="atlas-popup-key">Location:</span>
          <span class="atlas-popup-val mono">${lat}°N, ${lon}°E</span>
          <span class="atlas-popup-key">Observed:</span>
          <span class="atlas-popup-val">${time}</span>
          <span class="atlas-popup-key">Satellite:</span>
          <span class="atlas-popup-val">${sat}</span>
          <span class="atlas-popup-key">Confidence:</span>
          <span class="atlas-popup-val" style="text-transform:capitalize;">${conf}</span>
        </div>
      </div>
    `;
  }
}
