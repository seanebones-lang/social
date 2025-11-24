#!/bin/bash

echo "🧪 Testing Pulse Social Deployment"
echo "===================================="
echo ""

BASE_URL="https://social.mothership-ai.com"

echo "1. Testing Landing Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Landing page: OK ($STATUS)"
else
    echo "   ❌ Landing page: FAILED ($STATUS)"
fi

echo ""
echo "2. Testing Pricing Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/pricing)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Pricing page: OK ($STATUS)"
else
    echo "   ❌ Pricing page: FAILED ($STATUS)"
fi

echo ""
echo "3. Testing Sign Up Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/signup)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Sign up page: OK ($STATUS)"
else
    echo "   ❌ Sign up page: FAILED ($STATUS)"
fi

echo ""
echo "4. Testing Sign In Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/signin)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Sign in page: OK ($STATUS)"
else
    echo "   ❌ Sign in page: FAILED ($STATUS)"
fi

echo ""
echo "5. Testing Stripe Webhook Endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/stripe/webhook)
if [ "$STATUS" = "400" ]; then
    echo "   ✅ Webhook endpoint: OK (400 = signature required, endpoint working)"
else
    echo "   ⚠️  Webhook endpoint: Status $STATUS"
fi

echo ""
echo "6. Testing Late API Key..."
LATE_RESPONSE=$(curl -s -H "Authorization: Bearer sk_8df0f8a562160cf0bb0dcec76a546a734b720bae3123743bf098af6521facaf5" https://getlate.dev/api/v1/usage-stats)
if echo "$LATE_RESPONSE" | grep -q "postsCreated"; then
    echo "   ✅ Late API key: WORKING"
else
    echo "   ❌ Late API key: FAILED"
fi

echo ""
echo "===================================="
echo "✅ Deployment Test Complete"
echo ""
echo "Your site is live at: $BASE_URL"

