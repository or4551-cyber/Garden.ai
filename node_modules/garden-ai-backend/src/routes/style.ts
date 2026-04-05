import { Router } from 'express'
import multer from 'multer'
import { openai, supabase } from '../config'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// Learn style from uploaded images
router.post('/learn', upload.single('image'), async (req, res) => {
  try {
    const { description, tags } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    // Upload to Supabase Storage
    const imageId = `${Date.now()}-${file.originalname}`
    const { error: uploadError } = await supabase.storage
      .from('style-references')
      .upload(imageId, file.buffer, {
        contentType: file.mimetype,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('style-references')
      .getPublicUrl(imageId)

    // Generate embedding for the style
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: `${description}. Tags: ${tags}`,
    })

    const embedding = embeddingResponse.data[0]?.embedding

    // Save to database
    const { error: dbError } = await supabase.from('style_references').insert({
      image_url: publicUrl,
      description,
      tags: tags.split(',').map((t: string) => t.trim()),
      embedding,
      created_at: new Date().toISOString(),
    })

    if (dbError) throw dbError

    res.json({ 
      success: true, 
      imageUrl: publicUrl,
      message: 'Style reference saved successfully'
    })
  } catch (error) {
    console.error('Style learning error:', error)
    res.status(500).json({ error: 'Failed to save style reference' })
  }
})

// Get style recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ error: 'Query required' })
    }

    // Generate embedding for query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query as string,
    })

    const queryEmbedding = embeddingResponse.data[0]?.embedding

    // Search similar styles using Supabase vector search
    const { data: styles, error } = await supabase.rpc('match_styles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
    })

    if (error) throw error

    res.json({ styles })
  } catch (error) {
    console.error('Style search error:', error)
    res.status(500).json({ error: 'Failed to fetch style recommendations' })
  }
})

export default router
