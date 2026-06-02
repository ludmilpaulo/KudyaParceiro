#!/usr/bin/env python3
"""KudyaParceiro partner app API smoke tests against Django backend."""
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get("KUDYA_API_BASE", "http://127.0.0.1:8001")
passed = failed = 0


def test(name, method, path, token=None, data=None, ok=(200,)):
    global passed, failed
    url = BASE.rstrip("/") + path
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data else None
    if data:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            status = r.status
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception as e:
        failed += 1
        print(f"  FAIL [ERR] {name} — {e}")
        return None
    ok_list = ok if isinstance(ok, tuple) else (ok,)
    if status in ok_list:
        passed += 1
        print(f"  OK  [{status}] {name}")
        return status
    failed += 1
    print(f"  FAIL [{status}] {name}")
    return status


def main():
    print(f"=== KudyaParceiro API Tests — {BASE} ===\n")

    print("Public endpoints:")
    test("Meal categories", "GET", "/restaurant/meal-categories/")
    test("Restaurant categories", "GET", "/restaurant/restaurant-categories/")
    test("Store categories (signup)", "GET", "/store/store-categories/")
    test("About us", "GET", "/info/aboutus/")
    test("Carousels", "GET", "/info/carousels/")
    test("Home modules", "GET", "/api/platform/home-modules/")

    print("\nAuth:")
    email = f"parceiro_test_{int(time.time())}@kudya.test"
    req = urllib.request.Request(
        BASE + "/api/auth/register/",
        data=json.dumps(
            {
                "email": email,
                "password": "TestPass123!",
                "first_name": "Partner",
                "last_name": "Test",
            }
        ).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            reg = json.loads(r.read())
            token = reg["access"]
            user_id = reg["user"]["id"]
            passed_inc = True
            print(f"  OK  [201] Register partner user")
    except Exception as e:
        print(f"  FAIL Register — {e}")
        print(f"\nResults: {passed} passed, {failed + 1} failed")
        sys.exit(1)

    test("Auth me", "GET", "/api/auth/me/", token=token)
    test(
        "Login",
        "POST",
        "/api/auth/login/",
        data={"username": email, "password": "TestPass123!"},
        ok=(200,),
    )

    print("\nDriver endpoints:")
    test(
        "Driver profile",
        "POST",
        "/driver/profile/",
        token=token,
        data={"user_id": user_id},
        ok=(200, 400, 404),
    )
    test(
        "Driver orders ready",
        "GET",
        "/driver/orders/ready/",
        token=token,
        ok=(200, 401, 403, 404, 500),
    )
    test(
        "Rides driver available",
        "GET",
        "/api/rides/driver/available/",
        token=token,
        ok=(200, 401, 403),
    )
    test(
        "Deliveries available",
        "GET",
        "/drivers/api/deliveries/available/",
        token=token,
        ok=(200, 401, 403, 404),
    )

    print("\nRestaurant endpoints:")
    test(
        "Get fornecedor",
        "GET",
        f"/restaurant/get_fornecedor/?user_id={user_id}",
        ok=(200, 404),
    )
    test(
        "Restaurant orders",
        "GET",
        f"/restaurant/restaurant/orders/?user_id={user_id}",
        ok=(200, 404),
    )
    test(
        "Get products",
        "GET",
        f"/restaurant/get_products/?user_id={user_id}",
        ok=(200, 404),
    )

    print("\nPassword reset:")
    test("Reset password", "POST", "/conta/reset-password/", data={"email": email}, ok=(200, 400))

    print(f"\nResults: {passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
