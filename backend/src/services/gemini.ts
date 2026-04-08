import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
  private visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

  async chat(messages: Array<{ role: string; content: string }>, systemPrompt?: string): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: 0.7, // Lower for more focused, accurate responses
          topK: 40,
          topP: 0.9, // Slightly lower for more deterministic output
          maxOutputTokens: 3072, // More tokens for detailed responses
        },
      })

      const lastMessage = messages[messages.length - 1]
      const prompt = systemPrompt 
        ? `${systemPrompt}\n\nUser: ${lastMessage.content}`
        : lastMessage.content

      const result = await chat.sendMessage(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini chat error:', error)
      throw error
    }
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      }

      const result = await this.visionModel.generateContent([prompt, imagePart])
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini vision error:', error)
      throw error
    }
  }

  async generateStructuredResponse<T>(prompt: string, schema: string): Promise<T> {
    try {
      const fullPrompt = `${prompt}\n\nRespond ONLY with valid JSON matching this schema:\n${schema}`
      
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      return JSON.parse(jsonMatch[0]) as T
    } catch (error) {
      console.error('Gemini structured response error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
