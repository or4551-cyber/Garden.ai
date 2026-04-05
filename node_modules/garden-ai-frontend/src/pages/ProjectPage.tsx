import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Wand2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Project, ChatMessage, PlantRecommendation } from '@/types'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import ProjectMap from '@/components/ProjectMap'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([])
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      loadProject()
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`)
      setProject(response.data)
      if (response.data.conversation) {
        setMessages(response.data.conversation.messages)
      }
      if (response.data.analysis?.recommendations) {
        setRecommendations(response.data.analysis.recommendations)
      }
    } catch (error) {
      toast.error('שגיאה בטעינת הפרויקט')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !project) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.post(`/chat`, {
        projectId: project.id,
        message: input,
        history: messages,
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error('שגיאה בשליחת ההודעה')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateVisualization = async () => {
    if (!project) return
    setIsGenerating(true)

    try {
      const response = await api.post('/visualize', {
        projectId: project.id,
        style: project.notes,
      })
      setGeneratedImage(response.data.imageUrl)
      toast.success('הדמייה נוצרה בהצלחה!')
    } catch (error) {
      toast.error('שגיאה ביצירת ההדמיה')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!project) {
    return <div className="flex justify-center p-8">טוען...</div>
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>שיחה עם הסוכן</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>שאל אותי כל שאלה לגבי הגינה שלך!</p>
                <p className="text-sm mt-2">
                  לדוגמה: &quot;איזה צמחים מתאימים לאזור חצי-צל?&quot; או &quot;מה דעתך על בריכה קטנה?&quot;
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-garden-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="הקלד הודעה..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Visualization */}
        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle>הדמיית &quot;לפני/אחרי&quot;</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={project.imageUrl}
                    alt="לפני"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={generatedImage}
                    alt="אחרי"
                  />
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {project.dimensions && (
              <p>
                <strong>מידות:</strong> {project.dimensions.width} × {project.dimensions.length} {project.dimensions.unit}
              </p>
            )}
            <p><strong>סטטוס:</strong> {project.status}</p>
          </CardContent>
        </Card>

        {/* Map */}
        <ProjectMap address={project.location?.address} />

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>המלצות צמחייה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="border rounded p-3">
                  <h4 className="font-semibold">{rec.nameHebrew} ({rec.name})</h4>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-garden-100 text-garden-800 px-2 py-1 rounded">
                      {rec.sunlight}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {rec.waterNeeds}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Button
          onClick={handleGenerateVisualization}
          disabled={isGenerating}
          className="w-full bg-garden-600 hover:bg-garden-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              יוצר הדמיה...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 ml-2" />
              צור הדמיית &quot;אחרי&quot;
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
