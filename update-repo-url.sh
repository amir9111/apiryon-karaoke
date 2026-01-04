#!/bin/bash
echo "========================================="
echo "🔧 עדכון כתובת Repository"
echo "========================================="
echo ""
echo "הכתובת הנוכחית:"
git remote get-url origin
echo ""
echo "אם השם השתנה, הרץ:"
echo "git remote set-url origin https://github.com/USER/NEW-REPO.git"
echo ""
