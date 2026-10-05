# Frontend Transformation Report: Premium India Wildfire Intelligence Platform

**Repository**: `neeravjain91-jpg/major-forest-fire`  
**Date**: October 2026  
**Visual Aesthetic**: Editorial National Atlas / Cartographic Intelligence ("India Forest Fire Intelligence")  
**Design Reference**: Inspired by the authoritative national intelligence atlas composition  

---

## 1. Architectural Architecture: Before vs. After

| Attribute | Legacy UI Architecture | New Transformed Architecture |
| :--- | :--- | :--- |
| **Visual Style** | Dark-mode cyberpunk dashboard (`#080c10`), neon green buttons, high-contrast dark cards | **Editorial Atlas Aesthetic**: Warm ivory paper (`#fcfbf7`), charcoal ink typography (`#1c1917`), muted topographic cartography, restrained ember orange (`#ea580c`) |
| **Typography** | Generic sans-serif / monospace throughout | **High-Class Dual Hierarchy**: Editorial serif (`Newsreader`) for headings; clean geometric sans-serif (`Inter`) for controls/tables; `JetBrains Mono` for coordinates & telemetry |
| **Layout** | Monolithic single-file template (`index.html`, 1,610 lines) with inline styles and scripts | **Modular Template & Asset Hierarchy**: Base layout (`base.html`), 4 dedicated pages (`overview.html`, `risk.html`, `history.html`, `research.html`), separated CSS tokens, and modular JS controllers |
| **Map Experience** | Basic map frame | **Dominant Cartographic Canvas**: Full-bleed 620px map dominating the Overview, Esri World Topographic tiles, Survey of India boundary overlay, FRP-proportional glowing markers, floating controls, custom legend |
| **Navigation** | Cluttered tabs | **Sticky Top Header**: Brand logo flame, "India Forest Fire Intelligence", active status indicator (pulsing live feed badge), "Refresh Feed" button, clean navigation bar |
| **Research Presentation** | Minimal text table | **Academic Research Dashboard**: 5 academic KPI cards, 2&times;2 factorial design matrix, dynamic 95% CI forest plot, LOGRO spatial transfer table, calibration comparison |

---

## 2. Directory Structure of Frontend Assets

```
templates/
├── base.html              # Sticky header, brand identity, navigation, live status, research disclaimer footer
├── overview.html          # "India, in focus.", live FIRMS surveillance, dominant map, priority detections table
├── risk.html              # 39-feature multimodal risk form, regional preset loader, multi-horizon breakdown
├── history.html           # Connected-component complexes map, dual-domain prospective replay station
└── research.html          # Academic research dashboard, 2x2 factorial, forest plot, LOGRO, calibration

static/
├── css/
│   ├── main.css           # Design tokens (--bg-paper, --fire-orange, etc.), CSS reset, typography
│   ├── layout.css         # Grid layouts, sticky header, split views, responsive media queries
│   ├── components.css     # Editorial cards, KPI blocks, tables, badges, form controls, gauges, forest plot
│   └── map.css            # Leaflet map container, custom fire pins, glow halations, legend card, popups
└── js/
    ├── app.js             # Global status polling (/api/firms-status), toast notifications, shared utils
    ├── map.js             # AtlasMap class, Esri Topo tiles, India boundary GeoJSON, custom fire pins
    ├── overview.js        # Live FIRMS ingestion (/api/live-fires), KPI updates, table ranking, marker sync
    ├── risk.js            # Preset loader (Central, Ghats, Himalaya, Monsoon), /api/forecast runner
    ├── history.js         # Active complexes loader (/api/active-events), /api/historical-replay runner
    └── research.js        # Dynamic research status loader (/api/research-status), forest plot renderer
```

---

## 3. Dedicated Page Walkthroughs

### Page 1: Overview (`/`)
* **Left Intelligence Summary Panel**:
  - Uppercase kicker: `SATELLITE SURVEILLANCE`
  - Editorial serif heading: `India, in focus.`
  - Subtitle: `Past 24 hours • Sovereign Landmass`
  - Large Primary KPI: `ACTIVE HOTSPOTS` ($23$ verified VIIRS 375m thermal anomalies from live feed)
  - Highlighted Featured KPI: `SEVERE DETECTIONS (≥ 50 MW)` ($4$ intense crown fire complexes)
  - Secondary KPIs: `Peak FRP` ($88.5\text{ MW}$) and `Mean FRP` ($32.3\text{ MW}$)
  - Satellite Constellation selector: All VIIRS (Suomi-NPP, NOAA-20, NOAA-21)
  - Active inference backbone badge: LightGBM (39-Feature Multimodal Model)
* **Right Dominant Map Panel**:
  - Dominates viewport width and height ($620\text{px}$)
  - Muted authoritative Esri World Topographic tiles with subtle terrain shading
  - Sovereign India national boundary overlay (Survey of India GeoJSON)
  - Custom fire pin markers with radius scaled to $\sqrt{\text{FRP}}$ and severity color-coding (amber for low, ember orange for moderate, fiery red for high, white-core pulsing red for severe)
  - Map controls: Thermal activity filter, Basemap selector, Zoom (+ / -), and "Reset View"
  - Editorial Map Legend card in bottom-right corner ($< 5\text{ MW}$, $5-20\text{ MW}$, $20-50\text{ MW}$, $\ge 50\text{ MW}$)
