# Scientific Validation Report: Major Wildfire Intelligence Framework

**Repository**: `neeravjain91-jpg/major-forest-fire`  
**Audit Date**: October 2026  
**Auditor**: Senior Wildfire Research & Geospatial ML Auditor  
**Verification Target**: Event-Centric Multimodal Spatiotemporal Wildfire Intelligence for Sovereign India  

---

## 1. Executive Summary & Audit Mandate

This scientific audit and validation pass establishes rigorous empirical integrity across the Major Wildfire Intelligence project. The Major project fundamentally decouples from the static 31-feature mini-project baseline by integrating:
1. Multi-timescale atmospheric drying dynamics (ERA5-Land 24h, 72h, 168h windows);
2. Authoritative digital elevation geomorphology (**NOAA ETOPO 2022 Global Relief Model**, embedding NASA SRTM v3.0);
3. Topographic derivatives (canonical 3x3 Horn slope and Riley 8-neighbor TRI);
4. Environmental fuel moisture desiccation proxies (3-day VPD proxy and topsoil drought index);
5. Strictly causal time-indexed fire history ($t < T$);
6. Threshold-based spatiotemporal connected-component event tracking and event persistence targets;
7. Leave-One-Geographic-Regime-Out (LOGRO) spatial cross-validation across six predefined geographic fire regimes;
8. Formal probability calibration comparison (Raw vs. Platt vs. Isotonic);
9. Dual-domain prospective historical replay verification distinguishing candidate surveillance recall from nationwide target accounting.

---

## 2. Core Scientific Corrections & Implementations

### A. Spatiotemporal Event Clustering Terminology
* **Audit Finding**: Previous documentation referenced "DBSCAN-ST", whereas the underlying implementation is an exact breadth-first connected-component traversal with fixed spatial ($\le 25\text{ km}$) and temporal ($\le 2\text{ days}$) thresholds.
* **Correction Implemented**: Replaced all instances of "DBSCAN-ST" across source code (`src/events/event_clustering.py`), docstrings, documentation (`README.md`, `docs/RESEARCH_QUESTIONS.md`, `docs/MAJOR_PROJECT_ARCHITECTURE.md`), and UI with:
  > *"Threshold-based spatiotemporal connected-component event tracking"*.
* **Validation**: Zero references to DBSCAN remain in active research code or documentation.

### B. Fail-Closed Historical Replay (Elimination of Synthetic Fallbacks)
* **Audit Finding**: `src/replay/historical_replay.py` previously contained silent default value assignments (e.g., `elevation = 350`, `slope = 0.5`, `TRI = 50`, `VPD = 2.0`, `soil drought = 0.4`, `fire recurrence = 0.1`) if columns were missing from input candidate observations.
* **Correction Implemented**: Removed all silent fallback imputations. Implemented strict **fail-closed policy**:
  ```python
  missing_features = [feat for feat in features_to_use if feat not in origin_obs.columns]
  if missing_features:
      raise ValueError(
          f"Fail-closed scientific integrity policy: Required feature(s) {missing_features} "
          f"are missing from candidate observations for date {t_date.strftime('%Y-%m-%d')}. "
          "Synthetic fallbacks are strictly prohibited in scientific evaluation."
      )
  ```
* **Validation**: Added unit test `test_replay_fails_closed_without_synthetic_fallbacks` in `tests/test_wildfire_research.py`. Synthetic fallbacks are mathematically impossible in scientific replay runs.

### C. Validation-Locked Probability Calibration Protocol
* **Audit Finding**: In early iterations, calibration selection risked test-set snooping or conflating ECE with Brier score.
* **Protocol Enforced**:
  1. **Training Partition**: 2018–2022 ($N = 84,661$).
  2. **Validation Partition**: 2023 ($N = 14,814$). Model generates validation probabilities; Raw, Platt, and Isotonic calibrators are fitted and evaluated on 2023 data only under the predefined criterion: **minimize validation Brier score**.
  3. **Locked Calibrator**: Parametric Platt scaling selected on validation; locked without modification.
  4. **Single Test Evaluation**: Evaluated once on untouched held-out test data (2024–2025, $N = 31,525$).
  5. **Separation of Metrics**: Ranking discrimination (ROC-AUC, PR-AUC) evaluated on raw probabilities; probability calibration (Brier score, ECE, MCE) evaluated separately.

### D. Hypothesis Target Alignment (H1 & H2)
* **Hypothesis 1 (H1)**: Updated wording to explicitly formulate H1 as synchronous multi-timescale meteorological modulation classification, while transparently disclosing that forward lead cell forecasting ($T+24\text{h}$, $T+48\text{h}$) is near-random without persistent fire state.
* **Hypothesis 2 (H2)**: Reframed strictly as:
  > *"Event persistence is a substantially more predictable forward target than arbitrary next-day cell occurrence."*
  Supported by $68.39\%$ ROC-AUC and $18.0\%$ Top-100 Precision ($2.6\times$ baseline prevalence) for persistence, compared to $53.13\%$ for forward cell ignition.

