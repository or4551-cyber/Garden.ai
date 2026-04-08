import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, MapPin, Ruler, Plus, FolderOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [location, setLocation] = useState('')
  const [dimensions, setDimensions] = useState<{ width: string; length: string; unit: 'm' | 'ft' }>({ width: '', length: '', unit: 'm' })
  const [notes, setNotes] = useState('')
  const [savedProjects, setSavedProjects] = useState<any[]>([])
  const [showGuide, setShowGuide] = useState(true)

  useEffect(() => {
    // Load saved projects from localStorage
    const saved = localStorage.getItem('recentProjects')
    if (saved) {
      setSavedProjects(JSON.parse(saved))
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
  })

  const handleCreateProject = async () => {
    if (!uploadedImage || !projectName) {
      toast.error('נא להעלות תמונה ולתת שם לפרויקט')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/projects', {
        name: projectName,
        image: uploadedImage,
        location: { address: location },
        dimensions: dimensions.width && dimensions.length ? {
          width: parseFloat(dimensions.width),
          length: parseFloat(dimensions.length),
          unit: dimensions.unit,
        } : undefined,
        notes,
        userId: user?.id,
      })

      // Save to recent projects
      const recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]')
      recentProjects.unshift({
        id: response.data.id,
        name: projectName,
        imageUrl: response.data.imageUrl,
        location: location ? { address: location } : undefined,
        status: 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      localStorage.setItem('recentProjects', JSON.stringify(recentProjects))
      
      toast.success('הפרויקט נוצר בהצלחה!')
      navigate(`/project/${response.data.id}`)
    } catch (error) {
      toast.error('שגיאה ביצירת הפרויקט')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-garden-800">תכנון גינה חכם</h1>
        <p className="text-gray-600">העלה תמונה של הגינה שלך ותן ל-AI לעזור לתכנן</p>
      </div>

      {/* Step-by-step guide */}
      {showGuide && (
        <Card className="bg-gradient-to-r from-garden-50 to-green-50 border-garden-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">איך זה עובד? 3 שלבים פשוטים</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-garden-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">העלה תמונת גינה</h3>
                  <p className="text-sm text-gray-600">צלם את הגינה הנוכחית שלך והעלה כאן</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-garden-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">שוחח עם הסוכן</h3>
                  <p className="text-sm text-gray-600">ספר מה אתה רוצה - בריכה, דשא, פינת ישיבה...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-garden-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">קבל הדמיה</h3>
                  <p className="text-sm text-gray-600">לחץ "צור הדמיה" וראה איך הגינה תיראה!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      {savedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-garden-600" />
              <CardTitle>פרויקטים אחרונים</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {savedProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-garden-500 transition-all"
                >
                  {project.imageUrl && (
                    <img 
                      src={project.imageUrl} 
                      alt={project.name}
                      className="w-full h-24 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <p className="text-white text-xs font-medium truncate w-full">{project.name}</p>
                  </div>
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-white drop-shadow" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>פרויקט חדש</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Image */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              uploadedImage ? 'border-garden-500 bg-garden-50' : 'border-gray-300 hover:border-garden-400'
            }`}
          >
            <input {...getInputProps()} />
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded garden"
                  className="max-h-64 mx-auto rounded-lg object-cover"
                />
                <p className="mt-2 text-sm text-garden-600">לחץ לשינוי תמונה</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">גרור תמונה לכאן או לחץ לבחירה</p>
                <p className="text-xs text-gray-400">PNG, JPG עד 10MB</p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם הפרויקט *</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="למשל: גינת האחורית של משפחת כהן"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline ml-1" />
                מיקום
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="כתובת או עיר"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label>
              <Ruler className="h-4 w-4 inline ml-1" />
              מידות הגינה (אופציונלי)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="רוחב"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
              />
              <span className="self-center">×</span>
              <Input
                type="number"
                placeholder="אורך"
                value={dimensions.length}
                onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
              />
              <select
                value={dimensions.unit}
                onChange={(e) => setDimensions({ ...dimensions, unit: e.target.value as 'm' | 'ft' })}
                className="border rounded px-2"
              >
                <option value="m">מטרים</option>
                <option value="ft">רגל</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות והעדפות</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="תאר את החזון שלך, מה חשוב לך בגינה, תקציב, סגנון מועדף..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleCreateProject}
            disabled={isLoading || !uploadedImage || !projectName}
            className="w-full bg-garden-600 hover:bg-garden-700"
          >
            {isLoading ? (
              'מעבד...'
            ) : (
              <>
                <Plus className="h-4 w-4 ml-2" />
                צור פרויקט ונתח
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
