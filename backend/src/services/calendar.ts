import { google } from 'googleapis'

interface CalendarEvent {
  projectId: string
  projectName: string
  location?: string
  startDate: Date
  endDate?: Date
  description?: string
}

export class GoogleCalendarService {
  private oauth2Client: any

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  async createProjectEvent(event: CalendarEvent): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const calendarEvent = {
      summary: `🌿 ${event.projectName}`,
      location: event.location || '',
      description: event.description || `פרויקט גינון - ${event.projectName}\n\nנוצר באפליקציית גנן AI`,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'Asia/Jerusalem',
      },
      end: {
        dateTime: (event.endDate || new Date(event.startDate.getTime() + 3600000)).toISOString(),
        timeZone: 'Asia/Jerusalem',
      },
      colorId: '10', // Green color
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
    })

    return response.data.id || ''
  }

  async updateProjectEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const updateData: any = {}

    if (event.projectName) {
      updateData.summary = `🌿 ${event.projectName}`
    }

    if (event.location) {
      updateData.location = event.location
    }

    if (event.description) {
      updateData.description = event.description
    }

    if (event.startDate) {
      updateData.start = {
        dateTime: event.startDate.toISOString(),
        timeZone: 'Asia/Jerusalem',
      }
    }

    if (event.endDate) {
      updateData.end = {
        dateTime: event.endDate.toISOString(),
        timeZone: 'Asia/Jerusalem',
      }
    }

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: updateData,
    })
  }

  async deleteProjectEvent(eventId: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    })
  }

  async listUpcomingProjects(maxResults: number = 10): Promise<any[]> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'גנן AI', // Search for our app events
    })

    return response.data.items || []
  }
}
