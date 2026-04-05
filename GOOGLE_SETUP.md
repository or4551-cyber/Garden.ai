# 🔐 הגדרת Google OAuth ו-Calendar

## שלב 1: יצירת Google Cloud Project

1. **לך ל-[Google Cloud Console](https://console.cloud.google.com)**
2. **צור פרויקט חדש**:
   - לחץ על "Select a project" → "New Project"
   - שם: "Garden AI App"
   - לחץ "Create"

## שלב 2: הפעלת APIs

1. **לך ל-APIs & Services → Library**
2. **חפש והפעל**:
   - ✅ Google Calendar API
   - ✅ Google+ API (for user info)

## שלב 3: יצירת OAuth 2.0 Credentials

1. **לך ל-APIs & Services → Credentials**
2. **לחץ "Create Credentials" → OAuth client ID**
3. **Configure consent screen** (אם נדרש):
   - User Type: External
   - App name: "גנן AI"
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
   - Scopes: Add → Google Calendar API → .../auth/calendar
   - Save and Continue

4. **Create OAuth Client ID**:
   - Application type: **Web application**
   - Name: "Garden AI Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3001`
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
     - `http://localhost:5173`
   
5. **שמור את**:
   - Client ID
   - Client Secret

## שלב 4: הגדרת Supabase Authentication

1. **לך ל-[Supabase Dashboard](https://app.supabase.com)**
2. **בחר את הפרויקט שלך**
3. **Authentication → Providers**
4. **הפעל Google**:
   - Toggle "Google Enabled" ל-ON
   - הדבק את ה-Client ID
   - הדבק את ה-Client Secret
   - Additional Scopes: `https://www.googleapis.com/auth/calendar`
   - Save

## שלב 5: הרצת SQL Schema

1. **לך ל-SQL Editor ב-Supabase**
2. **הרץ את הקובץ**: `supabase/auth-schema.sql`
3. **וודא שהטבלאות נוצרו**:
   ```sql
   SELECT * FROM public.users LIMIT 1;
   ```

## שלב 6: הגדרת משתני סביבה

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

## שלב 7: בדיקה

1. **הרץ את האפליקציה**:
   ```bash
   npm run dev
   ```

2. **פתח בדפדפן**: http://localhost:5173

3. **לחץ "התחבר עם Google"**

4. **אשר הרשאות**:
   - גישה לפרופיל
   - גישה ליומן Google

5. **בדוק שהתחברת**:
   - אמור לראות את השם והתמונה שלך בheader
   - אמור להיות מועבר לדף הבית

## 🗓️ סנכרון יומן

### איך זה עובד:

1. **כשיוצרים פרויקט חדש** → אירוע נוצר ביומן Google
2. **כשמעדכנים פרויקט** → האירוע מתעדכן
3. **כשמוחקים פרויקט** → האירוע נמחק

### צבעים ביומן:
- 🟢 פרויקטים חדשים - ירוק
- 🔔 תזכורות:
  - יום לפני - Email
  - שעה לפני - Popup

## ❓ פתרון בעיות

### "Invalid redirect URI"
- ודא שה-redirect URI ב-Google Console תואם בדיוק ל-Supabase callback URL

### "Access denied"
- ודא שהוספת את ה-Calendar scope ב-Supabase
- בדוק שהפעלת את Google Calendar API ב-Google Cloud Console

### "User not found"
- ודא שהרצת את auth-schema.sql
- בדוק שה-trigger `on_auth_user_created` קיים

### "Calendar sync failed"
- ודא שיש access token ב-users table
- בדוק שה-Google Calendar API מופעל
- ודא שהמשתמש אישר גישה ליומן

## 📚 מסמכים נוספים

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
