import React, { useEffect, useState } from 'react';
import inventoryCsv from '../../data/inventory.csv?raw';
import './styles.css';

const recommendationFilters = ['ALL', 'DISCOUNT', 'BUNDLE', 'REDISTRIBUTE', 'HOLD'];

function getInventoryDetails() {
  const [headerLine, ...productLines] = inventoryCsv.trim().split(/\r?\n/);
  const headers = headerLine.split(',');

  return new Map(productLines.map((line) => {
    const values = line.split(',');
    const product = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

    return [product.product_id, {
      category: product.category,
      currentStock: Number(product.current_stock),
      unitsSoldLast30Days: Number(product.units_sold_last_30_days),
      daysInInventory: Number(product.days_in_inventory),
      currentPrice: Number(product.price),
      costPrice: Number(product.cost_price),
    }];
  }));
}

const inventoryDetailsById = getInventoryDetails();

const steps = [
  {
    number: '01',
    title: 'Analyze',
    description: 'Bring stock levels and recent sales into one clear view.',
    tone: 'mint',
  },
  {
    number: '02',
    title: 'Detect risk',
    description: 'Spot products that may be sitting on the shelf too long.',
    tone: 'peach',
  },
  {
    number: '03',
    title: 'Recommend action',
    description: 'Get a practical next step, with a reason you can understand.',
    tone: 'blue',
  },
];

const actions = [
  {
    name: 'DISCOUNT',
    description: 'Encourage a quicker sale with a considered price drop.',
    symbol: '%',
    tone: 'discount',
  },
  {
    name: 'BUNDLE',
    description: 'Pair a slow seller with a product customers already love.',
    symbol: '+',
    tone: 'bundle',
  },
  {
    name: 'REDISTRIBUTE',
    description: 'Move stock toward a shop or location with stronger demand.',
    symbol: '\u2192',
    tone: 'redistribute',
  },
  {
    name: 'HOLD',
    description: 'Keep the price and stock in place when waiting makes sense.',
    symbol: '\u23f8',
    tone: 'hold',
  },
];

function Logo() {
  return (
    <a className="brand" href="#home" aria-label="ReRoute AI home">
      <span className="brand-mark" aria-hidden="true">R</span>
      <span>ReRoute <strong>AI</strong></span>
    </a>
  );
}


