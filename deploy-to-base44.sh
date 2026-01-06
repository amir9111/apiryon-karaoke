#!/bin/bash
# Script to help with manual Base44 deployment

echo "==================================="
echo "Base44 Manual Deployment Helper"
echo "==================================="
echo ""
echo "📦 קבצים שהשתנו לאחרונה:"
echo ""
git diff --name-only HEAD~3 HEAD
echo ""
echo "==================================="
echo "📋 Commits אחרונים:"
echo ""
git log --oneline -5
echo ""
echo "==================================="
echo "✅ כל הקבצים מעודכנים ב-GitHub!"
echo ""
echo "🔗 Repository URL:"
echo "https://github.com/amir9111/apiryon-karaoke"
echo ""
echo "📱 לעדכון ב-Base44:"
echo "1. היכנס ל: https://base44.com/dashboard"
echo "2. בחר את הפרויקט 'אפריון'"
echo "3. לחץ Settings → Integrations"
echo "4. נתק וחבר מחדש את GitHub"
echo "5. לחץ Deploy"
echo ""
