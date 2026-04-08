import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import projectRoutes from './routes/projects'
import chatRoutes from './routes/chat'
import visualizeRoutes from './routes/visualize'
import styleRoutes from './routes/style'

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://garden-ai-planner.netlify.app'
  ],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))

// Routes
app.use('/api/projects', projectRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/visualize', visualizeRoutes)
app.use('/api/style', styleRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
