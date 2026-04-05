export interface Project {
  id: string
  name: string
  location: {
    lat?: number
    lng?: number
    address: string
    climateZone?: string
  }
  dimensions?: {
    width: number
    length: number
    unit: 'm' | 'ft'
    totalArea?: number
  }
  notes: string
  status: 'draft' | 'analyzing' | 'ready' | 'completed'
  imageUrl?: string
  analysis?: ImageAnalysis
  createdAt: string
  updatedAt: string
}

export interface ProjectImage {
  id: string
  projectId: string
  url: string
  type: 'upload' | 'generated'
  analysis?: ImageAnalysis
  createdAt: string
}

export interface ImageAnalysis {
  objects: DetectedObject[]
  climate: ClimateInfo
  recommendations: PlantRecommendation[]
}

export interface DetectedObject {
  type: string
  label: string
  confidence: number
  bbox: [number, number, number, number]
}

export interface ClimateInfo {
  zone: string
  temperature: {
    min: number
    max: number
    avg: number
  }
  rainfall: number
  humidity: string
  sunlight: string
  soilType?: string
}

export interface PlantRecommendation {
  name: string
  nameHebrew: string
  reason: string
  confidence: number
  careLevel: 'easy' | 'medium' | 'hard'
  sunlight: string
  waterNeeds: string
  imageUrl?: string
}

export interface StyleReference {
  id: string
  gardenerId: string
  imageUrl: string
  description: string
  tags: string[]
  embedding?: number[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  projectId: string
  messages: ChatMessage[]
  context: Record<string, unknown>
}
