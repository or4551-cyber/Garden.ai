import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'

export default function StyleGalleryPage() {
  const [images, setImages] = useState<Array<{ file: File; preview: string; description: string; tags: string }>>([])
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        description: '',
        tags: '',
      }))
      setImages((prev) => [...prev, ...newImages])
    },
  })

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, field: 'description' | 'tags', value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    )
  }

  const handleUpload = async () => {
    if (images.length === 0) {
      toast.error('נא להעלות לפחות תמונה אחת')
      return
    }

    setIsUploading(true)
    try {
      for (const image of images) {
        const formData = new FormData()
        formData.append('image', image.file)
        formData.append('description', image.description)
        formData.append('tags', image.tags)

        await api.post('/style/learn', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      toast.success(`${images.length} תמונות נשמרו בהצלחה!`)
      setImages([])
    } catch (error) {
      toast.error('שגיאה בהעלאת התמונות')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-garden-800">גלריית סגנון</h1>
        <p className="text-gray-600">
          העלה תמונות מעבודות קודמות שלך. ה-AI ילמד את הסגנון והטעם שלך וישתמש בו בהמלצות ובהדמיות.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>העלאת תמונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-garden-400 transition-colors"
          >
            <input {...getInputProps()} />
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">גרור תמונות לכאן או לחץ לבחירה</p>
            <p className="text-xs text-gray-400">ניתן להעלות מספר תמונות בבת אחת</p>
          </div>

          {/* Preview Images */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">תמונות להעלאה ({images.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Label className="text-xs">תיאור</Label>
                        <Input
                          value={image.description}
                          onChange={(e) => updateImage(index, 'description', e.target.value)}
                          placeholder="למשל: גינת בריכה בסגנון ים תיכוני"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">תגיות (מופרדות בפסיקים)</Label>
                        <Input
                          value={image.tags}
                          onChange={(e) => updateImage(index, 'tags', e.target.value)}
                          placeholder="למשל: בריכה, דק, צמחייה טרופית"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-garden-600 hover:bg-garden-700"
              >
                {isUploading ? (
                  'מעלה...'
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    שמור לגלריה
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-garden-50 border-garden-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-garden-800 mb-2">טיפים להעלאה אפקטיבית</h4>
          <ul className="text-sm text-garden-700 space-y-1 list-disc list-inside">
            <li>העלה תמונות באיכות גבוהה (HD או טוב יותר)</li>
            <li>כלול מגוון סגנונות: גינות צל, שמש, בריכות, דקים...</li>
            <li>תאר כל תמונה בפירוט כדי לעזור ל-AI להבין את הסגנון</li>
            <li>הוסף תגיות רלוונטיות לסינון עתידי</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
