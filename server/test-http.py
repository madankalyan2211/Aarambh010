import requests
import time

url = "https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com/health"

try:
    print(f"Testing {url}...")
    response = requests.get(url, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")