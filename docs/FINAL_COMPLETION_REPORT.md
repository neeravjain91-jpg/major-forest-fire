# Major Project Final Completion & Scientific Freeze Report

**Project Title**: Event-Centric Multimodal Spatiotemporal Wildfire Intelligence for India  
**Repository**: `neeravjain91-jpg/major-forest-fire`  
**Execution Timestamp**: 2026-10-05T16:40:00+05:30  
**Status**: Scientifically Audited, Empirically Validated, Interface Polished, Frozen for Publication & Viva  

---

## 1. Executive Summary

This completion pass marks the formal scientific freeze of the Major Wildfire Intelligence research project. All lingering methodological contradictions, synthetic imputation remnants, terminology misattributions, and UI legacy artifacts have been systematically resolved and verified against untouched test data (2024–2025, $N = 31,525$).

The codebase now operates under strict reproducible protocols:
1. **Event Linkage Invariant**: Exactly one authoritative spatial linkage threshold ($\le 25.0\,\text{km}$, $\Delta t \le 2\,\text{days}$) is enforced across code, sensitivity benchmarks, unit tests, and documentation.
2. **Algorithmic Terminology**: Correctly designated as *"Threshold-based spatiotemporal connected-component event tracking"* rather than "DBSCAN-ST".
3. **Validation-Locked Calibration**: Calibrator selection (Raw vs. Platt vs. Isotonic) is programmatically locked on chronological validation data (2023, $N = 14,814$) via pre-declared minimum validation Brier score prior to touching the test set.
4. **Discrimination vs. Calibration Separation**: Ranking discrimination (ROC-AUC, PR-AUC) is evaluated strictly on raw model outputs across all ablation experiments, with probability calibration evaluated and reported as a distinct diagnostic.
5. **Replay Fail-Closed Integrity**: Zero synthetic fallback imputation exists. Candidate-domain prospective surveillance recall ($66.17\%$) is mathematically separated from nationwide full-target accounting ($3.69\%$).
6. **Editorial Atlas UI**: Clean, responsive, multi-page platform inspired by cartographic publishing aesthetics (warm paper `#fcfbf7`, charcoal `#1c1917`, Newsreader headings, unwatermarked Esri World Topographic maps).
7. **Test Verification**: 60 passed unit and integration tests (60/60 passing).

---

## 2. Scientific Fixes & Algorithmic Corrections

### A. Authoritative Event Clustering Threshold ($\Delta d \le 25.0\,\text{km}$)
- **Audit**: Historical working notes occasionally referenced $5\,\text{km}$. At the $0.10^\circ \times 0.10^\circ$ (~$11.1\,\text{km}$) gridding of Indian active fires, a $5\,\text{km}$ radius is smaller than a single grid-cell diagonal ($15.5\,\text{km}$), which artificially fragments contiguous fire fronts into disjoint single-cell pseudo-events.
- **Correction**: Reconciled and locked the threshold to $25.0\,\text{km}$ with a 2-day temporal gap ($\Delta t \le 2\,\text{days}$).
- **Evidence**: Supported by the systematic sensitivity analysis (`data/events/clustering_sensitivity.csv`), where $25\,\text{km}$ and 2 days yielded the optimal balance between complex consolidation and cluster stability ($45,933$ unique events constructed).
- **Enforcement**: Added unit test `test_authoritative_event_clustering_threshold_is_25km` verifying function signatures and linkage logic.

### B. Terminology Purge: Connected-Component Tracking
- Replaced all active references to "DBSCAN" and "DBSCAN-ST" across source code, docstrings, UI, and `reports/literature_matrix.csv`.
- The method is canonically described as: **"Threshold-based spatiotemporal connected-component event tracking"**.

### C. Validation-Locked Post-Hoc Calibration
- **Implementation**: Created `select_validation_locked_calibrator` in `src/evaluation/calibration.py`.
- **Protocol**:
  $$\text{Selected Calibrator} = \arg\min_{m \in \{\text{raw}, \text{platt}, \text{isotonic}\}} \text{Brier}_{\text{val}}(m)$$
  The winning calibrator is locked on validation data ($2023$) and evaluated exactly once on untouched test data ($2024\text{--}2025$).
- **Recorded Artifacts**: `baseline_comparison_metrics.csv` and `calibration_comparison.csv` now record `selected_calibration_method`, `val_brier_raw`, `val_brier_platt`, and `val_brier_isotonic`.

### D. Separation of Discrimination and Calibration in Ablation Study
- In `src/models/ablation_study.py`, changed the ablation methodology to record:
  - Raw uncalibrated ranking discrimination: `raw_roc_auc`, `raw_pr_auc`, `raw_brier_score`, `raw_ece`.
  - Validation-locked calibrated metrics: `cal_roc_auc`, `cal_pr_auc`, `cal_brier_score`, `cal_ece`, `selected_calibration_method`.
- Validated via unit test `test_discrimination_ablation_stores_raw_ranking`.

---

## 3. Authoritative Experimental Results

### A. Controlled 2×2 Factorial Analysis (Test Set 2024–2025, $N = 31,525$)