function InventoryPreview({
  recommendations,
  predictions,
  summary,
  totalCount,
  filter,
  onFilterChange,
  isLoading,
  error,
  onRefresh,
}) {

  return (
    <div className="preview-wrap" aria-label="Inventory recommendations">
      <div className="preview-halo" aria-hidden="true" />
      <section className="preview-card">
        <div className="preview-topbar">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span>INVENTORY SNAPSHOT</span>
          <span className="live-label"><i /> {isLoading ? 'LOADING' : error ? 'OFFLINE' : 'LIVE'}</span>
        </div>

        <div className="preview-body">
          <header className="dashboard-product-header">
            <div className="dashboard-product-heading">
              <div>
                <h2 className="dashboard-product-name">ReRoute <strong>AI</strong></h2>
                <p className="dashboard-product-tagline">AI-Powered Inventory Rescue &amp; Smart Redistribution</p>
              </div>
              <span className="ai-intelligence-indicator">
                <i aria-hidden="true" />
                AI Inventory Intelligence
              </span>
            </div>
            <p className="dashboard-product-description">Turn slow-moving inventory into actionable decisions.</p>
          </header>

          <section className="executive-summary" aria-labelledby="executive-summary-title">
            <h3 id="executive-summary-title">Executive Summary</h3>
            <div className="executive-summary-grid">
              <article className="executive-summary-card">
                <span>Total Products</span>
                <strong>{isLoading || error ? '—' : summary.totalProducts}</strong>
              </article>
              <article className="executive-summary-card">
                <span>Total Stock</span>
                <strong>{isLoading || error ? '—' : summary.totalStock}</strong>
              </article>
              <article className="executive-summary-card">
                <span>High-Risk Products</span>
                <strong>{isLoading || error ? '—' : summary.highRiskProducts}</strong>
              </article>
              <article className="executive-summary-card">
                <span>Products Needing Action</span>
                <strong>{isLoading || error ? '—' : summary.productsNeedingAction}</strong>
              </article>
            </div>
          </section>

          
<div className="preview-heading">
  <div>
    <p className="eyebrow">LIVE INVENTORY DATA</p>
    <h2>Inventory Recommendations</h2>
  </div>

  <div className="preview-heading-actions">
    {!isLoading && !error && (
      <span className="preview-count">
        {recommendations.length} / {totalCount}
      </span>
    )}

    <button
      className="refresh-button"
      type="button"
      onClick={onRefresh}
      disabled={isLoading}
    >
      ↻ Refresh
    </button>
  </div>
</div>

          <div className="recommendation-filters" aria-label="Filter recommendations">
            {recommendationFilters.map((option) => (
              <button
                className={filter === option ? 'recommendation-filter active' : 'recommendation-filter'}
                type="button"
                key={option}
                aria-pressed={filter === option}
                onClick={() => onFilterChange(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="preview-message" role="status">Loading recommendations...</p>
          ) : error ? (
            <p className="preview-message preview-error" role="alert">{error}</p>
          ) : recommendations.length === 0 ? (
            <p className="preview-message">No recommendations were returned.</p>
          ) : (
            <ul className="recommendation-list">
              {recommendations.map((product) => {
                const metrics = product.metrics || {};
                const riskLevel = metrics.estimated_inventory_risk || 'Unknown';
                const riskClass = riskLevel.toLowerCase();

                return (
                  <li className="recommendation-item" key={product.product_id}>
                    <div className="recommendation-item-heading">
                      <h3>{product.product_name}</h3>
                      <span className={`recommendation-action ${product.action.toLowerCase()}`}>
                        {product.action}
                      </span>
                    </div>
                    <p className="recommendation-category">{product.category}</p>
                    <div className="recommendation-risk-row">
                      <span className={`risk-level-badge risk-${riskClass}`}>
                        {riskLevel === 'Unknown' ? 'Risk Unknown' : `${riskLevel} Risk`}
                      </span>
                      <span className="risk-score">Risk score <strong>{metrics.risk_score ?? 'N/A'}</strong></span>
                    </div>
                    <div className="recommendation-metrics">
                      <span>Stock <strong>{product.currentStock}</strong></span>
                      <span>Sold / 30d <strong>{product.unitsSoldLast30Days}</strong></span>
                      <span>Sales velocity <strong>{metrics.sales_velocity_units_per_day ?? 'N/A'} / day</strong></span>
                      <span>Stock-to-sales <strong>{metrics.stock_to_sales_ratio ?? 'N/A'}</strong></span>
                      <span>Inventory age <strong>{metrics.inventory_age_days ?? product.daysInInventory}d</strong></span>
                    </div>
                    <div className="recommendation-why">
                      <strong>WHY</strong>
                      <p className="recommendation-reason">{product.reason}</p>
                    </div>
                    <div className="ai-prediction">
                      <div className="ai-prediction-heading">
                        <strong>AI Prediction:</strong>
                        <span>Estimate based on the current prototype dataset</span>
                      </div>
                      {predictions[product.product_id]?.loading ? (
                        <p className="ai-prediction-message">Loading AI prediction...</p>
                      ) : predictions[product.product_id]?.error ? (
                        <p className="ai-prediction-message ai-prediction-error">AI prediction unavailable.</p>
                      ) : predictions[product.product_id]?.data ? (
                        <div className="ai-prediction-result">
                          <span className={`ai-prediction-label ${predictions[product.product_id].data.prediction === 'slow-moving' ? 'slow-moving' : 'not-slow-moving'}`}>
                            {predictions[product.product_id].data.prediction === 'slow-moving' ? 'Slow Moving' : 'Not Slow Moving'}
                          </span>
                          <span>Slow-Moving Probability: {(predictions[product.product_id].data.probability * 100).toFixed(1)}%</span>
                          <span>Model: {predictions[product.product_id].data.model_used}</span>
                        </div>
                      ) : (
                        <p className="ai-prediction-message">AI prediction not available.</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function ActionSimulator({ recommendations, isLoading, error }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('10');
  const [simulation, setSimulation] = useState(null);

  const selectedProduct = recommendations.find((product) => product.product_id === selectedProductId)
    || recommendations[0]
    || null;

  function simulateDiscount() {
    if (!selectedProduct) {
      return;
    }

    const discountRate = Number(discountPercentage) / 100;
    const discountedPrice = selectedProduct.currentPrice * (1 - discountRate);
    const estimatedAdditionalSales = Math.min(
      selectedProduct.currentStock,
      Math.max(1, Math.round(selectedProduct.unitsSoldLast30Days * (1 + discountRate))),
    );

    setSimulation({
      discountedPrice,
      estimatedAdditionalSales,
      estimatedRemainingStock: selectedProduct.currentStock - estimatedAdditionalSales,
      estimatedRevenue: discountedPrice * estimatedAdditionalSales,
    });
  }

  function selectProduct(productId) {
    setSelectedProductId(productId);
    setSimulation(null);
  }

  function selectDiscount(percentage) {
    setDiscountPercentage(percentage);
    setSimulation(null);
  }

  return (
    <section className="simulator-section" id="action-simulator">
      <div className="section-shell">
        <div className="section-heading simulator-heading">
          <div>
            <p className="section-kicker">EXPLORE A WHAT-IF SCENARIO</p>
            <h2>Action Simulator</h2>
          </div>
          <p>See how a discount could affect price and remaining stock before taking action.</p>
        </div>

        {isLoading ? (
          <p className="preview-message" role="status">Loading inventory for the simulator...</p>
        ) : error ? (
          <p className="preview-message preview-error" role="alert">{error}</p>
        ) : selectedProduct ? (
          <div className="simulator-layout">
            <div className="simulator-controls">
              <label className="simulator-field" htmlFor="simulator-product">
                <span>Product</span>
                <select
                  id="simulator-product"
                  value={selectedProduct.product_id}
                  onChange={(event) => selectProduct(event.target.value)}
                >
                  {recommendations.map((product) => (
                    <option value={product.product_id} key={product.product_id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="simulator-product-details">
                <p className="simulator-product-name">{selectedProduct.product_name}</p>
                <div className="simulator-facts">
                  <span>Current stock <strong>{selectedProduct.currentStock}</strong></span>
                  <span>Current price <strong>{selectedProduct.currentPrice.toFixed(2)}</strong></span>
                  <span>Cost price <strong>{selectedProduct.costPrice.toFixed(2)}</strong></span>
                  <span className="simulator-action-fact">
                    Recommended action
                    <strong className={`recommendation-action ${selectedProduct.action.toLowerCase()}`}>
                      {selectedProduct.action}
                    </strong>
                  </span>
                </div>
              </div>

              <label className="simulator-field" htmlFor="simulator-discount">
                <span>Discount</span>
                <select
                  id="simulator-discount"
                  value={discountPercentage}
                  onChange={(event) => selectDiscount(event.target.value)}
                >
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                  <option value="30">30%</option>
                </select>
              </label>

              <button className="button button-dark simulator-button" type="button" onClick={simulateDiscount}>
                Simulate Discount
              </button>
            </div>

            <div className="simulator-results" aria-live="polite">
              {simulation ? (
                <>
                  <p className="simulator-estimate-label">ESTIMATE — not a guaranteed outcome</p>
                  <div className="simulator-result-grid">
                    <div><span>Discounted price</span><strong>{simulation.discountedPrice.toFixed(2)}</strong></div>
                    <div><span>Estimated additional sales</span><strong>{simulation.estimatedAdditionalSales} units</strong></div>
                    <div><span>Estimated remaining stock</span><strong>{simulation.estimatedRemainingStock} units</strong></div>
                    <div><span>Estimated revenue</span><strong>{simulation.estimatedRevenue.toFixed(2)}</strong></div>
                  </div>
                  <p className="simulator-calculation">
                    Price applies the selected discount. Estimated sales scale last-30-day sales by the same percentage and are capped at current stock. Revenue is discounted price multiplied by estimated sales.
                  </p>
                </>
              ) : (
                <p className="simulator-placeholder">Choose a product and discount, then run the simulation to see the estimate.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="preview-message">No inventory recommendations are available to simulate.</p>
        )}
      </div>
    </section>
  );
}

function App() {
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [recommendations, setRecommendations] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState('ALL');

  const filteredRecommendations = recommendationFilter === 'ALL'
    ? recommendations
    : recommendations.filter((product) => product.action === recommendationFilter);

  const executiveSummary = {
    totalProducts: recommendations.length,
    totalStock: recommendations.reduce((total, product) => {
      const stock = Number(product.currentStock);
      return total + (Number.isFinite(stock) ? stock : 0);
    }, 0),
    highRiskProducts: recommendations.filter(
      (product) => product.metrics?.estimated_inventory_risk === 'High',
    ).length,
    productsNeedingAction: recommendations.filter(
      (product) => ['DISCOUNT', 'BUNDLE', 'REDISTRIBUTE'].includes(product.action),
    ).length,
  };

  
  function refreshInventory() {
    setRecommendationsLoading(true);
    setRecommendationsError('');
    setRefreshKey((current) => current + 1);
  }

  ```javascript
useEffect(() => {
  let isActive = true;

  function checkBackendHealth() {
    fetch('https://reroute-ai-backend.onrender.com/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend health check failed.');
        }
        return response.json();
      })
      .then((data) => {
        if (!isActive) return;

        if (data.status === 'ok') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => {
        if (!isActive) return;
        setBackendStatus('offline');
      });
  }

  checkBackendHealth();

  return () => {
    isActive = false;
  };
}, []);
```

  useEffect(() => {
    let retryTimer;
    let isActive = true;

    function loadRecommendations() {
      
fetch('https://reroute-ai-backend.onrender.com/api/recommendations')

        .then((response) => {
          if (!response.ok) {
            throw new Error('The recommendations request failed.');
          }
          return response.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            throw new Error('The recommendations response was not a list.');
          }
          const enrichedRecommendations = data.map((product) => {
            const inventoryDetails = inventoryDetailsById.get(product.product_id) || {};

            return {
              ...product,
              category: product.category || inventoryDetails.category || 'Uncategorized',
              currentStock: product.current_stock ?? inventoryDetails.currentStock ?? 'Not available',
              unitsSoldLast30Days: product.units_sold_last_30_days ?? inventoryDetails.unitsSoldLast30Days ?? 'Not available',
              daysInInventory: product.metrics?.inventory_age_days ?? inventoryDetails.daysInInventory ?? 'Not available',
              currentPrice: product.current_price ?? product.price ?? inventoryDetails.currentPrice ?? 0,
              costPrice: product.cost_price ?? inventoryDetails.costPrice ?? 0,
            };
          });

          if (isActive) {
            setRecommendations(enrichedRecommendations);
            setRecommendationsError('');
          }
        })
        .catch(() => {
          if (isActive) {
            setRecommendationsError('Could not load recommendations. Check that the backend is running and refresh the page.');
            retryTimer = window.setTimeout(loadRecommendations, 5000);
          }
        })
        .finally(() => {
          if (isActive) {
            setRecommendationsLoading(false);
          }
        });
    }

    loadRecommendations();

    return () => {
      isActive = false;
      window.clearTimeout(retryTimer);
    };
   }, [refreshKey]);

  useEffect(() => {
    if (recommendations.length === 0) {
      return undefined;
    }

    const controller = new AbortController();
    setPredictions(Object.fromEntries(
      recommendations.map((product) => [product.product_id, { loading: true }]),
    ));

    Promise.all(recommendations.map(async (product) => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/predict/${encodeURIComponent(product.product_id)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('The prediction request failed.');
        }

        const data = await response.json();
        return [product.product_id, { data }];
      } catch (error) {
        if (error.name === 'AbortError') {
          return [product.product_id, { loading: true }];
        }
        return [product.product_id, { error: true }];
      }
    })).then((predictionEntries) => {
      if (!controller.signal.aborted) {
        setPredictions(Object.fromEntries(predictionEntries));
      }
    });

    return () => controller.abort();
  }, [recommendations]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav className="main-nav" aria-label="Main navigation">
            <a className="active" href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </nav>
          <a className="button button-small button-dark" href="#how-it-works">Get Started <span aria-hidden="true">{'\u2197'}</span></a>
        </div>
      </header>

      <main>
        <section className="hero section-shell" id="home">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="kicker-mark" aria-hidden="true">↗</span>
              INVENTORY, REROUTED
              <span className={`backend-status ${backendStatus}`} role="status" aria-live="polite">
                <i className="backend-status-dot" aria-hidden="true" />
                {backendStatus === 'connected' ? 'Backend Connected' : backendStatus === 'offline' ? 'Backend Offline' : 'Checking Backend'}
              </span>
            </div>
            <h1>Turn Slow-Moving Inventory Into <em>Smart Decisions.</em></h1>
            <p className="hero-description">ReRoute AI analyzes inventory and sales patterns to help shop owners decide whether to Discount, Bundle, Redistribute, or Hold their stock.</p>
            <div className="hero-buttons">
              <a className="button button-dark" href="#actions">Analyze Inventory <span aria-hidden="true">{'\u2192'}</span></a>
              <a className="button button-light" href="#how-it-works"><span className="play-icon" aria-hidden="true">{'\u25b6'}</span> See How It Works</a>
            </div>
            <div className="hero-footnote"><span className="footnote-line" /> Clear recommendations. Reasons included.</div>
          </div>
          <InventoryPreview
          onRefresh={refreshInventory}
            recommendations={filteredRecommendations}
            predictions={predictions}
            summary={executiveSummary}
            totalCount={recommendations.length}
            filter={recommendationFilter}
            onFilterChange={setRecommendationFilter}
            isLoading={recommendationsLoading}
            error={recommendationsError}
          />
        </section>

        <ActionSimulator
          recommendations={recommendations}
          isLoading={recommendationsLoading}
          error={recommendationsError}
        />

        <section className="how-section section-shell" id="how-it-works">
          <div className="section-heading">
            <div>
              <p className="section-kicker">A BETTER NEXT STEP</p>
              <h2>From shelf to smart move.</h2>
            </div>
            <p>Less guesswork for the products that need a little attention.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-item" key={step.number}>
                <div className={`step-number ${step.tone}`}>{step.number}</div>
                <div className="step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <span className="step-rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="actions-section" id="actions">
          <div className="section-shell">
            <div className="section-heading actions-heading">
              <div>
                <p className="section-kicker">FOUR WAYS FORWARD</p>
                <h2>Every product has a next move.</h2>
              </div>
              <p>Recommendations come with a reason, so you stay in control.</p>
            </div>
            <div className="actions-grid">
              {actions.map((action) => (
                <article className="action-card" key={action.name}>
                  <span className={`action-symbol ${action.tone}`} aria-hidden="true">{action.symbol}</span>
                  <h3>{action.name}</h3>
                  <p>{action.description}</p>
                  <span className="action-card-line" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="about">
        <div className="footer-inner">
          <div>
            <Logo />
            <p>AI-powered inventory rescue and smart redistribution.</p>
          </div>
          <span className="footer-note">A smarter route for the stock you already have.</span>
        </div>
      </footer>
    </>
  );
}

export default App;
