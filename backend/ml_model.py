import csv
from pathlib import Path

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


INVENTORY_FILE = Path(__file__).resolve().parent.parent / "data" / "inventory.csv"
FEATURE_COLUMNS = (
    "current_stock",
    "units_sold_last_30_days",
    "days_in_inventory",
    "price",
    "cost_price",
)
MODEL_NAME = "LogisticRegression"


def _load_inventory() -> list[dict[str, str]]:
    with INVENTORY_FILE.open(mode="r", newline="", encoding="utf-8") as inventory_file:
        return list(csv.DictReader(inventory_file))


inventory_rows = _load_inventory()
feature_values = [
    [float(product[column]) for column in FEATURE_COLUMNS]
    for product in inventory_rows
]

# Label old products with very low recent sales as slow-moving for this demo.
target_values = [
    int(
        int(product["units_sold_last_30_days"]) <= 5
        and int(product["days_in_inventory"]) >= 90
    )
    for product in inventory_rows
]

# Keep examples of both classes in the small test split for basic evaluation.
X_train, X_test, y_train, y_test = train_test_split(
    feature_values,
    target_values,
    test_size=0.33,
    random_state=42,
    stratify=target_values,
)

# Scale different units such as dollars, days, and product counts before training.
model = make_pipeline(
    StandardScaler(),
    LogisticRegression(max_iter=1000, random_state=42),
)
model.fit(X_train, y_train)

test_predictions = model.predict(X_test)
evaluation_metrics = {
    "accuracy": round(accuracy_score(y_test, test_predictions), 3),
    "precision": round(precision_score(y_test, test_predictions, zero_division=0), 3),
    "recall": round(recall_score(y_test, test_predictions, zero_division=0), 3),
}


def predict_slow_moving(product_data: dict[str, object]) -> dict[str, str | int | float]:
    """Predict the slow-moving class and its probability for one product."""
    feature_row = [[float(product_data[column]) for column in FEATURE_COLUMNS]]
    prediction_value = int(model.predict(feature_row)[0])
    probability_index = list(model.classes_).index(1)
    slow_moving_probability = float(model.predict_proba(feature_row)[0][probability_index])

    return {
        "prediction": "slow-moving" if prediction_value == 1 else "not slow-moving",
        "probability": round(slow_moving_probability, 4),
        "model_used": MODEL_NAME,
    }