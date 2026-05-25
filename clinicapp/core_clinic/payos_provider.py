import hashlib
import hmac
import json
import requests


class PayOSProvider:
    def __init__(self, client_id, api_key, checksum_key):
        self.client_id = client_id
        self.api_key = api_key
        self.checksum_key = checksum_key
        self.base_url = "https://api-merchant.payos.vn/v2/payment-requests"

    def create_payment_link(self, order_code, amount, description, return_url, cancel_url):
        data = {
            "orderCode": int(order_code),
            "amount": int(amount),
            "description": description[:25],
            "returnUrl": return_url,
            "cancelUrl": cancel_url
        }

        sorted_data = f"amount={data['amount']}&cancelUrl={data['cancelUrl']}&description={data['description']}&orderCode={data['orderCode']}&returnUrl={data['returnUrl']}"

        signature = hmac.new(
            self.checksum_key.encode('utf-8'),
            sorted_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        data["signature"] = signature

        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }

        response = requests.post(self.base_url, json=data, headers=headers)
        res_json = response.json()

        if res_json.get("code") == "00":
            return res_json.get("data", {}).get("checkoutUrl")
        return None