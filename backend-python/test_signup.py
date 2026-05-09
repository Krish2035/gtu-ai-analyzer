import urllib.request
import json
import urllib.error

data = {
    "name": "Test User",
    "enrollment": "1234567890",
    "email": "test@example.com",
    "password": "password123"
}

req = urllib.request.Request(
    'http://localhost:8001/api/auth/signup',
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Status Code:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Connection error:", e)
