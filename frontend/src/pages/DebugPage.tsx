export default function DebugPage() {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET ✅' : 'MISSING ❌',
    VITE_API_URL: import.meta.env.VITE_API_URL || 'Not set',
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🔍 Debug Info</h1>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h2 className="font-bold text-lg mb-2">✅ האתר עובד!</h2>
            <p>אם אתה רואה את המסך הזה - React עובד תקין</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="font-bold text-lg mb-2">🔧 Environment Variables</h2>
            <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-auto" dir="ltr">
              {JSON.stringify(env, null, 2)}
            </pre>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h2 className="font-bold text-lg mb-2">📱 Device Info</h2>
            <div className="text-sm space-y-1">
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Screen:</strong> {window.screen.width} x {window.screen.height}</p>
              <p><strong>Window:</strong> {window.innerWidth} x {window.innerHeight}</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <h2 className="font-bold text-lg mb-2">🌐 Location</h2>
            <div className="text-sm space-y-1">
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>Origin:</strong> {window.location.origin}</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <a 
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              חזור לאפליקציה
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
