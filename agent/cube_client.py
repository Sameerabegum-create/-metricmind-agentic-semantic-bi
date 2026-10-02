import os
import requests
from dotenv import load_dotenv

load_dotenv()


def query_cube(query):
    cube_api_url = os.getenv("CUBE_API_URL")
    cube_api_token = os.getenv("CUBE_API_TOKEN")

    if not cube_api_url:
        raise ValueError("CUBE_API_URL is not configured.")

    if not cube_api_token:
        raise ValueError("CUBE_API_TOKEN is not configured.")

    headers = {
        "Authorization": f"Bearer {cube_api_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        cube_api_url,
        json=query,
        headers=headers,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()