* **Bottom Priority Detections Editorial Table**:
  - Ranked by radiative power descending
  - Columns: Rank (`#1`), FRP (`88.5 MW`), Severity (`SEVERE`), Location (`21.854°N, 86.322°E`), Satellite (`SUOMI-NPP VIIRS`), Confidence (`High`), Observed (`14:00 IST`)
  - Click-to-pan interaction: Clicking any row smoothly pans and zooms the map to that fire detection and opens its popup card.

### Page 2: Risk Classifier (`/risk`)
* **Regional Scenario Presets**: Quick one-click chips populating all 39 features:
  - *Central Deciduous (Severe Pre-Monsoon)*: April, $39.5^\circ\text{C}$, $18\%\text{ RH}$, high VPD, antecedent fire
  - *Western Ghats Montane (Moderate Risk)*: March, $32.5^\circ\text{C}$, steep slope, rugged terrain
  - *Himalayan Foothills (Spring Pre-Monsoon)*: May, $31.0^\circ\text{C}$, high elevation, conifer fuel desiccation
  - *Monsoon Southern Peninsula (Minimal Risk)*: July, $25.5^\circ\text{C}$, $82\%\text{ RH}$, saturated soil
* **39-Feature Form**: Clean editorial cards organizing Spatiotemporal Coordinates, Antecedent Meteorology (24h), Multi-Timescale Drying Windows (3d & 7d), Topography (NOAA ETOPO 2022), and Fuel Moisture / Causal Fire History.
* **Results Panel**:
  - Predicted Occurrence Probability ($78.4\%$) with color-coded risk badge (`HIGH RISK`) and progress bar
  - Epistemic uncertainty estimate ($\pm 1.85\%$)
  - Multi-Horizon Comparison list: Diagnostic synchronous occurrence ($T$), forward 24h cell risk ($T+24\text{h}$), forward 48h cell risk ($T+48\text{h}$), and connected-component persistence ($T+24\text{h}$)
  - Transparent callout clarifying why cell ignition forecasting is weak while event persistence is strong.

### Page 3: History & Replay (`/history`)
* **Spatiotemporal Event Complexes Canvas**: Interactive map displaying multi-day fire complexes tracked across contiguous days, with popup cards showing duration, detection count, peak FRP, and active date span.
* **Prospective Historical Replay Station**:
  - Origin date selector across the 2024–2025 test seasons
  - Decision threshold slider ($0.20 - 0.80$, default $0.40$)
  - "Run Retrospective Replay" execution button
  - **Dual-Domain Evaluation Grid**:
    - Candidate-Domain Recall: $66.17\%$ (conditioned on candidate surveillance cells)
    - Full-Spatial Target Accounting: $3.69\%$ (unconstrained nationwide denominator)
    - Macro Precision: $2.35\%$ (aligning with natural $2.32\%$ forward incidence)
    - False Positive Rate: $33.51\%$
  - Spatial Target Confusion Table: Hits ($32$), False alarms ($1,482$), In-domain misses ($16$), Unmonitored outside misses ($847$), Total nationwide confirmed fires ($879$).

### Page 4: Research Benchmarks (`/research`)
* **5 Academic KPI Cards**: Feature Main Effect ($+2.89\%$), Event Persistence ($68.39\%$), Forward Cell Forecast ($53.13\%$), LOGRO Generalization ($64.20\% \pm 0.97\%$), Replay Accounting ($3.69\%$).
* **Controlled 2&times;2 Factorial Section**: Design matrix table (Exp A through D), Factorial effects table, and interactive 95% Bootstrap Confidence Interval Forest Plot.
* **Modality Ablations Matrix**: Stage A (Weather 1d) through Stage E (Full Multimodal 39).
* **LOGRO Spatial Generalization Table**: Cross-regional transfer across Central, Western Ghats, Northeast, North, East, and Northwest.
* **Calibration Protocol Table**: Raw vs. Platt vs. Isotonic reliability comparison.
* **Observational Caveats & Methodology**: Explaining single DEM provenance, 1:1 case-control sampling, and negative label remote-sensing meaning.

---

## 4. Visual Quality Assurance & Screenshot Verification

Screenshots were captured using headless Google Chrome (`--window-size=1600,1050`) directly from the live local Flask server:
1. `docs/screenshots/overview_page.png` (1.09 MB) — Confirms editorial atlas aesthetic, dominant Esri Topo map, glowing fire pins, clean legend, and populated priority detections table.
2. `docs/screenshots/risk_page.png` (236 KB) — Confirms 39-feature form, scenario chips, probability gauge, multi-horizon projections list, and disclosure callout.
3. `docs/screenshots/history_page.png` (760 KB) — Confirms event complexes map, prospective replay simulator, dual-domain recall metrics, and confusion matrix table.
4. `docs/screenshots/research_page.png` (212 KB) — Confirms academic KPI cards, factorial table, forest plot visualization, and modality ablation hierarchy.

All pages adhere to high visual standards, responsive layout guidelines, and zero browser console errors.
