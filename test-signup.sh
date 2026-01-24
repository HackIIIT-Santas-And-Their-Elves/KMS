#!/bin/bash

# Test Canteen Registration
echo "🧪 Testing Canteen Registration..."
echo ""

TIMESTAMP=$(date +%s%N | cut -b1-13)
EMAIL="canteen.test${TIMESTAMP}@example.com"

echo "📧 Email: $EMAIL"
echo ""

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Canteen Owner\",
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"role\": \"CANTEEN\",
    \"canteenName\": \"Test Canteen $TIMESTAMP\",
    \"canteenLocation\": \"Building A, Ground Floor\"
  }" 2>/dev/null | python3 -m json.tool

echo ""
echo "---"
echo ""

# Test Student Registration
echo "🧪 Testing Student Registration..."
TIMESTAMP2=$(date +%s%N | cut -b1-13)
EMAIL2="student.test${TIMESTAMP2}@example.com"

echo "📧 Email: $EMAIL2"
echo ""

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Student\",
    \"email\": \"$EMAIL2\",
    \"password\": \"password123\",
    \"role\": \"STUDENT\"
  }" 2>/dev/null | python3 -m json.tool

echo ""
echo "---"
echo ""

# Test Admin Registration
echo "🧪 Testing Admin Registration..."
TIMESTAMP3=$(date +%s%N | cut -b1-13)
EMAIL3="admin.test${TIMESTAMP3}@example.com"

echo "📧 Email: $EMAIL3"
echo ""

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Admin\",
    \"email\": \"$EMAIL3\",
    \"password\": \"password123\",
    \"role\": \"ADMIN\"
  }" 2>/dev/null | python3 -m json.tool

echo ""
echo "✅ All tests completed"
