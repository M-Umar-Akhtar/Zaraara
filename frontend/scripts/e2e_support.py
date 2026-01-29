import json
import sys
from urllib.parse import urlencode

import requests

BASE_URL = "http://localhost:4000/api"


def call(path, method="GET", token=None, payload=None, params=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    response = requests.request(method, f"{BASE_URL}{path}", headers=headers, json=payload, params=params, timeout=5)
    if not response.ok:
        raise SystemExit(f"{method} {path} failed: {response.status_code} {response.text}")
    return response.json()


def main():
    print("1) Creating guest order via POST /orders")
    order_body = {
        "customer": {
            "name": "Test Shopper",
            "email": "testshopper@example.com",
            "phone": "+1-555-0100",
        },
        "shippingAddress": {
            "line1": "742 Evergreen Terrace",
            "city": "Springfield",
            "postalCode": "49007",
            "countryCode": "US",
        },
        "items": [
            {
                "productId": 1,
                "quantity": 2,
            },
        ],
    }
    order_payload = call("/orders", method="POST", payload=order_body)
    order = order_payload["order"]
    print(f"  -> Created order {order['orderNumber']} (${order['total'] / 100:.2f})")

    print("2) Fetching order confirmation")
    confirm = call(f"/orders/{order['orderNumber']}", params={"email": order["customerEmail"]})
    print(f"  -> Confirmation retrieval status {confirm['order']['status']}")

    print("3) Logging in support user")
    login = call("/auth/login", method="POST", payload={"email": "support@techfy.local", "password": "Support123!"})
    token = login["token"]
    print("  -> JWT retrieved")

    print("4) Lookup order via support endpoint")
    lookup = call("/support/orders/lookup", token=token, params={"orderNumber": order["orderNumber"], "email": order["customerEmail"]})
    print(f"  -> Lookup order {lookup['order']['orderNumber']} items={len(lookup['order']['items'])}")

    print("5) Update shipping address")
    address_payload = {
        "shippingAddress": {
            "line1": "221B Baker Street",
            "city": "London",
            "postalCode": "NW1 6XE",
            "countryCode": "GB",
        },
        "reason": "Customer moved",
    }
    address_result = call(f"/support/orders/{order['orderNumber']}/address", method="PATCH", token=token, payload=address_payload)
    print(f"  -> Address updated {address_result['order']['shipLine1']} label={address_result.get('warehouse', {}).get('labelId')}")

    print("6) Push status to SHIPPED")
    status_result = call(
        f"/support/orders/{order['orderNumber']}/status",
        method="PATCH",
        token=token,
        payload={"status": "SHIPPED", "reason": "Packed"},
    )
    print(f"  -> Status now {status_result['order']['status']}")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.RequestException as exc:
        print("Request failed", str(exc))
        sys.exit(1)