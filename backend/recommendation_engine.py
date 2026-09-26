import csv
from pathlib import Path


INVENTORY_FILE = Path(__file__).resolve().parent.parent / "data" / "inventory.csv"
SALES_PERIOD_DAYS = 30
MINIMUM_DISCOUNT_MARGIN_PERCENT = 25


def _calculate_metrics(product: dict[str, str]) -> dict[str, int | float | str | None]:
    current_stock = int(product["current_stock"])
    units_sold = int(product["units_sold_last_30_days"])
    inventory_age = int(product["days_in_inventory"])
    price = float(product["price"])
    cost_price = float(product["cost_price"])
    season = product["season"].strip().lower()
    is_seasonal = season not in {"all season", "all-season", "allseason"}

    sales_velocity = units_sold / SALES_PERIOD_DAYS
    stock_to_sales_ratio = current_stock / units_sold if units_sold else None
    gross_margin_percent = ((price - cost_price) / price * 100) if price > 0 else 0

    # Combine sales pressure and age; older seasonal stock gets one extra risk point.
    risk_score = 0
    if stock_to_sales_ratio is None or stock_to_sales_ratio >= 5:
        risk_score += 2
    elif stock_to_sales_ratio >= 3:
        risk_score += 1

    if inventory_age >= 120:
        risk_score += 2
    elif inventory_age >= 60:
        risk_score += 1

    if is_seasonal and inventory_age >= 90:
        risk_score += 1

    if risk_score >= 4:
        risk_level = "High"
    elif risk_score >= 2:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "sales_velocity_units_per_day": round(sales_velocity, 2),
        "stock_to_sales_ratio": round(stock_to_sales_ratio, 2) if stock_to_sales_ratio is not None else None,
        "inventory_age_days": inventory_age,
        "gross_margin_percent": round(gross_margin_percent, 2),
        "estimated_inventory_risk": risk_level,
        "risk_score": risk_score,
    }


def _recommend_product(product: dict[str, str]) -> dict[str, object]:
    metrics = _calculate_metrics(product)
    current_stock = int(product["current_stock"])
    units_sold = int(product["units_sold_last_30_days"])
    inventory_age = metrics["inventory_age_days"]
    stock_to_sales_ratio = metrics["stock_to_sales_ratio"]
    gross_margin_percent = metrics["gross_margin_percent"]
    risk_level = metrics["estimated_inventory_risk"]
    is_seasonal = product["season"].strip().lower() not in {
        "all season",
        "all-season",
        "allseason",
    }

    # Discount older seasonal stock or extreme overstock only when margin allows it.
    is_extremely_overstocked = (
        stock_to_sales_ratio is not None
        and stock_to_sales_ratio >= 10
        and inventory_age >= 120
    )
    if (
        risk_level == "High"
        and gross_margin_percent >= MINIMUM_DISCOUNT_MARGIN_PERCENT
        and (is_seasonal or is_extremely_overstocked)
    ):
        action = "DISCOUNT"
        reason = (
            f"Only {units_sold} units sold in the last 30 days while {current_stock} remain in stock. "
            f"This {'seasonal inventory is aging' if is_seasonal else 'stock is extremely high'}; "
            f"the estimated risk is high, and the {gross_margin_percent:.1f}% gross margin leaves room for a measured discount."
        )
    # Accessories with excess stock can be paired with products customers already buy.
    elif (
        product["category"].strip().lower() == "accessories"
        and inventory_age >= 60
        and (stock_to_sales_ratio is None or stock_to_sales_ratio >= 3)
    ):
        action = "BUNDLE"
        reason = (
            f"Only {units_sold} units sold in the last 30 days while {current_stock} remain in stock. "
            "Bundling this accessory with a faster-moving item may help it sell without reducing its price."
        )
    # This dataset has no destination-store data, so redistribution is a candidate action.
    elif (
        inventory_age >= 90
        and (stock_to_sales_ratio is None or stock_to_sales_ratio >= 4)
    ):
        action = "REDISTRIBUTE"
        reason = (
            f"Only {units_sold} units sold in the last 30 days while {current_stock} remain in stock, "
            f"and the inventory has been held for {inventory_age} days. Moving it to a location with stronger demand may help."
        )
    else:
        action = "HOLD"
        reason = (
            f"{units_sold} units sold in the last 30 days, with {current_stock} remaining after "
            f"{inventory_age} days in inventory. The estimated risk is {risk_level.lower()}, "
            "so current data does not justify a discount, bundle, or move."
        )

    return {
        "product_id": product["product_id"],
        "product_name": product["product_name"],
        "season": product["season"],
        "action": action,
        "reason": reason,
        "metrics": metrics,
    }


def get_recommendations() -> list[dict[str, object]]:
    """Read the inventory CSV and return one explainable action per product."""
    with INVENTORY_FILE.open(mode="r", newline="", encoding="utf-8") as inventory_file:
        products = csv.DictReader(inventory_file)
        return [_recommend_product(product) for product in products]