| Cell ID | Model Family | Modality / Features | Test ROC-AUC | Test PR-AUC | Test Brier Score | Selected Calibration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Exp A** | HistGradientBoosting | 31 Features (Baseline) | **59.08%** | **57.36%** | **0.2425** | Raw / Platt locked |
| **Exp B** | HistGradientBoosting | 39 Features (Multimodal) | **61.79%** | **60.57%** | **0.2381** | Raw / Platt locked |
| **Exp C** | LightGBM | 31 Features (Baseline) | **59.25%** | **57.73%** | **0.2422** | Platt locked |
| **Exp D** | **LightGBM (Primary Major)** | **39 Features (Multimodal)** | **62.31%** | **61.14%** | **0.2371** | Platt locked |

### B. Factorial Main & Interaction Effects (Paired Bootstrap $B = 1,000$)

| Effect Component | Metric | Observed Delta | 95% Bootstrap CI | Zero Excluded? | Scientific Interpretation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Feature Main Effect** | ROC-AUC | **+2.83%** | **[+2.33%, +3.29%]** | **YES** | Multimodality significantly enhances discrimination. |
| **Feature Main Effect** | PR-AUC | **+3.04%** | **[+2.52%, +3.60%]** | **YES** | Multimodal features improve positive precision. |
| **Feature Main Effect** | Brier Score | **-0.0047** | **[-0.0055, -0.0038]** | **YES** | Significant reduction in calibration probability error. |
| **Model Main Effect** | ROC-AUC | **+0.33%** | **[+0.09%, +0.55%]** | **YES** | LightGBM yields slight advantage over HGB. |
| **Factorial Interaction** | ROC-AUC | **+0.24%** | **[-0.13%, +0.64%]** | **NO** | Crosses zero: feature gain is consistent across families. |
| **Factorial Interaction** | PR-AUC | **+0.21%** | **[-0.17%, +0.59%]** | **NO** | Crosses zero: no family-specific discrimination synergy. |
| **Factorial Interaction** | Brier Score | **-0.0006** | **[-0.0013, 0.0000]** | Borderline | Marginal probability calibration refinement. |

### C. Modality Ablation Matrix (Pure Raw Discrimination)

| Ablation Stage | Features Included | Count | Raw ROC-AUC | Raw PR-AUC | Raw Brier | Raw ECE |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage A** | Instantaneous 1-Day Weather | 6 | 56.29% | 54.76% | 0.2458 | 0.0087 |
| **Stage B** | Multi-Timescale Weather (1d + 3d + 7d) | 26 | 57.87% | 56.41% | 0.2443 | 0.0061 |
| **Stage C** | Weather + Causal Fire History | 28 | 60.54% | 59.71% | 0.2403 | 0.0184 |
| **Stage D** | Weather + Terrain & Fuel Dryness (VPD) | 32 | 57.98% | 56.34% | 0.2442 | 0.0064 |
| **Stage E** | **Full Multimodal Integration** | **39** | **62.31%** | **61.14%** | **0.2371** | **0.0150** |

---

## 4. UI Architecture & Verification

The legacy monolithic template (`templates/index.html`) has been purged. The application is served by four dedicated, modular views:
1. `GET /` — **Overview**: Live NASA FIRMS VIIRS satellite surveillance, national KPI summary, unwatermarked Esri World Topographic map with FRP-scaled fire markers, and interactive priority detections table.
2. `GET /risk` — **Risk Classifier**: Interactive 39-feature diagnostic and multi-horizon inference form with illustrative regional scenario presets.
3. `GET /history` — **Historical Replay**: Active spatiotemporal complexes map and prospective historical replay simulation with explicit dual-domain recall disclosure.
4. `GET /research` — **Research Benchmarks**: Comprehensive peer-review dossier with $2\times2$ factorial interaction metrics, visual $95\%$ CI forest plot, modality ablation breakdown, and LOGRO generalization curves.

### Visual Quality Assurance
Fresh browser screenshots captured via headless Chrome:
- `docs/screenshots/overview_page.png` (774 KB)
- `docs/screenshots/risk_page.png` (150 KB)
- `docs/screenshots/history_page.png` (557 KB)
- `docs/screenshots/research_page.png` (161 KB)

---

## 5. Automated Verification Summary

- **Pytest Suite**: 60 passed / 60 total in 8.28s (`pytest tests/ -v`).
- **Smoke Tests**: 8/8 API endpoints and 4/4 web views verified with HTTP 200 responses.
- **Repository Hygiene**: Zero hardcoded personal paths, zero leaked credentials, zero synthetic fallbacks.

---

## 6. Disclosed Scientific Limitations

1. **Unconstrained Cell-Level Forecasting**: Next-day ($T+24\text{h}$) fire ignition prediction across arbitrary unburned cells from meteorology and topography alone achieves an ROC-AUC of $53.13\%$. Without high-resolution real-time human ignition telemetry (roads, agricultural burning schedules, power lines), pure cell forecasting remains close to random guessing.
2. **Event Persistence vs. Ignition**: In contrast, active event complexes exhibit strong persistence ($68.39\%$ ROC-AUC, $18.0\%$ Top-100 Precision, $2.6\times$ natural prevalence). Operational intelligence should focus on event tracking and complex growth rather than unconstrained point ignition.
3. **Replay Candidate Domain**: Prospective spatial replay verifies candidate surveillance cells ($66.17\%$ candidate recall). Nationwide full-target accounting ($3.69\%$) reflects the fact that unmonitored cells without antecedent detection cannot be captured in a candidate-restricted design.
