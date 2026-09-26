# ReRoute AI

AI-Powered Inventory Rescue & Smart Redistribution

ReRoute AI is a local development prototype that helps small clothing shops review inventory and consider explainable actions for products that may be moving slowly.

## Problem

Traditional inventory systems mainly show stock levels and sales history. They often do not clearly suggest what a shop owner should consider doing about slow-moving inventory.

## Solution

ReRoute AI analyzes inventory data and recommends one primary action for each product:

- **DISCOUNT** to encourage a quicker sale.
- **BUNDLE** to pair a slower item with a faster-moving product.
- **REDISTRIBUTE** to flag stock that may suit a different location.
- **HOLD** when current data does not justify another action.

Every recommendation includes a plain-language explanation of **why** the action was selected.

## Key Features

- Executive Summary of products, stock, high-risk items, and products needing action.
- Inventory Recommendations with filters for each action.
- Risk analysis showing risk level, score, sales velocity, stock-to-sales ratio, and inventory age.
- Prototype AI slow-moving prediction with a probability and model name.
- Explainable rule-based recommendation reasons.
- Action Simulator for a discount scenario; outputs are estimates, not guaranteed outcomes.
- React dashboard backed by a FastAPI API.

## How It Works

```text
Inventory CSV
	↓
Recommendation Engine
	↓
Risk Analysis
	↓
FastAPI API
	↓
React Dashboard
	↓
AI Prediction + Action Simulator
```

The rule-based recommendation remains the primary action. The ML prediction is an additional information layer and does not replace that recommendation.

## AI / ML

The current ML component is a demonstration using scikit-learn Logistic Regression. It is trained from the included sample inventory data, which contains **15 demonstration products**. The `slow_moving` training label is generated with a simple heuristic: no more than 5 units sold in the last 30 days and at least 90 days in inventory.

This is not a set of observed business outcomes, and the model has not been validated against real-world sales. Its predictions and evaluation metrics should not be treated as reliable business guidance. More representative, labeled data and stronger validation are needed before operational use.

## Tech Stack

**Frontend:** React, Vite, CSS  
**Backend:** Python, FastAPI  
**Data / ML:** CSV (read with Python's standard-library `csv` module), scikit-learn. Pandas is not currently used by the implementation.

## Project Structure

```text
reroute-ai/
├── backend/
│   ├── main.py
│   ├── recommendation_engine.py
│   ├── ml_model.py
│   └── requirements.txt
├── data/
│   └── inventory.csv
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
└── README.md
```

`backend/main.py` defines the API endpoints, `recommendation_engine.py` calculates rule-based actions and risk metrics, and `ml_model.py` trains and runs the demonstration classifier.

## Installation and Running

### 1. Clone the repository

Replace `<repository-url>` with the URL of the repository:

```bash
git clone <repository-url>
cd reroute-ai
```

### 2. Start the backend

From the repository root, create and activate a Python virtual environment, install the backend requirements, and start FastAPI:

**Windows PowerShell:**

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**macOS / Linux:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Leave this terminal running. The API listens at `http://127.0.0.1:8000`; interactive API documentation is at `http://127.0.0.1:8000/docs`.

### 3. Start the frontend

Open a second terminal at the repository root. Install the locked npm dependencies and start Vite:

```bash
cd frontend
npm ci
npm run dev -- --port 5173
```

Open the local URL printed by Vite, normally `http://localhost:5173`. If using another port, note that the backend's current development CORS allowlist includes ports `5173` and `5175` on `localhost` and `127.0.0.1`.

## API Endpoints

- `GET http://127.0.0.1:8000/api/health` — backend health status.
- `GET http://127.0.0.1:8000/api/recommendations` — rule-based recommendations and risk metrics for all inventory products.
- `GET http://127.0.0.1:8000/api/predict/{product_id}` — prototype slow-moving prediction for one product, such as `GET http://127.0.0.1:8000/api/predict/P001`.

## Limitations

- The CSV has only 15 demonstration products.
- The ML model is a prototype trained against heuristic labels, not validated real-world outcomes.
- Action Simulator values are estimates based on simple assumptions, not guaranteed results.
- Frontend API URLs and CORS origins are configured for local development.
- The project is not production-ready and has not been validated for business use.

## Future Scope

- Train and validate with larger, representative real-world datasets.
- Make the API base URL and deployment CORS origins configurable.
- Add database integration and real-time inventory feeds.
- Strengthen model validation with observed sales outcomes.
- Add a batch prediction endpoint to avoid one request per product.

## Why ReRoute AI?

ReRoute AI goes beyond displaying stock counts: it turns inventory data into explainable actions that help shop owners decide what to consider next.

## Demo

During a local demo, you can:

1. Review the Executive Summary.
2. Filter inventory recommendations by action.
3. Inspect the reason (**WHY**) behind each recommendation.
4. Review risk metrics and the separate AI slow-moving prediction.
5. Select a product and try the discount Action Simulator.
