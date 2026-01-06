#!/bin/bash

echo "======================================"
echo "🔍 בדיקת מצב העדכון - Base44 App"
echo "======================================"
echo ""

echo "📦 1. בדיקת Repository:"
echo "   URL: $(git remote get-url origin)"
echo "   Branch: $(git branch --show-current)"
echo ""

echo "📝 2. Commits אחרונים:"
git log --oneline -3 --decorate
echo ""

echo "🆕 3. קבצים שהתווספו/השתנו:"
echo ""
echo "   ✅ src/components/MyQueueTracker.jsx"
ls -lh src/components/MyQueueTracker.jsx 2>/dev/null && echo "      קיים!" || echo "      ❌ לא קיים"
echo ""
echo "   ✅ src/components/MenuButton.jsx (עודכן)"
ls -lh src/components/MenuButton.jsx 2>/dev/null && echo "      קיים!" || echo "      ❌ לא קיים"
echo ""

echo "🔄 4. סטטוס Git:"
git status --short
echo ""

echo "🌐 5. GitHub Sync:"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
    echo "   ✅ מסונכרן עם GitHub!"
else
    echo "   ⚠️  יש הבדלים בין Local ל-Remote"
    echo "   Local:  $LOCAL"
    echo "   Remote: $REMOTE"
fi
echo ""

echo "======================================"
echo "💡 המלצות:"
echo "======================================"
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "❗ יש לבצע: git push origin main"
else
    echo "✅ הקוד מעודכן ב-GitHub"
    echo ""
    echo "📱 לעדכון ב-Base44:"
    echo "   1. היכנס ל: https://base44.com/dashboard"
    echo "   2. Settings → Integrations"
    echo "   3. נתק וחבר מחדש את GitHub"
    echo "   4. לחץ Deploy"
fi
echo ""

echo "🔗 קישורים שימושיים:"
echo "   • GitHub: https://github.com/amir9111/apiryon-karaoke"
echo "   • Base44: https://base44.com/dashboard"
echo ""
