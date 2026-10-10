import csv
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml_model import predict_slow_moving
from recommendation_engine import get_recommendations

app = FastAPI(title="ReRoute AI Backend")
INVENTORY_FILE = Path(__file__).resolve().parent.parent / "data" / "inventory.csv"


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    
"https://reroute-ihuajnapo-tungapindisheethal-5834s-projects.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        
"https://reroute-ai-sigma.vercel.app",

    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)



@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "ReRoute AI backend is running",
    }


@app.get("/api/recommendations")
def list_recommendations():
    try:
        return get_recommendations()
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate product recommendations.",
        ) from error


@app.get("/api/predict/{product_id}")
def predict_product(product_id: str):
    try:
        with INVENTORY_FILE.open(mode="r", newline="", encoding="utf-8") as inventory_file:
            products = csv.DictReader(inventory_file)
            product = next(
                (row for row in products if row["product_id"] == product_id),
                None,
            )

        if product is None:
            raise HTTPException(status_code=404, detail="Product not found.")

        prediction = predict_slow_moving(product)
        return {
            "product_id": product["product_id"],
            "product_name": product["product_name"],
            **prediction,
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate a slow-moving prediction.",
        ) from error