import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MobileMenu from './MobileMenu'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('התנתקת בהצלחה')
    } catch (error) {
      toast.error('שגיאה בהתנתקות')
    }
  }

  return (
    <>
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-garden-600" />
            <span className="text-xl font-bold text-garden-800">גנן AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-garden-600">
              בית
            </Link>
            <Link to="/projects" className="text-sm font-medium text-gray-600 hover:text-garden-600">
              הפרויקטים שלי
            </Link>
            <Link to="/style-gallery" className="text-sm font-medium text-gray-600 hover:text-garden-600">
              גלריית סגנון
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {user && (
              <div className="hidden md:flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata?.full_name || user.email}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">{user.user_metadata?.full_name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 ml-1" />
                  התנתק
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}
