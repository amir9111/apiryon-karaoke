# 📝 מדריך: איך לשנות סקריפטים ידנית

## 🎯 מטרה
מדריך זה מסביר איך לערוך את סקריפטי ה-deployment בצורה ידנית.

---

## 📂 איפה הקבצים?

הסקריפטים נמצאים בתיקייה הראשית של הפרויקט:
```
/home/user/webapp/
├── deploy-to-base44.sh          ← סקריפט עזרה ל-deployment ידני
├── check-deployment.sh          ← סקריפט בדיקת סטטוס
└── trigger-base44-deploy.sh     ← סקריפט להפעלת deployment אוטומטי
```

---

## 🛠️ שיטה 1: עריכה עם nano (קל ופשוט!)

### צעד 1: פתח את הקובץ
```bash
cd /home/user/webapp
nano deploy-to-base44.sh
```

### צעד 2: ערוך את הטקסט
- השתמש בחצים למעבר בין השורות
- מצא את השורה שצריך לשנות
- ערוך את הטקסט

### צעד 3: שמור וצא
```
Ctrl + O  → שמירה (Save)
Enter     → אישור שם הקובץ
Ctrl + X  → יציאה (Exit)
```

---

## 🛠️ שיטה 2: עריכה עם vi/vim (למתקדמים)

### צעד 1: פתח את הקובץ
```bash
cd /home/user/webapp
vi deploy-to-base44.sh
```

### צעד 2: היכנס למצב עריכה
```
לחץ: i  (Insert mode)
```

### צעד 3: ערוך את הטקסט
- השתמש בחצים למעבר
- ערוך את מה שצריך

### צעד 4: שמור וצא
```
Esc           → יציאה ממצב עריכה
:wq           → שמור וצא (Write & Quit)
Enter         → אישור
```

---

## 🛠️ שיטה 3: עריכה עם sed (אוטומטי!)

### דוגמה: שינוי URL ישן לחדש
```bash
cd /home/user/webapp

# החלף amir777 ב-apiryon-karaoke
sed -i 's|amir777|apiryon-karaoke|g' deploy-to-base44.sh
sed -i 's|amir777|apiryon-karaoke|g' check-deployment.sh
```

### הסבר הפקודה:
```
sed        = Stream EDitor (עורך זרימה)
-i         = עריכה במקום (In-place)
's|...|...|g' = החלפת טקסט
  s        = Substitute (החלף)
  |amir777|  = הטקסט הישן
  |apiryon-karaoke| = הטקסט החדש
  g        = Global (בכל השורה)
```

---

## 🛠️ שיטה 4: יצירת קובץ חדש מאפס

```bash
cd /home/user/webapp

# צור קובץ חדש עם cat
cat > deploy-to-base44.sh << 'EOF'
#!/bin/bash
echo "Base44 Deployment Helper"
echo "Repository: https://github.com/amir9111/apiryon-karaoke"
# ... שאר הסקריפט ...
EOF

# תן הרשאות הרצה
chmod +x deploy-to-base44.sh
```

---

## 📝 מה בדיוק שיניתי בשבילך?

### בקובץ: `deploy-to-base44.sh`

#### לפני (שורה 21):
```bash
echo "https://github.com/amir9111/amir777"
```

#### אחרי (שורה 21):
```bash
echo "https://github.com/amir9111/apiryon-karaoke"
```

---

### בקובץ: `check-deployment.sh`

#### לפני (שורה 59):
```bash
echo "   • GitHub: https://github.com/amir9111/amir777"
```

#### אחרי (שורה 59):
```bash
echo "   • GitHub: https://github.com/amir9111/apiryon-karaoke"
```

---

## 🔍 איך לבדוק מה השתנה?

### בדיקה 1: הצג את הקובץ
```bash
cd /home/user/webapp
cat deploy-to-base44.sh | grep github.com
```
**תוצאה צריכה להראות:**
```
echo "https://github.com/amir9111/apiryon-karaoke"
```

### בדיקה 2: בדוק git diff
```bash
cd /home/user/webapp
git log --oneline -1 9d8c8db
git show 9d8c8db
```
זה יראה לך **בדיוק** מה השתנה בקבצים.

---

## 🚨 דברים חשובים לזכור!

### 1. גיבוי לפני עריכה
```bash
# צור עותק גיבוי
cp deploy-to-base44.sh deploy-to-base44.sh.backup
```

### 2. הרשאות הרצה
אחרי עריכה, וודא שיש הרשאות:
```bash
chmod +x deploy-to-base44.sh
```

### 3. בדוק תחביר
```bash
# בדוק שאין שגיאות תחביר
bash -n deploy-to-base44.sh
```
אם אין פלט - הסקריפט תקין! ✅

### 4. Commit השינויים
```bash
cd /home/user/webapp
git add deploy-to-base44.sh
git commit -m "fix: update deployment script URL"
git push origin main
```

---

## 📋 דוגמה מלאה: שינוי ידני

```bash
# 1. נווט לתיקייה
cd /home/user/webapp

# 2. גיבוי
cp deploy-to-base44.sh deploy-to-base44.sh.backup

# 3. ערוך עם nano
nano deploy-to-base44.sh
# (ערוך מה שצריך)
# Ctrl+O, Enter, Ctrl+X

# 4. וודא הרשאות
chmod +x deploy-to-base44.sh

# 5. בדוק תחביר
bash -n deploy-to-base44.sh

# 6. הרץ לבדיקה
./deploy-to-base44.sh

# 7. Commit
git add deploy-to-base44.sh
git commit -m "fix: update script configuration"
git push origin main
```

---

## 🎓 טיפים מתקדמים

### טיפ 1: שינוי מרובה
```bash
# החלף טקסט ב-3 קבצים בבת אחת
sed -i 's|OLD_TEXT|NEW_TEXT|g' *.sh
```

### טיפ 2: גיבוי אוטומטי
```bash
# sed עם גיבוי אוטומטי
sed -i.backup 's|OLD|NEW|g' deploy-to-base44.sh
# זה יוצר: deploy-to-base44.sh.backup
```

### טיפ 3: תצוגה לפני שינוי
```bash
# ראה מה ישתנה (ללא שינוי בפועל)
sed 's|OLD|NEW|g' deploy-to-base44.sh
```

---

## 🔗 קישורים נוספים

- 📄 **Nano Editor Tutorial:** https://www.nano-editor.org/
- 📄 **Vim Tutorial:** https://www.vim.org/
- 📄 **sed Guide:** https://www.gnu.org/software/sed/manual/

---

## ✅ סיכום

**מה עשיתי בשבילך:**
1. ✅ שיניתי `amir777` → `apiryon-karaoke` בשני הסקריפטים
2. ✅ עשיתי commit ו-push ל-GitHub
3. ✅ הסקריפטים עכשיו מעודכנים ותקינים

**איך תעשה את זה בעתיד:**
1. 📝 פתח עם `nano` או `vi`
2. ✏️ ערוך את הטקסט
3. 💾 שמור וצא
4. ✅ Commit ו-Push

**הכל כבר מתוקן ועובד!** 🎉

---

**עדכון אחרון:** 6 ינואר 2026, 20:20
