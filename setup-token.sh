#!/bin/bash

echo "╔══════════════════════════════════════════════╗"
echo "║  🔐 הגדרת GitHub Token                    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "יש לך 2 אפשרויות:"
echo ""
echo "1️⃣  הגדרה קבועה (מומלץ - לא צריך להזין שוב)"
echo "2️⃣  שימוש חד-פעמי (כל פעם תצטרך להזין)"
echo ""
read -p "בחר אפשרות (1/2): " choice
echo ""

if [ "$choice" = "1" ]; then
    echo "📝 הדבק את ה-Token שלך (מתחיל ב-ghp_):"
    read -s TOKEN
    echo ""
    
    if [ -z "$TOKEN" ]; then
        echo "❌ Token ריק! נסה שוב."
        exit 1
    fi
    
    echo "🔧 מגדיר..."
    git remote set-url origin "https://amir9111:${TOKEN}@github.com/amir9111/apiryon-karaoke.git"
    
    echo ""
    echo "✅ Token הוגדר!"
    echo ""
    echo "עכשיו הרץ:"
    echo "  git push -u origin main"
    echo ""
    
elif [ "$choice" = "2" ]; then
    echo "💡 כשתריץ:"
    echo "   git push -u origin main"
    echo ""
    echo "GitHub יבקש:"
    echo "   Username: amir9111"
    echo "   Password: <הדבק את ה-Token>"
    echo ""
    echo "⚠️  בPassword - הדבק את ה-Token, לא את הסיסמה הרגילה!"
    echo ""
else
    echo "❌ בחירה לא תקינה"
    exit 1
fi

