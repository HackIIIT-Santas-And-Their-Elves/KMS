#!/bin/bash

echo "🔍 Verifying KMS Unified App Setup..."
echo ""

# Check if all required files exist
echo "✅ Checking core files..."
files=(
    "App.js"
    "app.json"
    "babel.config.js"
    "package.json"
    "src/navigation/AppNavigator.js"
    "src/context/AuthContext.js"
    "src/context/CartContext.js"
    "src/screens/LoginScreen.js"
    "src/screens/RegisterScreen.js"
    "src/config/api.js"
    "src/services/api.js"
    "src/constants/colors.js"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ MISSING: $file"
        ((missing++))
    fi
done

if [ $missing -eq 0 ]; then
    echo ""
    echo "✅ All core files present!"
else
    echo ""
    echo "❌ Missing $missing files!"
fi

# Check dependencies
echo ""
echo "✅ Checking dependencies..."
deps=(
    "react-native"
    "expo"
    "@react-navigation/native"
    "@react-navigation/stack"
    "@react-navigation/bottom-tabs"
    "react-native-svg"
    "react-native-qrcode-svg"
    "@react-native-async-storage/async-storage"
    "axios"
)

if [ -d "node_modules" ]; then
    echo "  ✓ node_modules exists"
    missing_deps=0
    for dep in "${deps[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo "  ✓ $dep"
        else
            echo "  ✗ MISSING: $dep"
            ((missing_deps++))
        fi
    done
    
    if [ $missing_deps -eq 0 ]; then
        echo ""
        echo "✅ All dependencies installed!"
    else
        echo ""
        echo "⚠️  Missing $missing_deps dependencies - Run: npm install"
    fi
else
    echo "  ✗ node_modules not found - Run: npm install"
fi

# Count screens
echo ""
echo "✅ Checking screens..."
screen_count=$(ls -1 src/screens/*.js 2>/dev/null | wc -l)
echo "  📱 Total screens: $screen_count"
if [ $screen_count -ge 15 ]; then
    echo "  ✓ All screens present"
else
    echo "  ✗ Expected ~16 screens, found $screen_count"
fi

echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Edit src/config/api.js to set your backend URL"
echo "  2. Run: npm start"
echo "  3. Scan QR code with Expo Go on your phone"
