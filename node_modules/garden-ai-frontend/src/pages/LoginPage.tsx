import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      toast.error('שגיאה בהתחברות')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-garden-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-garden-100 p-4 rounded-full">
              <Leaf className="h-12 w-12 text-garden-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">ברוכים הבאים לגנן AI</CardTitle>
          <CardDescription>
            התחבר עם חשבון Google כדי להתחיל לתכנן גינות עם בינה מלאכותית
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base"
            size="lg"
          >
            <LogIn className="h-5 w-5 ml-2" />
            התחבר עם Google
          </Button>

          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-gray-600">מה תקבל:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>✅ ניתוח תמונות גינה עם AI</li>
              <li>✅ המלצות צמחים מותאמות אישית</li>
              <li>✅ הדמיות "לפני/אחרי" מדהימות</li>
              <li>✅ סנכרון אוטומטי ליומן Google</li>
              <li>✅ ניהול פרויקטים מרוכז</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
