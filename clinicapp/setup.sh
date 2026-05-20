#!/bin/bash
echo "=== BẮT ĐẦU SETUP CLINIC APP ==="

python manage.py migrate

python seed_data.py

echo "=== Sẵn sàng==="
