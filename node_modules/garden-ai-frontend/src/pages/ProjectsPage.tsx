import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Calendar, MapPin, CheckCircle2, Clock, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type ProjectStatus = 'draft' | 'planning' | 'approved' | 'in-progress' | 'completed'

interface Project {
  id: string
  name: string
  location?: { address?: string }
  status: ProjectStatus
  created_at: string
  updated_at: string
  imageUrl?: string
}

const statusConfig = {
  draft: { label: 'טיוטה', color: 'bg-gray-100 text-gray-700', icon: FileText },
  planning: { label: 'בתכנון', color: 'bg-blue-100 text-blue-700', icon: Clock },
  approved: { label: 'מאושר', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'in-progress': { label: 'בביצוע', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  completed: { label: 'הושלם', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [searchQuery, statusFilter, projects])

  const loadProjects = async () => {
    try {
      // Load from localStorage for now (will be replaced with API call)
      const saved = localStorage.getItem('recentProjects')
      if (saved) {
        const recentProjects = JSON.parse(saved)
        setProjects(recentProjects)
      }
    } catch (error) {
      toast.error('שגיאה בטעינת פרויקטים')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }

  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      // Update in localStorage for now
      const updated = projects.map(p => 
        p.id === projectId ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p
      )
      setProjects(updated)
      localStorage.setItem('recentProjects', JSON.stringify(updated))
      toast.success('סטטוס עודכן בהצלחה')
    } catch (error) {
      toast.error('שגיאה בעדכון סטטוס')
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק פרויקט זה?')) return
    
    try {
      const updated = projects.filter(p => p.id !== projectId)
      setProjects(updated)
      localStorage.setItem('recentProjects', JSON.stringify(updated))
      toast.success('הפרויקט נמחק')
    } catch (error) {
      toast.error('שגיאה במחיקת פרויקט')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-garden-800">הפרויקטים שלי</h1>
          <p className="text-gray-600 mt-1">ניהול וארגון כל פרויקטי הגינון</p>
        </div>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Plus className="h-4 w-4" />
          פרויקט חדש
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חפש לפי שם או מיקום..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                הכל ({projects.length})
              </Button>
              {Object.entries(statusConfig).map(([status, config]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status as ProjectStatus)}
                  className="gap-1"
                >
                  <config.icon className="h-3 w-3" />
                  {config.label} ({projects.filter(p => p.status === status).length})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">טוען פרויקטים...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין פרויקטים</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'לא נמצאו פרויקטים התואמים את החיפוש'
                : 'התחל בפרויקט חדש כדי לראות אותו כאן'}
            </p>
            <Button onClick={() => navigate('/')}>
              <Plus className="h-4 w-4 ml-2" />
              צור פרויקט ראשון
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  {project.location?.address && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location.address}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Image */}
                  {project.imageUrl && (
                    <div 
                      className="relative h-40 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <img 
                        src={project.imageUrl} 
                        alt={project.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Status Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">סטטוס</label>
                    <select
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
                      className={`w-full px-3 py-2 rounded-md text-sm font-medium ${statusConfig[project.status].color} border-0 cursor-pointer`}
                    >
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>נוצר: {new Date(project.created_at).toLocaleDateString('he-IL')}</span>
                  </div>

                  {/* Actions */}
                  <Button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="w-full"
                    variant="outline"
                  >
                    פתח פרויקט
                  </Button>
                </CardContent>
              </Card>
          ))}
        </div>
      )}
    </div>
  )
}