### E. Dependence-Aware Block Bootstrap Resampling
* **Audit Finding**: Standard row-level bootstrap assumes independent observations, which may underestimate standard errors under spatiotemporal clustering.
* **Correction Implemented**: Implemented `compute_block_bootstrap_confidence_interval` in `src/evaluation/statistical_testing.py`. Resamples observation blocks (e.g., date groups or spatial tiles) with replacement.
* **Validation**: Unit test `test_block_bootstrap_confidence_interval` added to `tests/test_wildfire_research.py`.

### F. Topographic Provenance & Derivative Verification
* **Data Source**: NOAA ETOPO 2022 Global Relief Model (Version 1, 15 arc-second grid), embedding NASA SRTM v3.0 over land.
* **Derivatives**:
  - Slope: Canonical 3x3 weighted finite-difference gradient (Horn, 1981).
  - Ruggedness: Riley et al. (1999) Topographic Ruggedness Index across 8 spatial neighbors.
* **Validation**: Verified against reference coordinates (Shimla, New Delhi, Mumbai, Bengaluru) in `test_real_dem_elevation_derivatives`.

### G. Retrospective Sampling & Label Interpretation Caveats
* **Sampling Design**: Retrospective 1:1 case-control balanced sample ($P(Y=1) = 0.50$ at $T$). Model probabilities reflect sample odds, not nationwide incidence ($< 0.05\%$ per cell daily).
* **Negative Label ($Y=0$)**: Denotes absence of confirmed VIIRS thermal detection under satellite orbital and cloud constraints, not guaranteed absence of ground combustion.

### H. Dual-Domain Replay Accounting
* **Candidate-Domain Recall**: $66.17\%$ (conditioned on candidate surveillance cells active at $T$).
* **Full-Spatial Target Accounting**: $3.69\%$ (unconstrained nationwide denominator of all active fires across sovereign India at $T+1\text{d}$).
* **Policy**: Both metrics are explicitly reported side-by-side; candidate recall is never misrepresented as nationwide full-grid prediction.

---

## 3. Authoritative Result Matrix (Verified Test Set 2024–2025)

| Experiment / Horizon | Model Architecture | Features | ROC-AUC | PR-AUC | Brier Score | ECE | Status / Inference |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Exp A (Baseline)** | HistGradientBoosting | 31 | 59.08% | 57.36% | 0.2425 | 0.0092 | Mini-project baseline |
| **Exp B (Multimodal)** | HistGradientBoosting | 39 | 61.79% | 60.57% | 0.2381 | 0.0132 | Multimodal tree extension |
| **Exp C (LGBM Baseline)** | LightGBM | 31 | 59.25% | 57.73% | 0.2422 | 0.0088 | Algorithm comparison |
| **Exp D (Primary Major)** | **LightGBM (Multimodal)** | **39** | **62.31%** | **61.14%** | **0.2371** | **0.0143** | Primary Major Model |
| **Feature Main Effect** | Factorial Difference | &Delta; 8 feats | **+2.89%** | **+3.31%** | **-0.0047** | &mdash; | 95% CI: [+2.40%, +3.35%] (Significant) |
| **Model Main Effect** | Factorial Difference | LGBM - HGB | **+0.35%** | **+0.47%** | **-0.0007** | &mdash; | 95% CI: [+0.10%, +0.56%] (Significant) |
| **Factorial Interaction** | (D-C) - (B-A) | Interaction | +0.35% | +0.19% | **-0.0008** | &mdash; | Crosses zero for AUC; Brier sig. |
| **LOGRO Spatial Mean** | LightGBM 39 Across 6 Regimes | 39 | **64.20%** | **63.02%** | **0.2349** | 0.0309 | Cuts cross-regional variance in half |
| **Forward T+24h** | LightGBM 39 (Next-Day) | 39 | 53.13% | 2.57% | 0.0227 | 0.0027 | Near-random cell ignition |
| **Forward T+48h** | LightGBM 39 (Two-Day) | 39 | 54.55% | 2.98% | 0.0251 | 0.0001 | Near-random cell ignition |
| **Event Persistence 24h** | Connected Complex Continuity | 39 | **68.39%** | **11.90%** | **0.0625** | 0.0065 | 18.0% Top-100 Precision (2.6&times; base) |
| **Historical Replay** | Prospective Verification | 39 | &mdash; | 2.35% Prec | &mdash; | 33.5% FPR | 66.17% Cand Recall vs 3.69% Full |

---

## 4. Test Suite Verification

The complete automated verification test suite passes with zero errors:
- **Total Test Cases**: 57 passed (including all scientific verification, boundary geometry, dataset schema, FIRMS telemetry, inference, API routes, fail-closed replay, and block bootstrap tests).
- **Execution Command**: `python -m pytest tests/ -v`

---

## 5. Limitations & Future Directions

1. **Cell-Level Forward Forecasting Limitation**: Forecasting new cell ignitions 24–48 hours in advance strictly from synoptic meteorology and topography yields an ROC-AUC of $53.13\%$. Operational forward ignition prediction requires real-time human activity, road proximity, land-cover dynamics, and lightning telemetry.
2. **Epistemic Uncertainty Tracking**: Monte Carlo Dropout standard deviation exhibited a weak negative correlation ($r_s = -0.1355$) with classification error, establishing that dropout variance alone without spatial distance-to-support bounds is insufficient as an error detector.
3. **Orbital Coverage Constraints**: VIIRS provides two daytime/nighttime overpasses daily. Fires igniting and extinguishing between overpasses remain unobserved.
