import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  'https://vkptkaindxknyoqbwtba.supabase.co',
  'sb_publishable_BF4Ariej5RrApZgchXRthw_dj557SUM'
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
})

const picsFolder = path.join(__dirname, '..', '..', 'pics for charecter')

const imageDescriptions = {
  'WhatsApp Image 2026-03-28 at 16.24.11.jpeg': {
    desc: 'גינה ים תיכונית עם בריכה ודק עץ',
    tags: ['בריכה', 'דק', 'ים תיכוני', 'גינה אחורית']
  },
  'גינה1.jpg': {
    desc: 'גינה יפה עם צמחייה מגוונת ומקומות ישיבה',
    tags: ['ישיבה', 'צמחייה', 'גינה']
  },
  'גינה2.jpg': {
    desc: 'גינת בריכה מעוצבת עם צמחייה טרופית',
    tags: ['בריכה', 'טרופי', 'עיצוב']
  },
  'גינת גג1.jpg': {
    desc: 'גינת גג עם צמחים באדניות וריצוף עץ',
    tags: ['גג', 'אדניות', 'עץ', 'עירוני']
  },
  'גנית גג3.jpg': {
    desc: 'גינת גג מעוצבת עם ריהוט גן וצמחייה',
    tags: ['גג', 'ריהוט גן', 'עיצוב עירוני']
  },
  'לפני אחרי בריכה.jpg': {
    desc: 'התמרת גינה - לפני ואחרי בריכה',
    tags: ['לפני אחרי', 'בריכה', 'התמרה']
  },
  'לפני אחרי.jpg': {
    desc: 'שיפוץ גינה - השוואת לפני ואחרי',
    tags: ['לפני אחרי', 'שיפוץ', 'עיצוב']
  },
  'עדנית גג יפה1.jpg': {
    desc: 'גינת גג עם פרחים וצמחייה מטופחת',
    tags: ['גג', 'פרחים', 'מטופח']
  },
  'שגיא בעבודה1.jpg': {
    desc: 'גנן בעבודה על גינה חדשה',
    tags: ['עבודה', 'גנן', 'תהליך']
  }
}

async function uploadImages() {
  const files = fs.readdirSync(picsFolder).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  )
  
  console.log(`Found ${files.length} images to upload`)
  
  for (const file of files) {
    try {
      const filePath = path.join(picsFolder, file)
      const buffer = fs.readFileSync(filePath)
      
      // Sanitize filename - remove Hebrew, spaces, special chars
      const sanitizedName = file
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII (Hebrew)
        .replace(/\s+/g, '-')          // Replace spaces with dashes
        .replace(/[^a-zA-Z0-9.-]/g, '') // Remove special chars
        .replace(/-+/g, '-')           // Remove multiple dashes
      
      // Upload to Supabase Storage
      const imageId = `${Date.now()}-${sanitizedName || 'image.jpg'}`
      const { error: uploadError } = await supabase.storage
        .from('style-references')
        .upload(imageId, buffer, {
          contentType: 'image/jpeg',
        })
      
      if (uploadError) {
        console.error(`Error uploading ${file}:`, uploadError)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('style-references')
        .getPublicUrl(imageId)
      
      // Get description and tags
      const info = imageDescriptions[file] || {
        desc: `תמונת גינה - ${file}`,
        tags: ['גינה', 'עיצוב']
      }
      
      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `${info.desc}. Tags: ${info.tags.join(', ')}`,
      })
      
      const embedding = embeddingResponse.data[0]?.embedding
      
      // Insert into database
      const { error: dbError } = await supabase.from('style_references').insert({
        image_url: publicUrl,
        description: info.desc,
        tags: info.tags,
        embedding,
        created_at: new Date().toISOString(),
      })
      
      if (dbError) {
        console.error(`Error inserting ${file}:`, dbError)
        continue
      }
      
      console.log(`✅ Uploaded: ${file}`)
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }
  
  console.log('\n🎉 All images uploaded successfully!')
}

uploadImages().catch(console.error)
