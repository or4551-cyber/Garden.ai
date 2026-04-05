import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'
import HomePage from '@/pages/HomePage'
import ProjectPage from '@/pages/ProjectPage'
import ProjectsPage from '@/pages/ProjectsPage'
import StyleGalleryPage from '@/pages/StyleGalleryPage'
import LoginPage from '@/pages/LoginPage'
import DebugPage from '@/pages/DebugPage'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Routes>
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-background" dir="rtl">
                <Header />
                <main className="container mx-auto px-4 py-6">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/project/:id" element={<ProjectPage />} />
                    <Route path="/style-gallery" element={<StyleGalleryPage />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
