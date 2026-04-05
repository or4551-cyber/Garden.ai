import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectMapProps {
  address?: string
  onLocationUpdate?: (coords: { lat: number; lng: number }, climateZone: string) => void
}

export default function ProjectMap({ address, onLocationUpdate }: ProjectMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [climateZone, setClimateZone] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (address) {
      geocodeAddress(address)
    }
  }, [address])

  const geocodeAddress = async (addr: string) => {
    setIsLoading(true)
    try {
      // Using OpenStreetMap Nominatim (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
        setCoordinates(coords)
        
        // Detect climate zone based on coordinates
        const zone = detectClimateZone(coords.lat, coords.lng)
        setClimateZone(zone)
        
        if (onLocationUpdate) {
          onLocationUpdate(coords, zone)
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const detectClimateZone = (lat: number, lng: number): string => {
    // Israel climate zones based on latitude/longitude
    // This is a simplified version - can be enhanced
    
    if (lat >= 32.5 && lat <= 33.3 && lng >= 34.7 && lng <= 35.6) {
      return 'ים תיכוני - מרכז הארץ'
    } else if (lat >= 31.2 && lat <= 31.8) {
      return 'מדברי - דרום'
    } else if (lat >= 32.7 && lat <= 33.3) {
      return 'הררי - צפון'
    } else if (lng >= 35.0 && lng <= 35.6) {
      return 'ים תיכוני - חוף'
    }
    
    return 'ים תיכוני'
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            מיקום
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">לא צוין מיקום לפרויקט</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          מיקום הפרויקט
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-garden-600 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium">{address}</p>
            {climateZone && (
              <p className="text-sm text-gray-600">אזור אקלים: {climateZone}</p>
            )}
          </div>
        </div>

        {/* Map placeholder - will show interactive map when Google Maps API key is added */}
        {isLoading ? (
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">טוען מפה...</p>
          </div>
        ) : coordinates ? (
          <div className="space-y-2">
            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 mx-auto text-garden-600" />
                <p className="text-sm font-medium">מיקום זוהה</p>
                <p className="text-xs text-gray-600">
                  {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </p>
                <p className="text-xs text-gray-500 max-w-xs">
                  💡 טיפ: הוסף Google Maps API key ב-.env כדי להציג מפה אינטראקטיבית
                </p>
              </div>
            </div>
            
            {/* Quick links */}
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-garden-600 hover:underline"
              >
                פתח ב-Google Maps ↗
              </a>
              <a
                href={`https://www.waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-garden-600 hover:underline"
              >
                נווט ב-Waze ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">לא ניתן למצוא את המיקום</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
