import { Router } from 'express'
import { openai, supabase } from '../config'

const router = Router()

// Generate visualization with DALL-E 3
router.post('/', async (req, res) => {
  try {
    const { projectId, style } = req.body

    // Fetch project with conversation
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, project_images(*)')
      .eq('id', projectId)
      .single()

    if (error) throw error

    // Fetch conversation for context
    const { data: conversation } = await supabase
      .from('conversations')
      .select('messages')
      .eq('project_id', projectId)
      .single()

    const originalImage = project.project_images?.find((i: { type: string }) => i.type === 'upload')
    
    if (!originalImage) {
      return res.status(400).json({ error: 'No original image found' })
    }

    // Extract user preferences from conversation
    const userMessages = conversation?.messages
      ?.filter((m: any) => m.role === 'user')
      .map((m: any) => m.content)
      .join(' ') || ''

    // Build realistic, practical prompt for DALL-E 3
    const prompt = `Realistic garden renovation photograph - AFTER transformation.

CRITICAL: This must look like a REAL garden that a professional landscaper can actually build. Not fantasy or CGI.

Current state: ${project.notes || 'Garden needs renovation'}
Location: ${project.location?.address || 'Israel, Mediterranean climate'}
Dimensions: ${project.dimensions ? `${project.dimensions.width}x${project.dimensions.length}m` : 'Medium sized garden'}

Based on conversation with client:
${userMessages.substring(0, 300)}

Recommended plants from analysis: ${project.analysis?.recommendations?.slice(0, 5).map((r: any) => r.nameHebrew || r.name).join(', ') || 'Mediterranean plants'}

REQUIREMENTS FOR REALISTIC RESULT:
- Photograph quality: Professional real estate photography
- Plants: Only realistic, commonly available garden plants
- Hardscape: Practical materials (pavers, gravel, wood deck)
- Scale: Everything must be proportional and buildable
- Lighting: Natural daylight, realistic shadows
- Style: ${style || 'Clean Mediterranean garden design'}
- NO fantasy elements, NO impossible structures
- Must look like it could be in a landscaping portfolio

Create a beautiful but ACHIEVABLE garden transformation.`

    // Generate with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    })

    const generatedUrl = response.data?.[0]?.url

    if (generatedUrl) {
      // Save generated image reference
      await supabase.from('project_images').insert({
        project_id: projectId,
        url: generatedUrl,
        type: 'generated',
        prompt: prompt,
        created_at: new Date().toISOString(),
      })
    }

    res.json({ imageUrl: generatedUrl })
  } catch (error) {
    console.error('Visualization error:', error)
    res.status(500).json({ error: 'Failed to generate visualization' })
  }
})

export default router
