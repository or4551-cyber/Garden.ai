import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { openai, supabase } from '../config'
import { geminiService } from '../services/gemini'

const router = Router()

// Create project with image analysis
router.post('/', async (req, res) => {
  try {
    const { name, image, location, dimensions, notes, userId } = req.body

    if (!name || !image) {
      return res.status(400).json({ error: 'Name and image are required' })
    }

    // Create project record
    const projectId = uuidv4()
    const project: any = {
      id: projectId,
      name,
      location,
      dimensions,
      notes,
      status: 'analyzing',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add user_id only if provided
    if (userId) {
      project.user_id = userId
    }

    // Save to Supabase
    const { error: projectError } = await supabase.from('projects').insert(project)
    if (projectError) throw projectError

    // Save image
    const imageId = uuidv4()
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(`${projectId}/${imageId}.jpg`, buffer, {
        contentType: 'image/jpeg',
      })
    
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(`${projectId}/${imageId}.jpg`)

    // Save image record
    const { error: imageError } = await supabase.from('project_images').insert({
      id: imageId,
      project_id: projectId,
      url: publicUrl,
      type: 'upload',
      created_at: new Date().toISOString(),
    })
    if (imageError) throw imageError

    // Analyze image with GPT-4o Vision
    const analysis = await analyzeImage(image, location)

    // Update project with analysis
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'ready',
        analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
    
    if (updateError) throw updateError

    res.json({
      ...project,
      imageUrl: publicUrl,
      analysis,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    const { data: images } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', id)

    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('project_id', id)
      .single()

    res.json({
      ...project,
      images,
      conversation,
      imageUrl: images?.find((i: { type: string }) => i.type === 'upload')?.url,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

async function analyzeImage(base64Image: string, location: { address?: string }) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  
  const prompt = `אתה מומחה גננות ותכנון גינות. נתח את התמונה והמלץ על צמחייה מתאימה.

${location?.address ? `מיקום הפרויקט: ${location.address}` : ''}

החזר JSON בפורמט המדויק הזה:
{
  "objects": [{"type": "string", "label": "string", "confidence": 0.9}],
  "climate": {"zone": "ים תיכוני", "temperature": {"min": 10, "max": 35, "avg": 22}, "rainfall": 500, "humidity": "בינונית", "sunlight": "מלא"},
  "recommendations": [{"name": "Lavender", "nameHebrew": "לבנדר", "reason": "עמיד בבצורת ומתאים לאקלים", "confidence": 0.9, "careLevel": "easy", "sunlight": "מלא", "waterNeeds": "מעט"}]
}`

  const responseText = await geminiService.analyzeImage(base64Data, prompt)
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in Gemini response')
  }
  
  return JSON.parse(jsonMatch[0])
}

export default router
