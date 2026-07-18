"""Payment processing with Razorpay integration."""

from app.config import settings
from typing import Optional


def get_razorpay_client():
    """Get Razorpay client instance (test mode)."""
    if not settings.RAZORPAY_KEY_ID or settings.RAZORPAY_KEY_ID == "rzp_test_REPLACE_ME":
        return None
    import razorpay
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_razorpay_order(amount: float, currency: str = "INR") -> Optional[dict]:
    """Create a Razorpay order."""
    client = get_razorpay_client()
    if not client:
        return {
            "id": f"order_mock_{int(amount * 100)}",
            "amount": int(amount * 100),
            "currency": currency,
            "status": "created",
            "mock": True,
        }

    order_data = {
        "amount": int(amount * 100),  # paise
        "currency": currency,
        "payment_capture": 1,
    }
    return client.order.create(data=order_data)


def verify_razorpay_payment(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """Verify Razorpay payment signature."""
    client = get_razorpay_client()
    if not client:
        return True  # Mock: always succeed

    try:
        import razorpay
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })
        return True
    except Exception:
        return False
