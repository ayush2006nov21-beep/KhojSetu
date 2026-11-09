import re
from datetime import datetime
from rapidfuzz import fuzz


def _clean(value):
    """Normalize text safely before comparing report fields."""
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9\\s]", " ", value)
    return re.sub(r"\\s+", " ", value).strip()


def calculate_match(lost, found):
    """
    Return a 0-100 similarity score for opposite-type reports.

    This is AI-assisted fuzzy matching (RapidFuzz), not a trained
    machine-learning model. The score is a lead, not proof of ownership.
    """
    lost_name = _clean(lost.get("item_name"))
    found_name = _clean(found.get("item_name"))
    lost_desc = _clean(lost.get("description"))
    found_desc = _clean(found.get("description"))

    lost_text = f"{lost_name} {lost_desc}".strip()
    found_text = f"{found_name} {found_desc}".strip()

    # Compare both the item name and the complete description.
    name_score = fuzz.token_set_ratio(lost_name, found_name) if lost_name and found_name else 0
    detail_score = fuzz.token_set_ratio(lost_text, found_text) if lost_text and found_text else 0
    description_score = (name_score * 0.60) + (detail_score * 0.40)

    lost_category = _clean(lost.get("category"))
    found_category = _clean(found.get("category"))
    if lost_category and lost_category == found_category:
        category_score = 100
    elif not lost_category or not found_category or "other" in (lost_category, found_category):
        category_score = 50
    else:
        category_score = 0

    lost_location = _clean(lost.get("location"))
    found_location = _clean(found.get("location"))
    location_score = (
        fuzz.token_set_ratio(lost_location, found_location)
        if lost_location and found_location else 0
    )

    try:
        date1 = datetime.strptime(str(lost.get("date", "")), "%Y-%m-%d")
        date2 = datetime.strptime(str(found.get("date", "")), "%Y-%m-%d")
        difference = abs((date1 - date2).days)
        date_score = max(0, 100 - difference * 5)
    except (ValueError, TypeError):
        date_score = 0

    final_score = (
        description_score * 0.40
        + category_score * 0.25
        + location_score * 0.20
        + date_score * 0.15
    )
    return round(final_score, 2)
