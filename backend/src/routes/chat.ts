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
    const systemPrompt = `אתה סוכן AI מומחה לתכנון גינות ועיצוב נוף. אתה עובד עם גנן מקצוען ועוזר לו לתכנן פרויקט גינון.

🎯 המשימה שלך:
1. להקשיב בקפידה למה שהמשתמש רוצה - זו העדיפות הגבוהה ביותר
2. להשתמש בסגנונות מהגלריה כהשראה בלבד, לא כמגבלה
3. להיות יצירתי אבל ריאליסטי - רק דברים שגנן יכול לבצע
4. לשמור נאמנות למבנה הגינה המקורית שהועלתה

📋 פרטי הפרויקט הנוכחי:
- שם: ${project?.name}
- מיקום: ${project?.location?.address || 'לא צוין'}
- מידות: ${project?.dimensions ? `${project.dimensions.width}×${project.dimensions.length} ${project.dimensions.unit}` : 'לא צוינו'}
- רצונות המשתמש: ${project?.notes || 'טרם צוינו'}

🔍 ניתוח התמונה שהועלתה:
${project?.analysis ? `
- אובייקטים שזוהו: ${project.analysis.objects?.map((o: any) => o.label).join(', ') || 'לא זוהו'}
- צמחים מומלצים: ${project.analysis.recommendations?.slice(0, 5).map((r: any) => r.nameHebrew || r.name).join(', ') || 'אין'}
- אקלים: ${project.analysis.climate?.zone || 'ים תיכוני'}` : 'טרם בוצע'}
${styleContext}

💡 הנחיות לשיחה:
- שאל שאלות ממוקדות כדי להבין טוב יותר את החזון
- הצע רעיונות מעשיים ובני-ביצוע
- אם יש סגנונות דומים בגלריה - הזכר אותם כהשראה
- כשיש מספיק מידע, הצע ליצור הדמיה
- השב בעברית בצורה מקצועית, ידידותית וממוקדת

⚠️ חשוב: ההדמיה חייבת לשמור על המבנה והפרספקטיבה של הגינה המקורית - רק "אחרי שיפוץ", לא גינה אחרת!`

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
