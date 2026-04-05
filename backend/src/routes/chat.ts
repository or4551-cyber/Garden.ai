import { Router } from 'express'
import { openai } from '../config'
import { createClient } from '@supabase/supabase-js'
import { geminiService } from '../services/gemini'

const router = Router()
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

// Chat with AI assistant
router.post('/', async (req, res) => {
  try {
    const { projectId, message, history } = req.body

    // Fetch project context
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    // Search for similar style references using embeddings
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${project?.notes || ''} ${message}`,
    })
    
    const queryEmbedding = embeddingResponse.data[0]?.embedding
    
    // Find similar garden styles from the gallery
    const { data: similarStyles } = await supabase.rpc('match_styles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 3,
    })

    // Build style context from gallery
    const styleContext = similarStyles?.length > 0
      ? `\n\nסגנונות השראה מעבודות קודמות של הגנן:\n${similarStyles.map((s: any, i: number) => 
          `${i + 1}. ${s.description} (תגיות: ${s.tags?.join(', ')})`
        ).join('\n')}`
      : ''

    // Build enhanced context-aware system prompt
    const systemPrompt = `אתה סוכן AI מומחה לתכנון גינות ועיצוב נוף בישראל. אתה עובד עם גנן מקצוען ועוזר לו לתכנן פרויקט גינון.

🎯 עקרונות מנחים (לפי סדר חשיבות):
1. **הבנת הבקשה** - קודם כל, וודא שהבנת בדיוק מה המשתמש רוצה. אם משהו לא ברור, שאל!
2. **דיוק והתאמה** - כל המלצה חייבת להיות מותאמת למיקום, אקלים, ומידות הגינה
3. **מעשיות** - רק פתרונות שגנן יכול לבצע בפועל (לא רעיונות פנטסטיים)
4. **שמירה על המקור** - הדמיות חייבות לשמור על מבנה הגינה המקורית

📋 הקשר הפרויקט:
- **שם**: ${project?.name}
- **מיקום**: ${project?.location?.address || 'לא צוין'}
- **מידות**: ${project?.dimensions ? `${project.dimensions.width}×${project.dimensions.length} ${project.dimensions.unit}` : 'לא צוינו'}
- **רצונות**: ${project?.notes || 'טרם צוינו'}

🔍 ניתוח תמונה:
${project?.analysis ? `
- **אובייקטים**: ${project.analysis.objects?.map((o: any) => o.label).join(', ') || 'לא זוהו'}
- **צמחים מומלצים**: ${project.analysis.recommendations?.slice(0, 5).map((r: any) => r.nameHebrew || r.name).join(', ') || 'אין'}
- **אקלים**: ${project.analysis.climate?.zone || 'ים תיכוני'}` : 'טרם בוצע'}
${styleContext}

� פורמט תשובה:
השתמש במבנה הבא לתשובות ברורות:

**[כותרת ראשית]**
- נקודה 1
- נקודה 2

**שאלות הבהרה** (אם נדרש):
1. שאלה ספציפית
2. שאלה נוספת

**המלצות מעשיות**:
- המלצה 1: [פירוט קצר]
- המלצה 2: [פירוט קצר]

🎓 דוגמאות לתשובות טובות:

משתמש: "אני רוצה גינה עם הרבה צל"
תשובה טובה ✅:
**הבנתי - גינה עם אזורי צל**

לפני שאמליץ, כמה שאלות:
1. האם יש עצים קיימים או צריך לשתול חדשים?
2. מה השימוש המתוכנן באזורי הצל? (ישיבה, משחקים, וכו')
3. האם יש העדפה לצמחייה ירוקה או גם פרחים?

בינתיים, בהתבסס על המיקום שלך:
- **עצי צל מומלצים**: פיקוס, אקליפטוס, שיטה
- **צמחי צל**: הוסטה, פרחי שושן, שרכים

תשובה רעה ❌:
"בטח! אני יכול לעזור. יש הרבה אפשרויות לגינה עם צל..."

⚠️ כללי זהב:
- **אל תנחש** - אם לא בטוח, שאל
- **היה ספציפי** - "שתול 3 עצי זית במרחק 4 מטר" ולא "שתול כמה עצים"
- **התייחס לאמור קודם** - אם המשתמש אמר משהו בהודעה קודמת, התייחס לזה
- **וודא התאמה** - כל צמח/חומר שאתה ממליץ חייב להתאים לאקלים ישראלי
- **הדמיה רק כשמוכן** - אל תציע הדמיה אם חסר מידע קריטי

🚫 אל תעשה:
- אל תמליץ על צמחים שלא מתאימים לאקלים הים תיכוני
- אל תציע פתרונות יקרים מדי בלי להזכיר את העלות
- אל תשנה את מבנה הגינה המקורית בהדמיות
- אל תיתן תשובות כלליות - תמיד התאם למידע הספציפי של הפרויקט`

    const reply = await geminiService.chat(
      [
        ...history,
        { role: 'user', content: message },
      ],
      systemPrompt
    )

    // Save conversation
    await supabase.from('conversations').upsert({
      project_id: projectId,
      messages: [...(history || []), { role: 'user', content: message }, { role: 'assistant', content: reply }],
      updated_at: new Date().toISOString(),
    })

    res.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process chat' })
  }
})

export default router
