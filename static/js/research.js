/**
 * India Forest Fire Intelligence — Research Dashboard Controller
 * Dynamic academic benchmarks, 2x2 factorial forest plot, and regional generalization tables.
 */

const ResearchPage = {
  async init() {
    try {
      const resp = await fetch('/api/research-status');
      if (!resp.ok) return;
      const data = await resp.json();

      if (data.status === 'success' && data.research_metrics) {
        this.renderMetrics(data.research_metrics);
      }
    } catch (e) {
      console.warn('Research status loading note:', e);
    }
  },

  renderMetrics(metrics) {
    // If dynamic data exists, update tables or forest plot
    if (metrics.bootstrap_intervals) {
      this.renderForestPlot(metrics.bootstrap_intervals);
    }
  },

  renderForestPlot(ciList) {
    const container = document.getElementById('forest-plot-container');
    if (!container || !Array.isArray(ciList)) return;

    // Build visual forest plot rows
    let html = '';
    ciList.slice(0, 4).forEach(item => {
      const obs = item.observed_delta || 0.0;
      const low = item.ci_95_lower || 0.0;
      const high = item.ci_95_upper || 0.0;
      const metric = item.metric || 'roc_auc';

      // Map low and high to percentage coordinates (assuming [-0.02, 0.06] range)
      const scaleMin = -0.01;
      const scaleMax = 0.05;
      const toPct = (val) => Math.max(0, Math.min(100, ((val - scaleMin) / (scaleMax - scaleMin)) * 100));

      const leftPct = toPct(low);
      const rightPct = toPct(high);
      const pointPct = toPct(obs);
      const widthPct = Math.max(2, rightPct - leftPct);

      html += `
        <div class="forest-plot-row">
          <div>
            <div style="font-weight:600;color:var(--text-primary);text-transform:capitalize;">${metric.replace('_', ' ').toUpperCase()}</div>
            <div style="font-size:0.6875rem;color:var(--text-muted);">95% Bootstrap CI</div>
          </div>
          <div class="forest-plot-track">
            <div class="forest-zero-line" style="left:${toPct(0)}%;"></div>
            <div class="forest-ci-bar" style="left:${leftPct}%;width:${widthPct}%;"></div>
            <div class="forest-ci-point" style="left:${pointPct}%;"></div>
          </div>
          <div class="mono" style="text-align:right;font-size:0.75rem;">
            <div style="font-weight:700;color:var(--fire-orange-dark);">${(obs * 100).toFixed(2)}%</div>
            <div style="color:var(--text-muted);">[${(low * 100).toFixed(2)}%, ${(high * 100).toFixed(2)}%]</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('research-view-root')) {
    ResearchPage.init();
  }
});
