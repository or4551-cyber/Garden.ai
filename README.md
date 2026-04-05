# Garden AI Application

אפליקציית גננות חכמה עם# 🌿 Garden AI App - גנן AI

אפליקציית AI מתקדמת לתכנון גינות עם OpenAI API

## ✨ יכולות

### 🤖 AI מתקדם
- **ניתוח תמונות** - GPT-4o Vision מזהה אובייקטים וצמחים
- **המלצות צמחים** - מותאמות אישית לפי אקלים מקומי
- **סוכן AI חכם** - לומד מגלריית הסגנון שלך (29 תמונות)
- **הדמיות ריאליות** - DALL-E 3 יוצר תמונות "אחרי" מציאותיות
- **למידת סגנון** - Vector search עם embeddings

### 📊 ניהול פרויקטים
- **עמוד "הפרויקטים שלי"** - ניהול מרוכז
- **5 סטטוסים** - טיוטה → בתכנון → מאושר → בביצוע → הושלם
- **חיפוש וסינון** - מצא פרויקטים בקלות
- **היסטוריה** - כל הפרויקטים במקום אחד

### 🗺️ אינטגרציות
- **Google Maps** - הצגת מיקום + ניווט
- **זיהוי אקלים אוטומטי** - לפי קואורדינטות
- **קישורים מהירים** - Google Maps, Waze

### 📱 Mobile-First
- **PWA** - התקנה כאפליקציה
- **Responsive** - עובד מצוין במובייל
- **תפריט נייד** - ניווט נוח
- **Offline-ready** - עבודה ללא אינטרנט

## 📱 התקנת PWA

1. **פתח את האפליקציה** - בדפדפן המובייל שלך
2. **לחץ על "התקן"** - בתפריט הדפדפן
3. **אשר התקנה** - האפליקציה תותקן על המכשיר שלך

## טכנולוגיות

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend:** Node.js + Express + OpenAI API
- **Database:** Supabase (PostgreSQL + Storage)
- **AI:** GPT-4o Vision, DALL-E 3, Embeddings

## התקנה והרצה

### דרישות מקדימות

- Node.js 18+
- Docker (אופציונלי)
- חשבון Supabase
- מפתח API של OpenAI

### הרצה מקומית

```bash
# התקנת dependencies
npm install

# הגדרת משתני סביבה
cp backend/.env.example backend/.env
# ערוך את backend/.env והוסף את המפתחות שלך

# הרצה
npm run dev
```

### הרצה עם Docker

```bash
npm run docker:up
```

## API Endpoints

| Endpoint | תיאור |
|----------|-------|
| `POST /api/analyze-image` | ניתוח תמונה + זיהוי אובייקטים |
| `POST /api/chat` | שיחה עם הסוכן |
| `POST /api/visualize` | יצירת הדמיית "אחרי" |
| `POST /api/style/learn` | למידת סגנון מתמונות |

## מבנה פרויקט

```
garden-ai-app/
├── frontend/          # React אפליקציה
├── backend/           # Node.js API
├── supabase/          # Schema ו-migrations
└── docker-compose.yml
```

## רישיון

MIT
