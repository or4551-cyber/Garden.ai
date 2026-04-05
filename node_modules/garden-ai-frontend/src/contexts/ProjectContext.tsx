import { createContext, useContext, useState, ReactNode } from 'react'
import type { Project } from '@/types'

interface ProjectContextType {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  projects: Project[]
  addProject: (project: Project) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project])
  }

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, projects, addProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
