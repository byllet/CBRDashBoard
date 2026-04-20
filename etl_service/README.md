python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

deactivate



curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "example_name",
    "time_from": "2024-01-01T00:00:00",
    "time_to": "2024-12-31T23:59:59",
    "location": "Moscow"
  }'