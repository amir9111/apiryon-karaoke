#!/bin/bash

echo "🔥 מכפה Deploy ב-Base44..."
echo ""

# יצירת commit ריק שיטריגר את ה-Webhook
git commit --allow-empty -m "chore: Trigger Base44 deployment [$(date '+%Y-%m-%d %H:%M')]"

echo "✅ Commit נוצר!"
echo ""

# Push ל-GitHub
git push origin main

echo ""
echo "✅ Push הצליח!"
echo ""
echo "📡 Base44 אמור לזהות את השינוי ולהתחיל Deploy אוטומטי..."
echo ""
echo "⏱️  המתן 2-3 דקות ובדוק:"
echo "   https://base44.com/dashboard"
echo ""
echo "🔍 חפש:"
echo "   ✓ Deployment Logs → 'Fetching from GitHub'"
echo "   ✓ Last Deploy → תאריך היום"
echo ""
