import os
import json
import requests
from requests_aws4auth import AWS4Auth


API_ENDPOINT = os.getenv('API_ENDPOINT')


def test_signed(event, context):
    access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    session_token = os.getenv('AWS_SESSION_TOKEN')
    region = os.getenv('AWS_REGION')

    auth = AWS4Auth(access_key_id, secret_access_key, region, 'execute-api', session_token=session_token)
    response = requests.get(API_ENDPOINT, auth=auth)

    result = "Success" if response.status_code == 200 else "failure! we wanted 200"
    return f'Got http status {response.status_code}: {result}'


def test_unsigned(event, context):
    response = requests.get(API_ENDPOINT)

    result = "Success" if response.status_code == 403 else "Failure as we wanted 403"
    return f'Got http status {response.status_code}: {result}'
